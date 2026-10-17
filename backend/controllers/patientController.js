const Patient = require("../models/Patient");
const Ward = require("../models/Ward");
const PatientQueryBuilder = require('../builders/PatientQueryBuilder');

const getPatientsByWard = async (req, res) => {
    try {
        const patients = await Patient.find({
            ward: req.params.wardId,
        });

        res.status(200).json(patients);
    } catch (error) {
        console.error("Error retrieving ward patients:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const createPatient = async (req, res) => {
    try {
        const { name, dateOfBirth, gender, contactNumber, ward } = req.body;

        if (!name || !dateOfBirth || !gender || !contactNumber || !ward) {
            return res.status(400).json({
                message: "All patient fields are required",
            });
        }

        const dob = new Date(dateOfBirth);

        if (dob > new Date()) {
            return res.status(400).json({
                message: "Date of birth cannot be in the future",
            });
        }

        const patient = await Patient.create({
            name,
            dateOfBirth,
            gender,
            contactNumber,
            ward,
        });

        res.status(201).json({
            message: "Patient admitted successfully",
            patient,
        });
    } catch (error) {
        console.error("Error creating patient:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId).populate(
            "ward",
            "name type capacity",
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error("Error retrieving patient:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { name, dateOfBirth, gender, contactNumber } = req.body;

        if (!name || !dateOfBirth || !gender || !contactNumber) {
            return res.status(400).json({
                message: "All patient fields are required",
            });
        }

        const dob = new Date(dateOfBirth);

        if (dob > new Date()) {
            return res.status(400).json({
                message: "Date of birth cannot be in the future",
            });
        }

        const patient = await Patient.findById(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        patient.name = name;
        patient.dateOfBirth = dateOfBirth;
        patient.gender = gender;
        patient.contactNumber = contactNumber;

        const updatedPatient = await patient.save();

        res.status(200).json({
            message: "Patient updated successfully",
            patient: updatedPatient,
        });
    } catch (error) {
        console.error("Error updating patient:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const dischargePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        await patient.deleteOne();

        res.status(200).json({
            message: "Patient discharged successfully",
        });
    } catch (error) {
        console.error("Error discharging patient:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const transferPatient = async (req, res) => {
    try {
        const { ward } = req.body;

        if (!ward) {
            return res.status(400).json({
                message: "Destination ward is required",
            });
        }

        const patient = await Patient.findById(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        const destinationWard = await Ward.findById(ward);

        if (!destinationWard) {
            return res.status(404).json({
                message: "Destination ward not found",
            });
        }

        if (patient.ward.toString() === ward) {
            return res.status(400).json({
                message: "Patient is already assigned to this ward",
            });
        }

        patient.ward = ward;

        const updatedPatient = await patient.save();

        res.status(200).json({
            message: "Patient transferred successfully",
            patient: updatedPatient,
        });
    } catch (error) {
        console.error("Error transferring patient:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getAllPatients = async (req, res) => {

  // Build the patient query from request parameters
  let query;

  try {
    const {
      search,
      name,
      id,
      minAge,
      maxAge,
      ward,
      gender,
      medication
    } = req.query;

    // Ensure each supplied parameter is a single value
    const parameters = {
      search, name, id, minAge, maxAge,
      ward, gender, medication
    };

    for (const [field, value] of Object.entries(parameters)) {
      if (value !== undefined && typeof value !== 'string') {
        return res.status(400).json({
          message: `${field} must be a single value`
        });
      }
    }

    // Use the Builder pattern to construct the MongoDB query
    query = new PatientQueryBuilder()
      .setSearch(search)
      .setName(name)
      .setId(id)
      .setMinAge(minAge)
      .setMaxAge(maxAge)
      .setWard(ward)
      .setGender(gender)
      .setMedication(medication)
      .build();

  } catch (error) {
    // Invalid search or filter criteria
    return res.status(400).json({
      message: error.message
    });
  }

  // Execute the constructed MongoDB query
  try {
    const patients = await Patient.find(query)
      .select('name dateOfBirth gender ward')
      .populate('ward', 'name');

    return res.status(200).json(patients);

  } catch (error) {
    console.error('Error retrieving patients:', error);

    return res.status(500).json({
      message: 'Unable to retrieve patients'
    });
  }
};


module.exports = {
    getPatientsByWard,
    getPatientById,
    createPatient,
    updatePatient,
    dischargePatient,
    transferPatient,
    getAllPatients
};
