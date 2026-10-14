const BaseRepository = require("./BaseRepository")
const News = require("../models/News")

class NewsRepository extends BaseRepository {
    constructor() {
        super(News)
    }

    // Override: news are always listed from newest to oldest
    findAll() {
        return super.findAll({ publishedAt: -1 })
    }
}

module.exports = NewsRepository
