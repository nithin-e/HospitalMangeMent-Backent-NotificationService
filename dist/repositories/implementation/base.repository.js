"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const created = new this.model(data);
        return await created.save();
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async findByEmail(email) {
        return this.model.findOne({ email });
    }
    async findOne(filter) {
        return this.model.findOne(filter);
    }
    async updateById(id, updateData) {
        return this.model.findByIdAndUpdate(id, updateData, { new: true });
    }
    async find(filter) {
        return this.model.find(filter);
    }
    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}
exports.BaseRepository = BaseRepository;
