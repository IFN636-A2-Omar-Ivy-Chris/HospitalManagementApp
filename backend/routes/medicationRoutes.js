const express = require("express");
const {
    getMedications,
    createMedication,
    updateMedication
} = require("../controllers/medicationController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getMedications);
router.post("/", protect, authorizeRoles("pharmacist"), createMedication);
router.put("/:id", protect, authorizeRoles("pharmacist"), updateMedication);

module.exports = router;