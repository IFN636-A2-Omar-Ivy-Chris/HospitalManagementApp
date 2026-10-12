const Note = require("../models/Note");

const addNote = async (req, res) => {
    try {
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

module.exports = { addNote };
