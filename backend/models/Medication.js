const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    dosage: {
        type: String,
        required: true,
        trim: true,
    },
    form: {
        type: String,
        required: true,
        trim: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger, 
            message: "Stock quantity must be a whole number",
        },
    },
});

module.exports = mongoose.model("Medication", medicationSchema);
