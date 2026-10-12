const MedicationRepository = require("../repositories/MedicationRepository");
const medicationRepository = new MedicationRepository();

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

module.exports = {getMedications};