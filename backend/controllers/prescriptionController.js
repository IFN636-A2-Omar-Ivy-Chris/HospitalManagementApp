const PrescriptionRepository = require("../repositories/PrescriptionRepository");
const PatientRepository = require("../repositories/PatientRepository");
const MedicationRepository = require("../repositories/MedicationRepository");

const prescriptionRepository = new PrescriptionRepository();
const patientRepository = new PatientRepository();
const medicationRepository = new MedicationRepository();

// Returns the record, or null if the id is unknown or not a valid id
const findOrNull = async (repository, id) => {
    try {
        return await repository.findById(id);
    } catch (error) {
        if (error.name === "CastError") {
            return null;
        }

        throw error;
    }
};

const isBlank = (value) =>
    !value || typeof value !== "string" || value.trim() === "";

const validatePrescription = (data) => {
    const { medication, dosage, frequency } = data;

    if (isBlank(medication)) {
        return "Medication is required";
    }

    if (isBlank(dosage)) {
        return "Dosage is required";
    }

    if (isBlank(frequency)) {
        return "Frequency is required";
    }

    return null;
};

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

const prescribeMedication = async (req, res) => {
    try {
        const validationError = validatePrescription(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        const patient = await findOrNull(patientRepository, req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        const medication = await findOrNull(
            medicationRepository,
            req.body.medication,
        );

        if (!medication) {
            return res.status(404).json({
                message: "Medication not found in the pharmacy catalogue",
            });
        }

        const prescription = await prescriptionRepository.create({
            patient: req.params.patientId,
            medication: req.body.medication,
            dosage: req.body.dosage.trim(),
            frequency: req.body.frequency.trim(),
            prescribedBy: req.user.id,
        });

        const savedPrescription =
            await prescriptionRepository.findByIdWithMedication(prescription._id);

        res.status(201).json(savedPrescription);
    } catch (error) {
        console.error("Error prescribing medication:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = { getPatientMedications, prescribeMedication };