const BaseRepository = require("./BaseRepository")
const Medication = require("../models/Medication")

class MedicationRepository extends BaseRepository {
    constructor() {
        super(Medication)
    }

    findAll() {
        return super.findAll({name: 1})
    }
}

module.exports = MedicationRepository