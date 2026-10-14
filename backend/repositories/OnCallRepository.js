const BaseRepository = require("./BaseRepository")
const User = require("../models/User")

class OnCallRepository extends BaseRepository {
    constructor() {
        super(User)
    }

    // Only doctors who are on call, sorted by name
    // select(): only send what the home page needs (no password or email)
    findOnCallDoctors() {
        return User.find({ role: "doctor", onCall: true })
            .select("name specialty contactNumber")
            .sort({ name: 1 })
    }
}

module.exports = OnCallRepository
