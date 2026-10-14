const chai = require("chai");
const sinon = require("sinon");
const PrescriptionRepository = require("../repositories/PrescriptionRepository");
const PatientRepository = require("../repositories/PatientRepository");
const { getPatientMedications } = require("../controllers/prescriptionController");
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