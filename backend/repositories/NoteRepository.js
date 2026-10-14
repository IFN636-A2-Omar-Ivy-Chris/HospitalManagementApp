const BaseRepository = require("./BaseRepository")
const Note = require("../models/Note")

class NoteRepository extends BaseRepository {
    constructor() {
        super(Note)
    }

    // Only find the notes written by this user
    findByUser(userId) {
        return Note.find({ user: userId })
    }
}

module.exports = NoteRepository
