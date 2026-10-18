const Patient = require("../models/Patient");
const Ward = require("../models/Ward");
const Medication = require('../models/Medication');
const Prescription = require('../models/Prescription');
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
    console.log('DEBUG 1: Entered getAllPatients');
    // Build the patient query from request parameters
    let query;
    let sort;

    try {
            const {
                search,
                name,
                id,
                minAge,
                maxAge,
                ward,
                gender,
                medication,
                sortBy,
                sortOrder
            } = req.query;

            // Ensure each supplied parameter is a single value
            const parameters = {
            search,
            name,
            id,
            minAge,
            maxAge,
            ward,
            gender,
            medication,
            sortBy,
            sortOrder
            };

        for (const [field, value] of Object.entries(parameters)) {
        if (value !== undefined && typeof value !== 'string') {
            return res.status(400).json({
            message: `${field} must be a single value`
            });
        }
        }

        // Use the Builder pattern to construct the MongoDB query
        const builder = new PatientQueryBuilder()
            .setSearch(search)
            .setName(name)
            .setId(id)
            .setMinAge(minAge)
            .setMaxAge(maxAge)
            .setWard(ward)
            .setGender(gender)
            .setMedication(medication)
            .setSortBy(sortBy)
            .setSortOrder(sortOrder);
        
            query = builder.build();
            sort = builder.buildSort();
            console.log('DEBUG 2: Query built', query, sort);

    } catch (error) {
        // Invalid search or filter criteria
        return res.status(400).json({
        message: error.message
        });
    }

    // Retrieve patients using the constructed query
 
    // Retrieve patients using the constructed query
    try {
        console.log('DEBUG 3: Starting database retrieval');

        let patients;

        // Filter patients by prescribed medication
        if (req.query.medication && req.query.medication.trim() !== '') {

            // Find medications with a matching name
            const medications = await Medication.find({
                name: new RegExp(
                    PatientQueryBuilder.prototype.escapeRegex(
                        req.query.medication.trim()
                    ),
                    'i'
                )
            }).select('_id');

            // Get the IDs of matching medications
            const medicationIds = medications.map(
                medication => medication._id
            );

            // Find patients with prescriptions for those medications
            const patientIds = await Prescription.distinct(
                'patient',
                {
                    medication: { $in: medicationIds }
                }
            );

            // Add the patient IDs to the existing filter query
            query = {
                $and: [
                    query,
                    { _id: { $in: patientIds } }
                ]
            };
        }


        if (Object.prototype.hasOwnProperty.call(sort, 'ward')) {

            // Ward sorting requires joining the Ward collection
            const direction = sort.ward;

            patients = await Patient.aggregate([
                // Apply search and filter criteria first
                {
                    $match: query
                },

                // Join patients with their wards
                {
                    $lookup: {
                        from: 'wards',
                        localField: 'ward',
                        foreignField: '_id',
                        as: 'wardDetails'
                    }
                },

                // Convert the wardDetails array into an object
                {
                    $unwind: {
                        path: '$wardDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },

                // Sort alphabetically by ward name
                {
                    $sort: {
                        'wardDetails.name': direction,
                        name: 1,
                        _id: 1
                    }
                },

                // Return the same patient fields as the existing API
                {
                    $project: {
                        name: 1,
                        dateOfBirth: 1,
                        gender: 1,
                        ward: {
                            _id: '$wardDetails._id',
                            name: '$wardDetails.name'
                        }
                    }
                }
            ]);

        } else {

            // Normal sorting for name, DOB and gender
            patients = await Patient.find(query)
                .select('name dateOfBirth gender ward')
                .populate('ward', 'name')
                .sort(sort);
        }

        console.log('DEBUG 4: Retrieved', patients.length, 'patients');

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
