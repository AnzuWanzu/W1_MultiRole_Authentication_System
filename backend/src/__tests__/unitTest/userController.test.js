import { jest } from "@jest/globals";
import User from "../../models/User.js";
import { getAllUsers } from "../../controllers/userControllers.js";

describe("GET /user -getAllUsers Controller", () => {
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

  it("should return all users with status 200", async () => {
    const mockUsers = [{ name: "User1" }, { name: "User2" }];
    jest.spyOn(User, "find").mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockUsers),
    });

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully retrieved a list of users: ",
      users: mockUsers,
    });
  });

  it("should handle errors and return status 500", async () => {
    jest.spyOn(User, "find").mockImplementation(() => ({
      sort: jest.fn().mockRejectedValue(new Error("DB Error")),
    }));

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error",
      cause: expect.any(String),
    });
  });
});

// describe("POST /login - userLogin controller", () => {
//   //Happy Path
//   describe("given a username and password", () => {
//     // 1. Should call User.findOne with the username
//     // 2. Should check the password using compare()
//     // 3. Should update lastLogin field
//     // 4. Should call user.save()
//     // 5. Should return status 200
//     // 6. Should return response with username, role, lastLogin (but not password)
//   });
//   //Error Path
//   describe("when username does not exist", () => {});
//   describe("when password is invalid", () => {});
//   describe("when unexpected error occurs", () => {});
// });
