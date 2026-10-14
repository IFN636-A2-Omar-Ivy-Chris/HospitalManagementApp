// Adds sample doctors with on-call information to the database
// Run from the backend folder: npm run seed:oncall

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");

dotenv.config();

const doctors = [
    {
        // On call, should  appear on the home page
        name: "Dr. Michael Sanders",
        email: "michael.sanders@sample-doctor.test",
        specialty: "Emergency Medicine",
        contactNumber: "0400 111 222",
        onCall: true,
    },
    {
        name: "Dr. Erin Patel",
        email: "erin.patel@sample-doctor.test",
        specialty: "Cardiology",
        contactNumber: "0400 333 444",
        onCall: true,
    },
    {
        // Not on call, should NOT appear on the home page
        name: "Dr. Emily Chen",
        email: "emily.chen@sample-doctor.test",
        specialty: "Paediatrics",
        contactNumber: "0400 555 666",
        onCall: false,
    },
];

const seedOnCallDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const doctor of doctors) {
            // Sample doctors are not meant to log in, so give them a random password
            const password = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

            // Update the doctor if the email already exists, otherwise create it
            // (running this script twice does not add duplicates)
            await User.findOneAndUpdate(
                { email: doctor.email },
                { ...doctor, role: "doctor", password: password },
                { upsert: true },
            );
        }

        console.log(`${doctors.length} sample doctors added`);
    } catch (error) {
        console.error("Seeding on-call doctors failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedOnCallDoctors();
