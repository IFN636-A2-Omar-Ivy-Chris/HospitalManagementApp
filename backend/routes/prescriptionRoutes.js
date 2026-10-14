const express = require("express");
const {
    getPatientMedications,
    prescribeMedication,
    updatePrescription,
    removePrescription,
} = require("../controllers/prescriptionController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router({ mergeParams: true });

router.get("/", protect, getPatientMedications);
router.post("/", protect, authorizeRoles("doctor"), prescribeMedication);
router.put(
    "/:prescriptionId",
    protect,
    authorizeRoles("doctor"),
    updatePrescription,
);
router.delete(
    "/:prescriptionId",
    protect,
    authorizeRoles("doctor"),
    removePrescription,
);

module.exports = router;