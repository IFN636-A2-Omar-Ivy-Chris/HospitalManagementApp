class BaseRepository {
    #model;

    constructor(model) {
        this.#model = model;
    }

    find(filter = {}, sort = this.getDefaultSort()) {
        const query = this.#model.find(filter).sort(sort);
        const populate = this.getPopulate();

        return populate ? query.populate(populate) : query;
    }

    findAll(sort) {
        return this.find({}, sort);
    }

    getDefaultSort() {
        return {};
    }

    getPopulate() {
        return null;
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

    // for PatientController/PatientQueryBuilder
    distinct(field, filter = {}) {
    return this.#model.distinct(field, filter);
    }

    aggregate(pipeline) {
        return this.#model.aggregate(pipeline);
    }
}

module.exports = BaseRepository;