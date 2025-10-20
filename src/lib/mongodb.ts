import mongoose from "mongoose";

// Ensure the database name is set to ham-radio
const getMongoURI = () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  const uri = new URL(MONGODB_URI);
  uri.pathname = "/ham-radio";
  return uri.toString();
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  console.log("MongoDB: Connection requested");

  if (cached.conn) {
    console.log("MongoDB: Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("MongoDB: Creating new connection");
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(getMongoURI(), opts).then((mongoose) => {
      console.log("MongoDB: Connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB: Connection established");
  } catch (e) {
    console.error("MongoDB: Connection failed:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
