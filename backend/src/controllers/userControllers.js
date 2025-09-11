import User from "../models/User.js";

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

    //hashing of passwords

    //create user:
    const user = new User({ name, username, password, email, role }); //TODO in future: hashedPassoword
    user.lastLogin = Date.now();
    await user.save();
    //creating a cookie and store the tokens

    return res.status(201).json({
      message: `Successfully created a user with role: ${role}`,
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
