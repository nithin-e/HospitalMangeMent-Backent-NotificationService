import { Model, Document, FilterQuery } from "mongoose";
import { IBaseRepository } from "repositories/interFace/IbaseRepository";


export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return await created.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findByEmail(email: string): Promise<T | null> {
    return this.model.findOne({ email } as FilterQuery<T>);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async updateById(id: string, updateData: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter);
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
}