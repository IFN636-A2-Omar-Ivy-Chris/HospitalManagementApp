const express = require("express");
const {
    getPatientMedications,
    prescribeMedication,
} = require("../controllers/prescriptionController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router({ mergeParams: true });

router.get("/", protect, getPatientMedications);
router.post("/", protect, authorizeRoles("doctor"), prescribeMedication);

module.exports = router;