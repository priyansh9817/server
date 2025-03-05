import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables as soon as the module is imported
dotenv.config();

const connectDB = async () => {
    const mongoURL = process.env.MongoDB_URL; // Make sure this matches your .env key

    if (!mongoURL) {
        console.error("MongoDB URL is undefined. Check your .env file.");
        process.exit(1);
    }

    try {
        // Await the connection to ensure proper error handling
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB server");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process if connection fails
    }

    // Optional: Listen for disconnection events
    mongoose.connection.on("disconnected", () => {
        console.log("⚠️ Disconnected from MongoDB server");
    });
};

export default connectDB;
