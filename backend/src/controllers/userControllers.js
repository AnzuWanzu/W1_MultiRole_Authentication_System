import User from "../models/User.js";
import { compare, hash } from "bcrypt";
import { createToken } from "../utils/tokenManager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
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
    if (existingEmail) return res.status(400).send("Email already registered");
    if (existingUsername)
      return res.status(400).send("Username already registered");
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
    //clear cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
    });
    //create cookie
    const token = createToken(user._id.toString(), user.role, "3d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 3);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      expires,
    });

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
      return res.status(401).send("User does not exist.");
    }
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).send("Invalid Credentials");
    //clear cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
    });
    //create cookie
    const token = createToken(user._id.toString(), user.role, "3d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 3);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      expires,
    });

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

export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        message: `User deleted successfully`,
        user: {
          _id: deletedUser._id,
          name: deletedUser.name,
          username: deletedUser.username,
          email: deletedUser.email,
          role: deletedUser.role,
        },
      });
    } catch (error) {
      console.log("Error deleting user: ", error);
      return res.status(500).json({
        message: "Error",
        cause: error.message,
      });
    }
  }
export const logout = (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error logging out: ", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, role } = req.body;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, username, email, role },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.log("Error updating user: ", error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};
