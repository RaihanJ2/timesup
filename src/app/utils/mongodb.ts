import mongoose from "mongoose";

const globalMongoose = global as unknown as {
  mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
};

if (!globalMongoose.mongoose) {
  globalMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<mongoose.Mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  if (globalMongoose.mongoose.conn) {
    return globalMongoose.mongoose.conn;
  }

  if (!globalMongoose.mongoose.promise) {
    globalMongoose.mongoose.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    globalMongoose.mongoose.conn = await globalMongoose.mongoose.promise;
    return globalMongoose.mongoose.conn;
  } catch (error) {
    globalMongoose.mongoose.promise = null;
    throw error;
  }
}

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
