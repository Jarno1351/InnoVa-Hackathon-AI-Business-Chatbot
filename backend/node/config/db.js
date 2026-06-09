import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const connectionString = "mongodb+srv://darrylmacarandan01_db_user:szKCrJI7G4bTgOTu@backenddb.skb5zqx.mongodb.net/innovaDB?appName=backendDB";
        
        await mongoose.connect(connectionString);
        console.log("🍃 Connected to MongoDB Atlas successfully!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};