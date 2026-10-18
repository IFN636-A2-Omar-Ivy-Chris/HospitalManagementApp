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

  it('stores the medication criterion without querying an embedded field', () => {
      const builder = new PatientQueryBuilder()
          .setMedication('Paracetamol');

      const query = builder.build();

      expect(builder.criteria.medication).to.equal('Paracetamol');
      expect(query).to.deep.equal({});
  });


  it('combines multiple criteria using AND while keeping quick-search OR nested', () => {
      const builder = new PatientQueryBuilder()
          .setSearch('smith')
          .setGender('Female')
          .setMedication('warfarin');

      const query = builder.build();

      // Only search and gender belong in the patient query
      expect(query.$and).to.have.lengthOf(2);

      // Quick search must retain its nested OR conditions
      expect(query.$and[0].$or).to.have.lengthOf(2);

      // Gender filtering must still work
      expect(query.$and[1].gender.test('FEMALE')).to.equal(true);

      // Medication is stored for processing by the controller
      expect(builder.criteria.medication).to.equal('warfarin');

      // Medication must not be queried as an embedded patient field
      expect(query.$and[1]).not.to.have.property('medications.name');
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

describe('Sorting', function () {

  it('should default to sorting by name ascending', function () {
    const builder = new PatientQueryBuilder();

    expect(builder.buildSort()).to.deep.equal({
      name: 1
    });
  });

  it('should sort by name descending', function () {
    const builder = new PatientQueryBuilder()
      .setSortBy('name')
      .setSortOrder('desc');

    expect(builder.buildSort()).to.deep.equal({
      name: -1
    });
  });

  it('should sort by date of birth ascending', function () {
    const builder = new PatientQueryBuilder()
      .setSortBy('dateOfBirth')
      .setSortOrder('asc');

    expect(builder.buildSort()).to.deep.equal({
      dateOfBirth: 1
    });
  });

  it('should sort by date of birth descending', function () {
    const builder = new PatientQueryBuilder()
      .setSortBy('dateOfBirth')
      .setSortOrder('desc');

    expect(builder.buildSort()).to.deep.equal({
      dateOfBirth: -1
    });
  });

  it('should sort by gender ascending', function () {
    const builder = new PatientQueryBuilder()
      .setSortBy('gender');

    expect(builder.buildSort()).to.deep.equal({
      gender: 1
    });
  });

  it('should create ward sorting instructions', function () {
    const builder = new PatientQueryBuilder()
      .setSortBy('ward')
      .setSortOrder('desc');

    expect(builder.buildSort()).to.deep.equal({
      ward: -1
    });
  });

  it('should reject an invalid sorting field', function () {
    const builder = new PatientQueryBuilder();

    expect(() => {
      builder.setSortBy('contactNumber');
    }).to.throw('Invalid sorting field');
  });

  it('should reject an invalid sorting direction', function () {
    const builder = new PatientQueryBuilder();

    expect(() => {
      builder.setSortOrder('up');
    }).to.throw('Invalid sorting order');
  });

  it('should preserve filters when sorting is added', function () {
    const builder = new PatientQueryBuilder()
      .setName('Smith')
      .setGender('Female');

    const filterBeforeSorting = builder.build();

    builder
      .setSortBy('dateOfBirth')
      .setSortOrder('desc');

    expect(builder.build()).to.deep.equal(filterBeforeSorting);

    expect(builder.buildSort()).to.deep.equal({
      dateOfBirth: -1
    });
  });

});

describe('Medication Filter Integration', function () {

  it('should store and trim the medication filter', function () {
    const builder = new PatientQueryBuilder()
      .setMedication('  Paracetamol  ');

    expect(builder.criteria.medication)
      .to.equal('Paracetamol');
  });

  it('should not query a nonexistent embedded medications field', function () {
    const builder = new PatientQueryBuilder()
      .setMedication('Paracetamol');

    const filter = builder.build();

    expect(filter).to.deep.equal({});
  });

});
