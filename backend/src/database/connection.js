import { connect, disconnect } from "mongoose";

const connectDB = async () => {
  const URI = process.env.MONGODB_URI;
  if (!URI) throw new Error("MongoDB URI is not defined in the environment.");
  try {
    await connect(URI);
    console.log("MongoDB connection established!");
  } catch (error) {
    console.log(error);
    throw new Error("MongoDB connection Failed.");
  }
};

const disconnectDB = async () => {
  try {
    await disconnect();
  } catch (error) {
    console.log(error);
    throw new Error("MongoDB disconnection Failed.");
  }
};

export { connectDB, disconnectDB };
