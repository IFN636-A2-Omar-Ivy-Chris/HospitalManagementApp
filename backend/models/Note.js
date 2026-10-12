const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        // The user who wrote the note (each note belongs to one user)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    {
        // Automatically add createdAt and updatedAt
        timestamps: true,
    },
);

module.exports = mongoose.model("Note", noteSchema);
