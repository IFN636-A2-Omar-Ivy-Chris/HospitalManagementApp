const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User');
const OnCallRepository = require('../repositories/OnCallRepository');
const BaseRepository = require('../repositories/BaseRepository');

// Fake database query: User.find() returns something with select() and sort()
const fakeQuery = (result) => ({
  select: sinon.stub().returnsThis(),
  sort: sinon.stub().resolves(result)
});

describe('OnCallRepository Test', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should only look for doctors who are on call', async () => {
    const query = fakeQuery([]);
    const findStub = sinon.stub(User, 'find').returns(query);

    await new OnCallRepository().findOnCallDoctors();

    expect(findStub.calledOnceWith({ role: 'doctor', onCall: true })).to.be.true;
  });

  it('should only return name, specialty and contact number (no password or email)', async () => {
    const query = fakeQuery([]);
    sinon.stub(User, 'find').returns(query);

    await new OnCallRepository().findOnCallDoctors();

    expect(query.select.calledOnceWith('name specialty contactNumber')).to.be.true;
  });

  it('should sort the doctors by name', async () => {
    const query = fakeQuery([]);
    sinon.stub(User, 'find').returns(query);

    await new OnCallRepository().findOnCallDoctors();

    expect(query.sort.calledOnceWith({ name: 1 })).to.be.true;
  });

  it('should return the on-call doctors from the database', async () => {
    const doctors = [
      { _id: 'doc1', name: 'Dr. Erin Patel', specialty: 'Cardiology', contactNumber: '0400 333 444' }
    ];
    sinon.stub(User, 'find').returns(fakeQuery(doctors));

    const result = await new OnCallRepository().findOnCallDoctors();

    expect(result).to.deep.equal(doctors);
  });

  it('should inherit from BaseRepository (Inheritance)', () => {
    expect(new OnCallRepository()).to.be.an.instanceOf(BaseRepository);
  });

});
