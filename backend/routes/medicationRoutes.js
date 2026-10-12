const express = require("express");
const { getMedications } = require("../controllers/medicationController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getMedications);

module.exports = router;