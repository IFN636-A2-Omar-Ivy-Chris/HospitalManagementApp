const express = require("express");
const {
    getPatientsByWard,
    getPatientById,
    createPatient,
    updatePatient,
    dischargePatient,
    transferPatient,
    getAllPatients
} = require("../controllers/patientController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/ward/:wardId", protect, getPatientsByWard);
router.get("/:patientId", protect, getPatientById);
router.get('/', protect, getAllPatients);
router.put("/:patientId", protect, updatePatient);

router.post("/", protect, authorizeRoles("doctor"), createPatient);
router.patch(
    "/:patientId/transfer",
    protect,
    authorizeRoles("doctor"),
    transferPatient,
);

router.delete(
    "/:patientId",
    protect,
    authorizeRoles("doctor"),
    dischargePatient,
);


module.exports = router;
