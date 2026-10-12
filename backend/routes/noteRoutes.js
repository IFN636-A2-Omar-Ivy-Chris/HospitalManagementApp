const express = require("express");
const { addNote, updateNote, deleteNote } = require("../controllers/noteController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addNote);
router.put("/:noteId", protect, updateNote);
router.delete("/:noteId", protect, deleteNote);

module.exports = router;
