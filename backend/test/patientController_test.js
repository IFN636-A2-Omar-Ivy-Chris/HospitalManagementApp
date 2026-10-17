const { expect } = require('chai');
const sinon = require('sinon');
const Patient = require('../models/Patient');
const { getAllPatients } = require('../controllers/patientController');

describe('getAllPatients controller', () => {
  let findStub;
  let mongooseQuery;

  function response() {
    return {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  }

  beforeEach(() => {
    // Simulate the chain: Patient.find(filter).select(...).populate(...)
    mongooseQuery = {
      select: sinon.stub().returnsThis(),
      populate: sinon.stub().resolves([])
    };
    findStub = sinon.stub(Patient, 'find').returns(mongooseQuery);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('uses an empty query and retains ward population when no filters are supplied', async () => {
    const res = response();
    await getAllPatients({ query: {} }, res);

    expect(findStub.calledOnce).to.equal(true);
    expect(findStub.firstCall.args[0]).to.deep.equal({});
    expect(mongooseQuery.select.calledOnceWithExactly('name dateOfBirth gender ward'))
      .to.equal(true);
    expect(mongooseQuery.populate.calledOnceWithExactly('ward', 'name'))
      .to.equal(true);
    expect(res.status.calledOnceWithExactly(200)).to.equal(true);
  });

  it('passes a combined name and gender query to Mongoose', async () => {
    const res = response();
    await getAllPatients({ query: { name: 'joHN', gender: 'female' } }, res);

    const filter = findStub.firstCall.args[0];
    expect(filter.$and).to.have.lengthOf(2);
    expect(filter.$and[0].name.test('John Smith')).to.equal(true);
    expect(filter.$and[1].gender.test('Female')).to.equal(true);
    expect(res.status.calledWithExactly(200)).to.equal(true);
  });

  it('passes a partial-ID query to Mongoose', async () => {
    const res = response();
    await getAllPatients({ query: { id: '6A925' } }, res);

    const filter = findStub.firstCall.args[0];
    expect(filter.$expr.$regexMatch.regex).to.equal('6A925');
    expect(filter.$expr.$regexMatch.options).to.equal('i');
  });

  it('returns the retrieved patients with status 200', async () => {
    const patients = [{
      _id: '6a92536649c3071d44e1e58e',
      name: 'Jane Smith',
      gender: 'Female',
      ward: { name: 'Cardiology' }
    }];
    mongooseQuery.populate.resolves(patients);
    const res = response();

    await getAllPatients({ query: { name: 'Jane' } }, res);

    expect(res.status.calledOnceWithExactly(200)).to.equal(true);
    expect(res.json.calledOnceWithExactly(patients)).to.equal(true);
  });

  it('returns status 200 and an empty array when nothing matches', async () => {
    const res = response();
    await getAllPatients({ query: { name: 'no_match' } }, res);

    expect(res.status.calledOnceWithExactly(200)).to.equal(true);
    expect(res.json.calledOnceWithExactly([])).to.equal(true);
  });

  it('returns 400 for an invalid age range without querying the database', async () => {
    const res = response();
    await getAllPatients({ query: { minAge: '70', maxAge: '20' } }, res);

    expect(res.status.calledOnceWithExactly(400)).to.equal(true);
    expect(res.json.firstCall.args[0].message)
      .to.equal('Minimum age cannot be greater than maximum age');
    expect(findStub.notCalled).to.equal(true);
  });

  it('returns 400 for an invalid ward ID', async () => {
    const res = response();
    await getAllPatients({ query: { ward: 'Cardiology' } }, res);

    expect(res.status.calledOnceWithExactly(400)).to.equal(true);
    expect(res.json.firstCall.args[0].message).to.equal('Invalid ward ID');
    expect(findStub.notCalled).to.equal(true);
  });

  it('returns 400 for a repeated query parameter', async () => {
    const res = response();
    await getAllPatients({ query: { gender: ['Male', 'Female'] } }, res);

    expect(res.status.calledOnceWithExactly(400)).to.equal(true);
    expect(res.json.firstCall.args[0].message)
      .to.equal('gender must be a single value');
    expect(findStub.notCalled).to.equal(true);
  });

  it('returns 500 when the database query fails', async () => {
    mongooseQuery.populate.rejects(new Error('Database unavailable'));
    const logStub = sinon.stub(console, 'error');
    const res = response();

    await getAllPatients({ query: {} }, res);

    expect(res.status.calledOnceWithExactly(500)).to.equal(true);
    expect(res.json.calledOnceWithExactly({
      message: 'Unable to retrieve patients'
    })).to.equal(true);
    expect(logStub.called).to.equal(true);
  });
});
