const BaseRepository = require("./BaseRepository");
const Prescription = require("../models/Prescription");

class PrescriptionRepository extends BaseRepository {
    constructor() {
        super(Prescription);
    }

    findByPatient(patientId) {
        return this.find({ patient: patientId }, { createdAt: 1 }).populate(
            "medication",
            "name dosage form",
        );
    }

    isMedicationPrescribed(medicationId) {
        return this.exists({ medication: medicationId });
    }
}

module.exports = PrescriptionRepository;