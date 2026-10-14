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

const validateDosageAndFrequency = (data) => {
    if (isBlank(data.dosage)) {
        return "Dosage is required";
    }

    if (isBlank(data.frequency)) {
        return "Frequency is required";
    }

    return null;
};

const validatePrescription = (data) => {
    if (isBlank(data.medication)) {
        return "Medication is required";
    }

    return validateDosageAndFrequency(data);
};

// Returns the prescription only if it exists and belongs to this patient
const findPatientPrescription = async (prescriptionId, patientId) => {
    const prescription = await findOrNull(prescriptionRepository, prescriptionId);

    if (!prescription || String(prescription.patient) !== patientId) {
        return null;
    }

    return prescription;
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

const updatePrescription = async (req, res) => {
    try {
        const validationError = validateDosageAndFrequency(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        const prescription = await findPatientPrescription(
            req.params.prescriptionId,
            req.params.patientId,
        );

        if (!prescription) {
            return res.status(404).json({
                message: "Prescription not found",
            });
        }

        await prescriptionRepository.updateById(req.params.prescriptionId, {
            dosage: req.body.dosage.trim(),
            frequency: req.body.frequency.trim(),
        });

        const updatedPrescription =
            await prescriptionRepository.findByIdWithMedication(
                req.params.prescriptionId,
            );

        res.status(200).json(updatedPrescription);
    } catch (error) {
        console.error("Error updating prescription:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const removePrescription = async (req, res) => {
    try {
        const prescription = await findPatientPrescription(
            req.params.prescriptionId,
            req.params.patientId,
        );

        if (!prescription) {
            return res.status(404).json({
                message: "Prescription not found",
            });
        }

        await prescriptionRepository.deleteById(req.params.prescriptionId);

        res.status(200).json({
            message: "Prescription removed",
            prescription,
        });
    } catch (error) {
        console.error("Error removing prescription:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    getPatientMedications,
    prescribeMedication,
    updatePrescription,
    removePrescription,
};