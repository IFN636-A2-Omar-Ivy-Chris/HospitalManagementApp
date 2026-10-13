class BaseRepository {
    #model;

    constructor(model) { 
        this.#model = model
    }

    findAll(sort = {}) {
        return this.#model.find().sort(sort)
    }

    findById (id) {
        return this.#model.findById(id)
    }

    create(data) { 
        return this.#model.create(data)
    }

    updateById(id, data) { 
        return this.#model.findByIdAndUpdate(id, data, {new:true, runValidators: true})
    }

    deleteById(id) {
        return this.#model.findByIdAndDelete(id)
    }
}

module.exports = BaseRepository