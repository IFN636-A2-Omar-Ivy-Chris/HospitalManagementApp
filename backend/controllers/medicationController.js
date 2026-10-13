const MedicationRepository = require("../repositories/MedicationRepository");

const medicationRepository = new MedicationRepository();

const validateMedication = (data) => {
    const { name, dosage, form, stockQuantity } = data;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return "Name is required";
    }

    if (!dosage || typeof dosage !== "string" || dosage.trim() === "") {
        return "Dosage is required";
    }

    if (!form || typeof form !== "string" || form.trim() === "") {
        return "Form is required";
    }

    if (stockQuantity === undefined || stockQuantity === null || stockQuantity === "") {
        return "Stock quantity is required";
    }

    if (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0) {
        return "Stock quantity must be a whole number of zero or more";
    }

    return null;
};

const getMedications = async (req, res) => {
    try {
        const medications = await medicationRepository.findAll();

        res.status(200).json(medications);
    } catch (error) {
        console.error("Error retrieving medications:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const createMedication = async (req, res) => {
    try {
        const validationError = validateMedication(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        const { name, dosage, form, stockQuantity } = req.body;

        const medication = await medicationRepository.create({
            name,
            dosage,
            form,
            stockQuantity: Number(stockQuantity),
        });

        res.status(201).json(medication);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A medication with this name already exists",
            });
        }

        console.error("Error creating medication:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateMedication = async (req, res) => {
    try {
        const validationError = validateMedication(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        const { name, dosage, form, stockQuantity } = req.body;

        const medication = await medicationRepository.updateById(req.params.id, {
            name,
            dosage,
            form,
            stockQuantity: Number(stockQuantity),
        });

        if (!medication) {
            return res.status(404).json({
                message: "Medication not found",
            });
        }

        res.status(200).json(medication);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                message: "Medication not found",
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "A medication with this name already exists",
            });
        }

        console.error("Error updating medication:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};
module.exports = { getMedications, createMedication, updateMedication };