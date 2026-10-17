const { expect } = require('chai');
const sinon = require('sinon');
const PatientQueryBuilder = require('../builders/PatientQueryBuilder');

describe('PatientQueryBuilder', () => {
  it('returns an empty MongoDB filter when no criteria are supplied', () => {
    expect(new PatientQueryBuilder().build()).to.deep.equal({});
  });

  it('creates a case-insensitive partial name match', () => {
    const query = new PatientQueryBuilder().setName('  smITh  ').build();
    expect(query.name).to.be.instanceOf(RegExp);
    expect(query.name.test('Jane Smith')).to.equal(true);
    expect(query.name.test('Jane Jones')).to.equal(false);
  });

  it('escapes regex characters so search text is treated literally', () => {
    const query = new PatientQueryBuilder().setName('Ann.*').build();
    expect(query.name.test('Ann.* Smith')).to.equal(true);
    expect(query.name.test('Annie Smith')).to.equal(false);
  });

  it('builds quick search as name OR partial patient ID', () => {
    const query = new PatientQueryBuilder().setSearch('ABC123').build();
    expect(query.$or).to.have.lengthOf(2);
    expect(query.$or[0].name.test('abc123 Jones')).to.equal(true);
    expect(query.$or[1].$expr.$regexMatch.input).to.deep.equal({ $toString: '$_id' });
    expect(query.$or[1].$expr.$regexMatch.regex).to.equal('ABC123');
    expect(query.$or[1].$expr.$regexMatch.options).to.equal('i');
  });

  it('builds a partial case-insensitive patient ID filter', () => {
    const query = new PatientQueryBuilder().setId('6A925').build();
    expect(query.$expr.$regexMatch.regex).to.equal('6A925');
    expect(query.$expr.$regexMatch.options).to.equal('i');
  });

  it('matches gender exactly while ignoring case', () => {
    const query = new PatientQueryBuilder().setGender('female').build();
    expect(query.gender.test('Female')).to.equal(true);
    expect(query.gender.test('female-other')).to.equal(false);
  });

  it('uses an ObjectId for ward filtering', () => {
    const wardId = '6a92531249c3071d44e1e58a';
    const query = new PatientQueryBuilder().setWard(wardId).build();
    expect(query.ward.toHexString()).to.equal(wardId);
  });

  it('rejects a ward that is not a 24-character hexadecimal ObjectId', () => {
    expect(() => new PatientQueryBuilder().setWard('Cardiology').build())
      .to.throw('Invalid ward ID');
  });

  it('builds a partial medication-name match', () => {
    const query = new PatientQueryBuilder().setMedication('warF').build();
    expect(query['medications.name'].test('Warfarin')).to.equal(true);
    expect(query['medications.name'].test('Aspirin')).to.equal(false);
  });

  it('combines multiple criteria using AND while keeping quick-search OR nested', () => {
    const query = new PatientQueryBuilder()
      .setSearch('smith')
      .setGender('Female')
      .setMedication('warfarin')
      .build();

    expect(query.$and).to.have.lengthOf(3);
    expect(query.$and[0].$or).to.have.lengthOf(2);
    expect(query.$and[1].gender.test('FEMALE')).to.equal(true);
    expect(query.$and[2]['medications.name'].test('Warfarin')).to.equal(true);
  });

  it('constructs correct date-of-birth cutoffs for inclusive age bounds', () => {
    const clock = sinon.useFakeTimers({
      now: new Date('2026-10-17T12:00:00.000Z'),
      toFake: ['Date']
    });

    try {
      const query = new PatientQueryBuilder()
        .setMinAge(65)
        .setMaxAge(80)
        .build();
      const range = query.dateOfBirth;
      expect(range.$lt.toISOString()).to.equal('1961-10-18T00:00:00.000Z');
      expect(range.$gt.toISOString()).to.equal('1945-10-17T00:00:00.000Z');
      // 65 today passes; 64 tomorrow does not.
      expect(new Date('1961-10-17T00:00:00Z') < range.$lt).to.equal(true);
      expect(new Date('1961-10-18T00:00:00Z') < range.$lt).to.equal(false);
    } finally {
      clock.restore();
    }
  });

  it('rejects negative, decimal and non-numeric ages', () => {
    expect(() => new PatientQueryBuilder().setMinAge(-1)).to.throw();
    expect(() => new PatientQueryBuilder().setMaxAge(1.5)).to.throw();
    expect(() => new PatientQueryBuilder().setMinAge('unknown')).to.throw();
  });

  it('rejects a minimum age higher than the maximum', () => {
    expect(() => new PatientQueryBuilder()
      .setMinAge(70)
      .setMaxAge(20)
      .build()).to.throw('Minimum age cannot be greater than maximum age');
  });

  it('ignores blank criteria and allows an individual criterion to be cleared', () => {
    const query = new PatientQueryBuilder()
      .setName('Jane')
      .setName(' ')
      .setGender('')
      .build();
    expect(query).to.deep.equal({});
  });
});
