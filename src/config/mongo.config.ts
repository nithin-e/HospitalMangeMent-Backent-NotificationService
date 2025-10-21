import mongoose from 'mongoose';

const connectDB = async (): Promise<boolean> => {
    try {
        const MONGO_URL = process.env.MONGO_URL;

        console.log('Attempting to connect to MongoDB URL:', MONGO_URL);

        if (!MONGO_URL) {
            throw new Error(
                'MONGO_URL is not defined in environment variables.'
            );
        }

        await mongoose.connect(MONGO_URL);
        console.log('MongoDB connection successful');
        return true;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        return false;
    }
};

export default connectDB;
