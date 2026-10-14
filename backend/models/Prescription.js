const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        medication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medication",
            required: true,
        },
        dosage: {
            type: String,
            required: true,
            trim: true,
        },
        frequency: {
            type: String,
            required: true,
            trim: true,
        },
        prescribedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Prescription", prescriptionSchema);