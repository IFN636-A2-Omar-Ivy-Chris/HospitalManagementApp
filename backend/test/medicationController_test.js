const chai = require("chai");
const sinon = require("sinon");
const MedicationRepository = require("../repositories/MedicationRepository");
const {
  getMedications,
  createMedication,
} = require("../controllers/medicationController");
const { expect } = chai;

describe("PHA-01 getMedications", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return 200 and the list of medications", async () => {
    const medications = [
      {
        name: "Amoxicillin",
        dosage: "500 mg",
        form: "Capsule",
        stockQuantity: 120,
      },
      {
        name: "Paracetamol",
        dosage: "500 mg",
        form: "Tablet",
        stockQuantity: 300,
      },
    ];

    sinon.stub(MedicationRepository.prototype, "findAll").resolves(medications);

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getMedications(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(medications)).to.be.true;
  });

  it("should return 200 and an empty list when there are no medications", async () => {
    sinon.stub(MedicationRepository.prototype, "findAll").resolves([]);

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getMedications(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith([])).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(MedicationRepository.prototype, "findAll")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getMedications(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});
describe("PHA-02 createMedication", () => {
  const validBody = {
    name: "Ibuprofen",
    dosage: "200 mg",
    form: "Tablet",
    stockQuantity: 50,
  };

  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 201 and the created medication", async () => {
    const created = { _id: "med123", ...validBody };
    const createStub = sinon
      .stub(MedicationRepository.prototype, "create")
      .resolves(created);

    const req = { body: validBody };
    const res = mockResponse();

    await createMedication(req, res);

    expect(createStub.calledOnceWith(validBody)).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it("should return 400 if the name is missing", async () => {
    const createStub = sinon.stub(MedicationRepository.prototype, "create");

    const req = { body: { ...validBody, name: "" } };
    const res = mockResponse();

    await createMedication(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Name is required" })).to.be
      .true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 400 if the stock quantity is negative", async () => {
    const createStub = sinon.stub(MedicationRepository.prototype, "create");

    const req = { body: { ...validBody, stockQuantity: -5 } };
    const res = mockResponse();

    await createMedication(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 400 if the stock quantity is not a whole number", async () => {
    const createStub = sinon.stub(MedicationRepository.prototype, "create");

    const req = { body: { ...validBody, stockQuantity: 12.5 } };
    const res = mockResponse();

    await createMedication(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 409 if a medication with the same name exists", async () => {
    const duplicateError = new Error("Duplicate key");
    duplicateError.code = 11000;
    sinon
      .stub(MedicationRepository.prototype, "create")
      .rejects(duplicateError);

    const req = { body: validBody };
    const res = mockResponse();

    await createMedication(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "A medication with this name already exists",
      }),
    ).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(MedicationRepository.prototype, "create")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const req = { body: validBody };
    const res = mockResponse();

    await createMedication(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});
