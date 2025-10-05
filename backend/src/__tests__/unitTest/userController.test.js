import { jest } from "@jest/globals";

const mockHashFn = jest.fn().mockResolvedValue("hashedPassword");
const mockCompareFn = jest.fn().mockResolvedValue(true);
const mockCreateTokenFn = jest.fn().mockReturnValue("mockJWTToken");

jest.unstable_mockModule("../../utils/tokenManager.js", () => ({
  createToken: mockCreateTokenFn,
}));

jest.unstable_mockModule("bcrypt", () => ({
  hash: mockHashFn,
  compare: mockCompareFn,
}));

import * as tokenManager from "../../utils/tokenManager.js";
import * as bcrypt from "bcrypt";
import User from "../../models/User.js";
import {
  createUser,
  getAllUsers,
  deleteUser,
} from "../../controllers/userControllers.js"; 

describe("GET / - getAllUsers Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Reset all mocks before each test
    jest.restoreAllMocks();
  });

  it("returns all users with status 200", async () => {
    const fakeUsers = [{ name: "User1" }, { name: "User2" }];
    const sortMock = jest.fn().mockResolvedValue(fakeUsers);
    jest.spyOn(User, "find").mockReturnValue({ sort: sortMock });

    await getAllUsers(req, res);

    expect(User.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully retrieved a list of users: ",
      users: fakeUsers,
    });
  });

  it("Should return 500 if there is a server/database error", async () => {
    const error = new Error("Error in getting list of users");
    const sortMock = jest.fn().mockRejectedValue(error);
    jest.spyOn(User, "find").mockReturnValue({ sort: sortMock });

    await getAllUsers(req, res);

    expect(User.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: expect.any(String),
    });
  });
});

describe("POST /createUser - createUser Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        role: "employee",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    jest.restoreAllMocks(); 
    // Reset our custom mock functions
    mockHashFn.mockClear();
    mockCompareFn.mockClear();
    mockCreateTokenFn.mockClear();
  });

  it("Should create a user and return 201 with user data.", async () => {
    // Mock User.findOne to return null (no existing user)
    jest
      .spyOn(User, "findOne")
      .mockResolvedValueOnce(null) 
      .mockResolvedValueOnce(null);

    const mockUser = {
      _id: "123",
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: "hashedPassword",
      role: req.body.role,
      lastLogin: null,
    };

    const mockSave = jest.fn().mockResolvedValue(mockUser);

    jest.spyOn(User.prototype, "save").mockImplementation(mockSave);

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledTimes(2);
    expect(mockHashFn).toHaveBeenCalledWith(req.body.password, 10);
    expect(mockSave).toHaveBeenCalled();
    expect(tokenManager.createToken).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  }, 10000); // Increase timeout to 10 seconds for this test

describe("Validation Errors", () => {
  beforeEach(() => {
    User.findOne = jest.fn().mockResolvedValue(null);
  });

  it("Should return 500 if name is missing (Mongoose validation error)", async () => {
    delete req.body.name;

    const validationError = new Error(
      "User validation failed: name: Path `name` is required."
    );
    validationError.name = "ValidationError";

    jest.spyOn(User.prototype, "save").mockRejectedValue(validationError);
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: "User validation failed: name: Path `name` is required.",
    });
  });

  it("Should return 500 if username is missing (Mongoose validation error)", async () => {
    delete req.body.username;

    const validationError = new Error(
      "User validation failed: username: Path `username` is required."
    );
    validationError.name = "ValidationError";

    jest.spyOn(User.prototype, "save").mockRejectedValue(validationError);
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: "User validation failed: username: Path `username` is required.",
    });
  });
});

describe("Business Logic Errors", () => {
  it("Should return 400 if email already exists", async () => {
    const existingUser = { email: "john@example.com" };
    User.findOne = jest
      .fn()
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce(null);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Email already registered");
  });

  it("Should return 400 if username already exists", async () => {
    const existingUser = { username: "johndoe" };
    User.findOne = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUser);
    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Username already registered");
  });
});

  // Server errors
  it("Should return 500 if there is a server/database error", async () => {
  User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

  await createUser(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: "Error",
    cause: "Database error",
  });
  });
  });

describe("DELETE /deleteUser/:id - deleteUser Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.restoreAllMocks();
  });

  it("should delete a user and return 200 with user data", async () => {
    const mockUser = {
      _id: "123",
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      role: "employee",
    };
    jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(mockUser);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  });

  it("should return 404 if user not found", async () => {
    jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if no user id provided", async () => {
    req = { params: {} };
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
  });

  it("should return 500 if there is a server/database error", async () => {
    jest
      .spyOn(User, "findByIdAndDelete")
      .mockRejectedValue(new Error("Database error"));

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: "Database error",
    });
  });
});


import { jest } from "@jest/globals";
jest.unstable_mockModule("../../utils/tokenManager.js", () => ({
  createToken: jest.fn().mockReturnValue("mockJWTToken"),
}));

import * as tokenManager from "../../utils/tokenManager.js";
import User from "../../models/User.js";
import {
  createUser,
  getAllUsers,
  deleteUser,
} from "../../controllers/userControllers.js";
import bcrypt from "bcrypt";

describe("GET / - getAllUsers Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Reset all mocks before each test
    jest.restoreAllMocks();
  });

  it("returns all users with status 200", async () => {
    const fakeUsers = [{ name: "User1" }, { name: "User2" }];
    const sortMock = jest.fn().mockResolvedValue(fakeUsers);
    jest.spyOn(User, "find").mockReturnValue({ sort: sortMock });

    await getAllUsers(req, res);

    expect(User.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully retrieved a list of users: ",
      users: fakeUsers,
    });
  });

  it("Should return 500 if there is a server/database error", async () => {
    const error = new Error("Error in getting list of users");
    const sortMock = jest.fn().mockRejectedValue(error);
    jest.spyOn(User, "find").mockReturnValue({ sort: sortMock });

    await getAllUsers(req, res);

    expect(User.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: expect.any(String),
    });
  });
});

describe("POST /createUser - createUser Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        role: "employee",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    jest.restoreAllMocks(); // reset all mocks safely
  });

  it("Should create a user and return 201 with user data.", async () => {
    // Mock User.findOne to return null (no existing user)
    jest
      .spyOn(User, "findOne")
      .mockResolvedValueOnce(null) // for email check
      .mockResolvedValueOnce(null); // for username check

    // Mock bcrypt.hash to resolve immediately
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");

    // Create a simple mock for the User instance
    const mockUser = {
      _id: "123",
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: "hashedPassword",
      role: req.body.role,
      lastLogin: null,
    };

    // Mock the save method directly
    const mockSave = jest.fn().mockResolvedValue(mockUser);

    jest.spyOn(User.prototype, "save").mockImplementation(mockSave);

    await createUser(req, res);

    // Verify the calls
    expect(User.findOne).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
    expect(mockSave).toHaveBeenCalled();
    expect(tokenManager.createToken).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  }, 10000); // Increase timeout to 10 seconds for this test

describe("Validation Errors", () => {
  beforeEach(() => {
    User.findOne = jest.fn().mockResolvedValue(null);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword123");
  });

  it("Should return 500 if name is missing (Mongoose validation error)", async () => {
    delete req.body.name;

    const validationError = new Error(
      "User validation failed: name: Path `name` is required."
    );
    validationError.name = "ValidationError";

    jest.spyOn(User.prototype, "save").mockRejectedValue(validationError);
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: "User validation failed: name: Path `name` is required.",
    });
  });

  it("Should return 500 if username is missing (Mongoose validation error)", async () => {
    delete req.body.username;

    const validationError = new Error(
      "User validation failed: username: Path `username` is required."
    );
    validationError.name = "ValidationError";

    jest.spyOn(User.prototype, "save").mockRejectedValue(validationError);
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: "User validation failed: username: Path `username` is required.",
    });
  });
});

describe("Business Logic Errors", () => {
  it("Should return 400 if email already exists", async () => {
    const existingUser = { email: "john@example.com" };
    User.findOne = jest
      .fn()
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce(null);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Email already registered");
  });

  it("Should return 400 if username already exists", async () => {
    const existingUser = { username: "johndoe" };
    User.findOne = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUser);
    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Username already registered");
  });
});

  // Server errors
  it("Should return 500 if there is a server/database error", async () => {
  User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

  await createUser(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: "Error",
    cause: "Database error",
  });
  });
  });

describe("DELETE /deleteUser/:id - deleteUser Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.restoreAllMocks();
  });

  it("should delete a user and return 200 with user data", async () => {
    const mockUser = {
      _id: "123",
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      role: "employee",
    };
    jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(mockUser);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  });

  it("should return 404 if user not found", async () => {
    jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if no user id provided", async () => {
    req = { params: {} };
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
  });

  it("should return 500 if there is a server/database error", async () => {
    jest
      .spyOn(User, "findByIdAndDelete")
      .mockRejectedValue(new Error("Database error"));

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: "Database error",
    });
  });
});

