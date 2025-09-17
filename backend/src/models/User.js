import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: { type: Date },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
  },
  { timestamps: true } //note this automatically creates the createAt and updateAt by MongoDB
);

const User = mongoose.model("User", userSchema);

export default User;
