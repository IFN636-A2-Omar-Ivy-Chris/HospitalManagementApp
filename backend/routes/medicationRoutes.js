const express = require("express");
const {
    getMedications,
    createMedication,
} = require("../controllers/medicationController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getMedications);
router.post("/", protect, authorizeRoles("pharmacist"), createMedication);

module.exports = router;