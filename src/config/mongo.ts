import mongoose from 'mongoose'

const connectDB = async (): Promise<boolean> => {
    try {
        console.log("Attempting to connect to MongoDB...");
        
        
        
        // Get environment variables (these come from Docker Compose)
        const NODE_ENV = process.env.NODE_ENV || 'dev';
        let MONGO_URL: string;
        
        if (NODE_ENV === 'dev') {
            MONGO_URL = process.env.MONGO_URL_DEV || 'mongodb://mongo:27017/hospital_management_dev';
        } else {
            MONGO_URL = process.env.MONGO_URL_PROD || 'mongodb://mongo:27017/hospital_management_prod';
        }
            
        console.log("Attempting to connect to MongoDB URL:", MONGO_URL);
       
        if (!MONGO_URL) {
            console.error("Available MONGO environment variables:", Object.keys(process.env).filter(key => key.includes('MONGO')));
            throw new Error("MONGO_URL is not defined in environment variables.")
        }
            
        await mongoose.connect(MONGO_URL)
        console.log("MongoDB connection successful");
        return true;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        return false;
    }
}

export default connectDB