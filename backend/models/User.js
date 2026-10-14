const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["doctor", "nurse", "pharmacist"],
        required: true,
    },
    // On-call information (only used for doctors, so not required)
    specialty: {
        type: String,
    },
    contactNumber: {
        type: String,
    },
    onCall: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", userSchema);
