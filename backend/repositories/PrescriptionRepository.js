const BaseRepository = require("./BaseRepository");
const Prescription = require("../models/Prescription");

class PrescriptionRepository extends BaseRepository {
    constructor() {
        super(Prescription);
    }

    // Hook override: prescriptions are listed oldest first
    getDefaultSort() {
        return { createdAt: 1 };
    }

    // Hook override: fill in the medication's details from the catalogue
    getPopulate() {
        return { path: "medication", select: "name dosage form" };
    }

    findByPatient(patientId) {
        return this.find({ patient: patientId });
    }

    findByIdWithMedication(id) {
        return this.findById(id).populate(this.getPopulate());
    }

    isMedicationPrescribed(medicationId) {
        return this.exists({ medication: medicationId });
    }
}

module.exports = PrescriptionRepository;