const Note = require("../models/Note");

const addNote = async (req, res) => {
    try {
        // A note cannot be empty or only spaces
        if (!req.body.text || req.body.text.trim() === "") {
            return res.status(400).json({
                message: "Note cannot be empty",
            });
        }

        const note = await Note.create({
            // The owner comes from the login token, not from the request body,
            // so a user cannot create notes for someone else
            user: req.user.id,
            text: req.body.text,
        });

        res.status(201).json(note);
    } catch (error) {
        console.error("Error adding note:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateNote = async (req, res) => {
    try {
        // A note cannot be empty or only spaces
        if (!req.body.text || req.body.text.trim() === "") {
            return res.status(400).json({
                message: "Note cannot be empty",
            });
        }

        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found",
            });
        }

        // Only the owner can edit the note
        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only edit your own notes",
            });
        }

        note.text = req.body.text;

        const updatedNote = await note.save();

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error updating note:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found",
            });
        }

        // Only the owner can delete the note
        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own notes",
            });
        }

        await note.deleteOne();

        res.status(200).json({
            message: "Note deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting note:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = { addNote, updateNote, deleteNote };
