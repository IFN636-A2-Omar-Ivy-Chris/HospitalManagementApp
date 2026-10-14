const BaseRepository = require("./BaseRepository");
const Patient = require("../models/Patient");

class PatientRepository extends BaseRepository {
    constructor() {
        super(Patient);
    }
}

module.exports = PatientRepository;