const BaseRepository = require("./BaseRepository");
const Medication = require("../models/Medication");

class MedicationRepository extends BaseRepository {
    constructor() {
        super(Medication);
    }

    getDefaultSort() {
        return { name: 1 };
    }
}

module.exports = MedicationRepository;