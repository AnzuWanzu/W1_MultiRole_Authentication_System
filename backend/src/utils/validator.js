import { body, param, validationResult } from "express-validator";
import User from "../models/User.js";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      if (typeof validation.run === "function") {
        await validation.run(req);
      } else if (typeof validation === "function") {
        const maybePromise = validation(req, res, () => {});
        if (maybePromise instanceof Promise) {
          await maybePromise;
        }
      }
    }
    //find the first error
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(422).json({ errors: errors.array() });
  };
};

export const loginValidator = [
  body("username").trim().notEmpty().withMessage("Username is required."),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .matches(/[0-9]/)
    .withMessage("Password must contain a number.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter."),
];

export const createUserValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .toLowerCase()
    .withMessage("Email is must be valid."),
  ...loginValidator,
  body("role")
    .trim()
    .isIn(["admin", "manager", "employee"])
    .withMessage("Role must be valid."),
];

export const deleteUserValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required"),
  async (req, res, next) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "User ID is required" });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }
    next();
  },
];

