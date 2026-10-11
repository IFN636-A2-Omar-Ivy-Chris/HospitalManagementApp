const express = require("express");
const { getHomePage } = require("../controllers/homeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getHomePage);

module.exports = router;
