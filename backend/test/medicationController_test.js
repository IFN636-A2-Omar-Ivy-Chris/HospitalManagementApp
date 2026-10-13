const chai = require("chai");
const sinon = require("sinon");
const MedicationRepository = require("../repositories/MedicationRepository");
const {
  getMedications,
  createMedication,
  updateMedication, 
  deleteMedication
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
describe("PHA-03 updateMedication", () => {
  const validBody = {
    name: "Ibuprofen",
    dosage: "400 mg",
    form: "Tablet",
    stockQuantity: 75,
  };

  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 200 and the updated medication", async () => {
    const updated = { _id: "med123", ...validBody };
    const updateStub = sinon
      .stub(MedicationRepository.prototype, "updateById")
      .resolves(updated);

    const req = { params: { id: "med123" }, body: validBody };
    const res = mockResponse();

    await updateMedication(req, res);

    expect(updateStub.calledOnceWith("med123", validBody)).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(updated)).to.be.true;
  });

  it("should return 400 if the stock quantity is negative", async () => {
    const updateStub = sinon.stub(MedicationRepository.prototype, "updateById");

    const req = {
      params: { id: "med123" },
      body: { ...validBody, stockQuantity: -1 },
    };
    const res = mockResponse();

    await updateMedication(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(updateStub.notCalled).to.be.true;
  });

  it("should return 404 if the medication does not exist", async () => {
    sinon.stub(MedicationRepository.prototype, "updateById").resolves(null);

    const req = { params: { id: "missing123" }, body: validBody };
    const res = mockResponse();

    await updateMedication(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Medication not found" })).to.be
      .true;
  });

  it("should return 404 if the id is not a valid id", async () => {
    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";
    sinon.stub(MedicationRepository.prototype, "updateById").rejects(castError);

    const req = { params: { id: "not-an-id" }, body: validBody };
    const res = mockResponse();

    await updateMedication(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it("should return 409 if another medication already has the name", async () => {
    const duplicateError = new Error("Duplicate key");
    duplicateError.code = 11000;
    sinon
      .stub(MedicationRepository.prototype, "updateById")
      .rejects(duplicateError);

    const req = { params: { id: "med123" }, body: validBody };
    const res = mockResponse();

    await updateMedication(req, res);

    expect(res.status.calledWith(409)).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(MedicationRepository.prototype, "updateById")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const req = { params: { id: "med123" }, body: validBody };
    const res = mockResponse();

    await updateMedication(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});
describe("PHA-04 deleteMedication", () => {
  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 200 and the deleted medication", async () => {
    const deleted = {
      _id: "med123",
      name: "Ibuprofen",
      dosage: "400 mg",
      form: "Tablet",
      stockQuantity: 75,
    };
    const deleteStub = sinon
      .stub(MedicationRepository.prototype, "deleteById")
      .resolves(deleted);

    const req = { params: { id: "med123" } };
    const res = mockResponse();

    await deleteMedication(req, res);

    expect(deleteStub.calledOnceWith("med123")).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Medication deleted successfully",
        medication: deleted,
      }),
    ).to.be.true;
  });

  it("should return 404 if the medication does not exist", async () => {
    sinon.stub(MedicationRepository.prototype, "deleteById").resolves(null);

    const req = { params: { id: "missing123" } };
    const res = mockResponse();

    await deleteMedication(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Medication not found" })).to.be
      .true;
  });

  it("should return 404 if the id is not a valid id", async () => {
    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";
    sinon.stub(MedicationRepository.prototype, "deleteById").rejects(castError);

    const req = { params: { id: "not-an-id" } };
    const res = mockResponse();

    await deleteMedication(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(MedicationRepository.prototype, "deleteById")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const req = { params: { id: "med123" } };
    const res = mockResponse();

    await deleteMedication(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});
