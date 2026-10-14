const PrescriptionRepository = require("../repositories/PrescriptionRepository");
const PatientRepository = require("../repositories/PatientRepository");

const prescriptionRepository = new PrescriptionRepository();
const patientRepository = new PatientRepository();

const getPatientMedications = async (req, res) => {
    try {
        const patient = await patientRepository.findById(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        const prescriptions = await prescriptionRepository.findByPatient(
            req.params.patientId,
        );

        res.status(200).json(prescriptions);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        console.error("Error retrieving patient medications:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = { getPatientMedications };