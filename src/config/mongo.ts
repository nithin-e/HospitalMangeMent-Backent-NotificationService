import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const connectDB = async (): Promise<void> => {
    try {
        // First try the environment-specific variables, then fall back to MONGO_URL
        const MONGO_URL_TO_USE = process.env.NODE_ENV === 'dev' 
            ? (process.env.MONGO_URL_DEV || process.env.MONGO_URL)
            : (process.env.MONGO_URL_PRO || process.env.MONGO_URL);
            
        console.log("MONGO_URL===", MONGO_URL_TO_USE);
        
        if (!MONGO_URL_TO_USE) {
            throw new Error("MONGO_URL is not defined in environment variables.");
        }
        
        await mongoose.connect(MONGO_URL_TO_USE);
        console.log("MongoDB connection successful in Notification service");
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

export default connectDB