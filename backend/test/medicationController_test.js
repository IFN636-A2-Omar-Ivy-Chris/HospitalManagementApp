const chai = require('chai');
const sinon = require('sinon');
const MedicationRepository = require('../repositories/MedicationRepository');
const { getMedications } = require('../controllers/medicationController');
const { expect } = chai;

describe('PHA-01 getMedications', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 and the list of medications', async () => {
    const medications = [
      { name: 'Amoxicillin', dosage: '500 mg', form: 'Capsule', stockQuantity: 120 },
      { name: 'Paracetamol', dosage: '500 mg', form: 'Tablet', stockQuantity: 300 },
    ];

    sinon.stub(MedicationRepository.prototype, 'findAll').resolves(medications);

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getMedications(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(medications)).to.be.true;
  });

    it('should return 200 and an empty list when there are no medications', async () => {
    sinon.stub(MedicationRepository.prototype, 'findAll').resolves([]);

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getMedications(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith([])).to.be.true;
  });

    it('should return 500 if the repository throws an error', async () => {
    sinon.stub(MedicationRepository.prototype, 'findAll').rejects(new Error('Database error'));
    sinon.stub(console, 'error');

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getMedications(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
  });

});