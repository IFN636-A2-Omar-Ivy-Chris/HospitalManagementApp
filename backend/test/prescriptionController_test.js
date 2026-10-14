const chai = require("chai");
const sinon = require("sinon");
const PrescriptionRepository = require("../repositories/PrescriptionRepository");
const PatientRepository = require("../repositories/PatientRepository");
const MedicationRepository = require("../repositories/MedicationRepository");
const {
  getPatientMedications,
  prescribeMedication,
  updatePrescription,
  removePrescription
} = require("../controllers/prescriptionController");
const { expect } = chai;

describe("MED-01 getPatientMedications", () => {
  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 200 and the patient's medications", async () => {
    const prescriptions = [
      {
        _id: "rx1",
        medication: { name: "Paracetamol", dosage: "500 mg", form: "Tablet" },
        dosage: "1 tablet",
        frequency: "Every 6 hours",
      },
    ];
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    const findStub = sinon
      .stub(PrescriptionRepository.prototype, "findByPatient")
      .resolves(prescriptions);

    const req = { params: { patientId: "patient123" } };
    const res = mockResponse();

    await getPatientMedications(req, res);

    expect(findStub.calledOnceWith("patient123")).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(prescriptions)).to.be.true;
  });

  it("should return 200 and an empty list when the patient has no medications", async () => {
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    sinon.stub(PrescriptionRepository.prototype, "findByPatient").resolves([]);

    const req = { params: { patientId: "patient123" } };
    const res = mockResponse();

    await getPatientMedications(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith([])).to.be.true;
  });

  it("should return 404 if the patient does not exist", async () => {
    sinon.stub(PatientRepository.prototype, "findById").resolves(null);
    const findStub = sinon.stub(
      PrescriptionRepository.prototype,
      "findByPatient",
    );

    const req = { params: { patientId: "missing123" } };
    const res = mockResponse();

    await getPatientMedications(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Patient not found" })).to.be
      .true;
    expect(findStub.notCalled).to.be.true;
  });

  it("should return 404 if the patient id is not a valid id", async () => {
    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";
    sinon.stub(PatientRepository.prototype, "findById").rejects(castError);

    const req = { params: { patientId: "not-an-id" } };
    const res = mockResponse();

    await getPatientMedications(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    sinon
      .stub(PrescriptionRepository.prototype, "findByPatient")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const req = { params: { patientId: "patient123" } };
    const res = mockResponse();

    await getPatientMedications(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});

describe("MED-02 prescribeMedication", () => {
  const validBody = {
    medication: "med123",
    dosage: "1 tablet",
    frequency: "Every 6 hours",
  };

  const mockRequest = (body = validBody) => ({
    params: { patientId: "patient123" },
    body,
    user: { id: "doctor123", role: "doctor" },
  });

  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 201 and the new prescription", async () => {
    const saved = {
      _id: "rx1",
      medication: { name: "Paracetamol", dosage: "500 mg", form: "Tablet" },
      dosage: "1 tablet",
      frequency: "Every 6 hours",
    };
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    sinon
      .stub(MedicationRepository.prototype, "findById")
      .resolves({ _id: "med123" });
    const createStub = sinon
      .stub(PrescriptionRepository.prototype, "create")
      .resolves({ _id: "rx1" });
    sinon
      .stub(PrescriptionRepository.prototype, "findByIdWithMedication")
      .resolves(saved);

    const res = mockResponse();

    await prescribeMedication(mockRequest(), res);

    expect(
      createStub.calledOnceWith({
        patient: "patient123",
        medication: "med123",
        dosage: "1 tablet",
        frequency: "Every 6 hours",
        prescribedBy: "doctor123",
      }),
    ).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(saved)).to.be.true;
  });

  it("should return 400 if no medication is selected", async () => {
    const createStub = sinon.stub(PrescriptionRepository.prototype, "create");

    const res = mockResponse();

    await prescribeMedication(mockRequest({ ...validBody, medication: "" }), res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Medication is required" })).to
      .be.true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 400 if the frequency is missing", async () => {
    const createStub = sinon.stub(PrescriptionRepository.prototype, "create");

    const res = mockResponse();

    await prescribeMedication(mockRequest({ ...validBody, frequency: " " }), res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Frequency is required" })).to.be
      .true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 404 if the patient does not exist", async () => {
    sinon.stub(PatientRepository.prototype, "findById").resolves(null);
    const createStub = sinon.stub(PrescriptionRepository.prototype, "create");

    const res = mockResponse();

    await prescribeMedication(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Patient not found" })).to.be
      .true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 404 if the medication is not in the catalogue", async () => {
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    sinon.stub(MedicationRepository.prototype, "findById").resolves(null);
    const createStub = sinon.stub(PrescriptionRepository.prototype, "create");

    const res = mockResponse();

    await prescribeMedication(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Medication not found in the pharmacy catalogue",
      }),
    ).to.be.true;
    expect(createStub.notCalled).to.be.true;
  });

  it("should return 404 if the medication id is not a valid id", async () => {
    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    sinon.stub(MedicationRepository.prototype, "findById").rejects(castError);

    const res = mockResponse();

    await prescribeMedication(
      mockRequest({ ...validBody, medication: "not-an-id" }),
      res,
    );

    expect(res.status.calledWith(404)).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(PatientRepository.prototype, "findById")
      .resolves({ _id: "patient123" });
    sinon
      .stub(MedicationRepository.prototype, "findById")
      .resolves({ _id: "med123" });
    sinon
      .stub(PrescriptionRepository.prototype, "create")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const res = mockResponse();

    await prescribeMedication(mockRequest(), res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});

describe("MED-03 updatePrescription", () => {
  const validBody = { dosage: "2 tablets", frequency: "Every 8 hours" };

  const mockRequest = (body = validBody) => ({
    params: { patientId: "patient123", prescriptionId: "rx1" },
    body,
    user: { id: "doctor123", role: "doctor" },
  });

  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 200 and the updated prescription", async () => {
    const updated = {
      _id: "rx1",
      medication: { name: "Paracetamol" },
      ...validBody,
    };
    sinon
      .stub(PrescriptionRepository.prototype, "findById")
      .resolves({ _id: "rx1", patient: "patient123" });
    const updateStub = sinon
      .stub(PrescriptionRepository.prototype, "updateById")
      .resolves({});
    sinon
      .stub(PrescriptionRepository.prototype, "findByIdWithMedication")
      .resolves(updated);

    const res = mockResponse();

    await updatePrescription(mockRequest(), res);

    expect(updateStub.calledOnceWith("rx1", validBody)).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(updated)).to.be.true;
  });

  it("should return 400 if the dosage is empty", async () => {
    const updateStub = sinon.stub(PrescriptionRepository.prototype, "updateById");

    const res = mockResponse();

    await updatePrescription(mockRequest({ ...validBody, dosage: "" }), res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Dosage is required" })).to.be
      .true;
    expect(updateStub.notCalled).to.be.true;
  });

  it("should return 404 if the prescription does not exist", async () => {
    sinon.stub(PrescriptionRepository.prototype, "findById").resolves(null);
    const updateStub = sinon.stub(PrescriptionRepository.prototype, "updateById");

    const res = mockResponse();

    await updatePrescription(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Prescription not found" })).to
      .be.true;
    expect(updateStub.notCalled).to.be.true;
  });

  it("should return 404 if the prescription belongs to another patient", async () => {
    sinon
      .stub(PrescriptionRepository.prototype, "findById")
      .resolves({ _id: "rx1", patient: "otherPatient" });
    const updateStub = sinon.stub(PrescriptionRepository.prototype, "updateById");

    const res = mockResponse();

    await updatePrescription(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(updateStub.notCalled).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(PrescriptionRepository.prototype, "findById")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const res = mockResponse();

    await updatePrescription(mockRequest(), res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});

describe("MED-04 removePrescription", () => {
  const mockRequest = () => ({
    params: { patientId: "patient123", prescriptionId: "rx1" },
    user: { id: "doctor123", role: "doctor" },
  });

  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 200 and remove the prescription", async () => {
    const prescription = { _id: "rx1", patient: "patient123" };
    sinon
      .stub(PrescriptionRepository.prototype, "findById")
      .resolves(prescription);
    const deleteStub = sinon
      .stub(PrescriptionRepository.prototype, "deleteById")
      .resolves(prescription);

    const res = mockResponse();

    await removePrescription(mockRequest(), res);

    expect(deleteStub.calledOnceWith("rx1")).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Prescription removed" })).to.be
      .true;
  });

  it("should return 404 if the prescription does not exist", async () => {
    sinon.stub(PrescriptionRepository.prototype, "findById").resolves(null);
    const deleteStub = sinon.stub(PrescriptionRepository.prototype, "deleteById");

    const res = mockResponse();

    await removePrescription(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(deleteStub.notCalled).to.be.true;
  });

  it("should return 404 if the prescription belongs to another patient", async () => {
    sinon
      .stub(PrescriptionRepository.prototype, "findById")
      .resolves({ _id: "rx1", patient: "otherPatient" });
    const deleteStub = sinon.stub(PrescriptionRepository.prototype, "deleteById");

    const res = mockResponse();

    await removePrescription(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(deleteStub.notCalled).to.be.true;
  });

  it("should return 404 if the prescription id is not a valid id", async () => {
    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";
    sinon.stub(PrescriptionRepository.prototype, "findById").rejects(castError);

    const res = mockResponse();

    await removePrescription(mockRequest(), res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it("should return 500 if the repository throws an error", async () => {
    sinon
      .stub(PrescriptionRepository.prototype, "findById")
      .resolves({ _id: "rx1", patient: "patient123" });
    sinon
      .stub(PrescriptionRepository.prototype, "deleteById")
      .rejects(new Error("Database error"));
    sinon.stub(console, "error");

    const res = mockResponse();

    await removePrescription(mockRequest(), res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});