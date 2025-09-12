import User from "../models/User.js";
import { compare, hash } from "bcrypt";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "Successfully retrieved a list of users: ", users });
  } catch (error) {
    console.log("Error in getting list of users: ", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    //add validations
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) return res.status(401).send("Email already registered");
    if (existingUsername)
      return res.status(401).send("Username already registered");
    //hashing of passwords
    const hashedPassword = await hash(password, 10);
    //create user:
    const user = new User({
      name,
      username,
      password: hashedPassword,
      email,
      role,
    });
    await user.save();
    //creating a cookie and store the tokens

    return res.status(201).json({
      message: `Successfully created a user with role: ${user.role}`,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.log("Error in creating a new user: ", error);
    return res.status(500).json({
      message: "Error",
      cause: error.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    //add validations
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid Credentials.");
    }
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).send("Invalid Credentials");
    //creating a cookie and store the tokens

    user.lastLogin = Date.now();
    await user.save();

    return res.status(200).json({
      message: `Successfully logged in as : ${user.username}`,
      name: user.name,
      lastLogin: user.lastLogin,
      role: user.role,
    });
  } catch (error) {
    console.log("Error logging in user: ", error);
    return res.status(500).json({
      message: "Error",
      cause: error.message,
    });
  }
};
