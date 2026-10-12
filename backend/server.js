const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const wardRoutes = require("./routes/wardRoutes");
const patientRoutes = require("./routes/patientRoutes");
const homeRoutes = require("./routes/homeRoutes");
const noteRoutes = require("./routes/noteRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:3000",
    }),
);

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hospital Management API is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
