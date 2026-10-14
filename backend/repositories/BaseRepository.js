class BaseRepository {
    #model;

    constructor(model) {
        this.#model = model;
    }

    findAll(sort = {}) {
        return this.#model.find().sort(sort);
    }

    find(filter = {}, sort = {}) {
        return this.#model.find(filter).sort(sort);
    }

    findById(id) {
        return this.#model.findById(id);
    }

    async exists(filter) {
        const result = await this.#model.exists(filter);

        return result !== null;
    }

    create(data) {
        return this.#model.create(data);
    }

    updateById(id, data) {
        return this.#model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }

    deleteById(id) {
        return this.#model.findByIdAndDelete(id);
    }
}

module.exports = BaseRepository;