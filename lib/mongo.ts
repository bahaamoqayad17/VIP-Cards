import mongoose from "mongoose";
import "../models/User";
import "../models/Category";
import "../models/Store";
import "../models/Place";
import "../models/Subscription";
import "../models/Usage";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the NEXT_PUBLIC_MONGODB_URI environment variable"
  );
}

export async function connectToDatabase() {
  try {
    mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      return mongoose;
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
}
