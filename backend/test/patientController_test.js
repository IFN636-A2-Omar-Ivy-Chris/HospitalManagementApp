const { expect } = require('chai');
const sinon = require('sinon');
const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const Prescription = require('../models/Prescription');
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
    // BaseRepository.find() sorts first; the controller then selects and populates.
    mongooseQuery = {
      sort: sinon.stub().returnsThis(),
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
    expect(mongooseQuery.sort.calledOnce).to.equal(true);
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

    // Mock the Mongoose query chain returned through PatientRepository.find()
    queryMock = {
      sort: sandbox.stub().returnsThis(),
      select: sandbox.stub().returnsThis(),
      populate: sandbox.stub().resolves(mockPatients)
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
    queryMock.populate.rejects(new Error('Database error'));
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


describe('getAllPatients - Medication Filtering', function () {

  let sandbox;
  let medicationFindStub;
  let prescriptionDistinctStub;
  let patientFindStub;
  let patientAggregateStub;
  let medicationQuery;
  let patientQuery;
  let req;
  let res;

  const medicationId = '507f1f77bcf86cd799439011';
  const patientId = '507f1f77bcf86cd799439012';

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    // MedicationRepository.find() applies .sort() before controller .select()
    medicationQuery = {
      sort: sandbox.stub().returnsThis(),
      select: sandbox.stub().resolves([
        { _id: medicationId }
      ])
    };

    medicationFindStub = sandbox.stub(Medication, 'find')
      .returns(medicationQuery);

    // Mock the prescription lookup
    prescriptionDistinctStub = sandbox.stub(
      Prescription, 'distinct'
    ).resolves([patientId]);

    // PatientRepository.find() applies .sort() before controller selection/population
    patientQuery = {
      sort: sandbox.stub().returnsThis(),
      select: sandbox.stub().returnsThis(),
      populate: sandbox.stub().resolves([
        { _id: patientId, name: 'Jane Smith' }
      ])
    };

    patientFindStub = sandbox.stub(Patient, 'find')
      .returns(patientQuery);

    // Mock ward sorting
    patientAggregateStub = sandbox.stub(
      Patient, 'aggregate'
    ).resolves([
      { _id: patientId, name: 'Jane Smith' }
    ]);

    req = {
      query: {
        medication: 'Paracetamol'
      }
    };

    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.spy()
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should find medications using a case-insensitive name match', async function () {
    await getAllPatients(req, res);

    expect(medicationFindStub.calledOnce).to.equal(true);

    const filter = medicationFindStub.firstCall.args[0];

    expect(filter.name).to.be.instanceOf(RegExp);
    expect(filter.name.test('paracetamol')).to.equal(true);
    expect(filter.name.test('PARACETAMOL')).to.equal(true);

    // MedicationRepository inherits find() and applies its default name sort.
    expect(medicationQuery.sort.calledOnceWithExactly({ name: 1 }))
      .to.equal(true);
    expect(medicationQuery.select.calledOnceWithExactly('_id'))
      .to.equal(true);
  });

  it('should retrieve patient IDs from matching prescriptions', async function () {
    await getAllPatients(req, res);

    expect(prescriptionDistinctStub.calledOnce).to.equal(true);

    expect(prescriptionDistinctStub.firstCall.args[0])
      .to.equal('patient');

    expect(prescriptionDistinctStub.firstCall.args[1])
      .to.deep.equal({
        medication: {
          $in: [medicationId]
        }
      });
  });

  it('should restrict results to patients prescribed the medication', async function () {
    await getAllPatients(req, res);

    const filter = patientFindStub.firstCall.args[0];

    expect(filter.$and).to.be.an('array');

    expect(filter.$and).to.deep.include({
      _id: {
        $in: [patientId]
      }
    });

    expect(res.status.calledOnceWithExactly(200))
      .to.equal(true);
  });

  it('should combine medication filtering with gender and sorting', async function () {
    req.query = {
      medication: 'Paracetamol',
      gender: 'Female',
      sortBy: 'name',
      sortOrder: 'desc'
    };

    await getAllPatients(req, res);

    const filter = patientFindStub.firstCall.args[0];

    expect(filter.$and).to.be.an('array');

    // Existing gender filter must still be present
    const filterText = JSON.stringify(filter);

    expect(filterText).to.include('gender');

    // Medication restriction must also be present
    expect(filter.$and).to.deep.include({
      _id: {
        $in: [patientId]
      }
    });

    expect(patientQuery.sort.calledOnceWithExactly({
      name: -1
    })).to.equal(true);
  });

  it('should apply medication filtering when sorting by ward', async function () {
    req.query = {
      medication: 'Paracetamol',
      sortBy: 'ward'
    };

    await getAllPatients(req, res);

    expect(patientAggregateStub.calledOnce).to.equal(true);
    expect(patientFindStub.notCalled).to.equal(true);

    const pipeline = patientAggregateStub.firstCall.args[0];

    const matchStage = pipeline.find(stage => stage.$match);

    expect(matchStage.$match.$and).to.deep.include({
      _id: {
        $in: [patientId]
      }
    });

    const sortStage = pipeline.find(stage => stage.$sort);

    expect(sortStage.$sort['wardDetails.name']).to.equal(1);
  });

  it('should return an empty array when no prescriptions match', async function () {
    prescriptionDistinctStub.resolves([]);

    patientQuery.populate.resolves([]);

    await getAllPatients(req, res);

    const filter = patientFindStub.firstCall.args[0];

    expect(filter.$and).to.deep.include({
      _id: {
        $in: []
      }
    });

    expect(res.status.calledOnceWithExactly(200))
      .to.equal(true);

    expect(res.json.calledOnceWithExactly([]))
      .to.equal(true);
  });

  it('should skip medication lookups when no medication filter is supplied', async function () {
    req.query = {};

    await getAllPatients(req, res);

    expect(medicationFindStub.notCalled).to.equal(true);
    expect(prescriptionDistinctStub.notCalled).to.equal(true);
    expect(patientFindStub.calledOnce).to.equal(true);
  });

  it('should return 500 when the prescription lookup fails', async function () {
    prescriptionDistinctStub.rejects(
      new Error('Prescription database unavailable')
    );

    const logStub = sandbox.stub(console, 'error');

    await getAllPatients(req, res);

    expect(res.status.calledOnceWithExactly(500))
      .to.equal(true);

    expect(res.json.calledOnceWithExactly({
      message: 'Unable to retrieve patients'
    })).to.equal(true);

    expect(logStub.calledOnce).to.equal(true);
  });

});
