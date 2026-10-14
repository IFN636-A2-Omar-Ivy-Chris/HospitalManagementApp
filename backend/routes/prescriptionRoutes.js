const express = require("express");
const { getPatientMedications } = require("../controllers/prescriptionController");
const protect = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.get("/", protect, getPatientMedications);

module.exports = router;