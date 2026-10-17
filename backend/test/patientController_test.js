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
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves([])
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
    mongooseQuery.sort.resolves(patients);
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
    mongooseQuery.sort.rejects(new Error('Database unavailable'));
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


describe('getAllPatients - Sorting', function () {

  let sandbox;
  let findStub;
  let aggregateStub;
  let queryMock;
  let mockPatients;
  let req;
  let res;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    mockPatients = [
      { _id: '1', name: 'Alice', gender: 'Female' },
      { _id: '2', name: 'Bob', gender: 'Male' }
    ];

    // Mock the Mongoose query chain
    queryMock = {
      select: sandbox.stub().returnsThis(),
      populate: sandbox.stub().returnsThis(),
      sort: sandbox.stub().resolves(mockPatients)
    };

    findStub = sandbox.stub(Patient, 'find')
      .returns(queryMock);

    // Ward sorting uses aggregation instead
    aggregateStub = sandbox.stub(Patient, 'aggregate')
      .resolves(mockPatients);

    req = {
      query: {}
    };

    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.spy()
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should default to sorting by name ascending', async function () {
    await getAllPatients(req, res);

    expect(queryMock.sort.calledOnceWithExactly({
      name: 1
    })).to.equal(true);

    expect(res.json.calledWith(mockPatients)).to.equal(true);
  });

  it('should sort by name descending', async function () {
    req.query = {
      sortBy: 'name',
      sortOrder: 'desc'
    };

    await getAllPatients(req, res);

    expect(queryMock.sort.calledOnceWithExactly({
      name: -1
    })).to.equal(true);
  });

  it('should sort by date of birth descending', async function () {
    req.query = {
      sortBy: 'dateOfBirth',
      sortOrder: 'desc'
    };

    await getAllPatients(req, res);

    expect(queryMock.sort.calledOnceWithExactly({
      dateOfBirth: -1
    })).to.equal(true);
  });

  it('should sort by gender ascending', async function () {
    req.query = {
      sortBy: 'gender',
      sortOrder: 'asc'
    };

    await getAllPatients(req, res);

    expect(queryMock.sort.calledOnceWithExactly({
      gender: 1
    })).to.equal(true);
  });

  it('should sort by ward name ascending using aggregation', async function () {
    req.query = {
      sortBy: 'ward',
      sortOrder: 'asc'
    };

    await getAllPatients(req, res);

    expect(aggregateStub.calledOnce).to.equal(true);
    expect(findStub.notCalled).to.equal(true);

    const pipeline = aggregateStub.firstCall.args[0];

    const lookupStage = pipeline.find(stage => stage.$lookup);
    const sortStage = pipeline.find(stage => stage.$sort);

    expect(lookupStage).to.exist;
    expect(lookupStage.$lookup.from).to.equal('wards');

    expect(sortStage.$sort).to.deep.equal({
      'wardDetails.name': 1,
      name: 1,
      _id: 1
    });
  });

  it('should sort by ward name descending using aggregation', async function () {
    req.query = {
      sortBy: 'ward',
      sortOrder: 'desc'
    };

    await getAllPatients(req, res);

    expect(aggregateStub.calledOnce).to.equal(true);

    const pipeline = aggregateStub.firstCall.args[0];
    const sortStage = pipeline.find(stage => stage.$sort);

    expect(sortStage.$sort).to.deep.equal({
      'wardDetails.name': -1,
      name: 1,
      _id: 1
    });
  });

  it('should combine search filtering and sorting', async function () {
    req.query = {
      search: 'Smith',
      gender: 'Female',
      sortBy: 'dateOfBirth',
      sortOrder: 'desc'
    };

    await getAllPatients(req, res);

    expect(findStub.calledOnce).to.equal(true);

    const filter = findStub.firstCall.args[0];

    expect(filter).to.be.an('object');
    expect(filter).not.to.deep.equal({});

    expect(queryMock.sort.calledOnceWithExactly({
      dateOfBirth: -1
    })).to.equal(true);
  });

  it('should reject an invalid sorting field', async function () {
    req.query = {
      sortBy: 'contactNumber'
    };

    await getAllPatients(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(findStub.notCalled).to.equal(true);
    expect(aggregateStub.notCalled).to.equal(true);
  });

  it('should reject an invalid sorting direction', async function () {
    req.query = {
      sortOrder: 'up'
    };

    await getAllPatients(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(findStub.notCalled).to.equal(true);
    expect(aggregateStub.notCalled).to.equal(true);
  });

  it('should return 500 if normal sorting fails', async function () {
    queryMock.sort.rejects(new Error('Database error'));
    const logStub = sandbox.stub(console, 'error');
    await getAllPatients(req, res);

    expect(res.status.calledWith(500)).to.equal(true);
    expect(logStub.calledOnce).to.equal(true);
  });

  it('should return 500 if ward aggregation fails', async function () {
    req.query = {
      sortBy: 'ward'
    };

    aggregateStub.rejects(new Error('Aggregation error'));
    const logStub = sandbox.stub(console, 'error');

    await getAllPatients(req, res);

    expect(res.status.calledWith(500)).to.equal(true);
    expect(logStub.calledOnce).to.equal(true);
  });

});

