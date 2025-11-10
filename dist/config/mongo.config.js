"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const MONGO_URL = process.env.MONGO_URL;
        console.log('Attempting to connect to MongoDB URL:', MONGO_URL);
        if (!MONGO_URL) {
            throw new Error('MONGO_URL is not defined in environment variables.');
        }
        await mongoose_1.default.connect(MONGO_URL);
        console.log('MongoDB connection successful');
        return true;
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        return false;
    }
};
exports.default = connectDB;
