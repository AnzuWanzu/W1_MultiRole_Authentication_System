import { body, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      //break if no validations used
      if (!result.isEmpty()) {
        break;
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
    .isLength({ min: 6 })
    .withMessage("Password should contain atleast 6 characters."),
];

export const createUserValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Email is must be valid."),
  ...loginValidator,
  body("role")
    .trim()
    .isIn(["admin", "manager", "employee"])
    .withMessage("Role must be valid."),
];
