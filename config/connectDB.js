import mongoose from "mongoose";
import dotenv from "dotenv";

//  Load env variables here
dotenv.config();

if (!process.env.MONGODB_URI) {
    throw new Error(
        " Provide MONGODB_URI in .env file ");

}


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(" MongoDB connection failed:", error.message);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
