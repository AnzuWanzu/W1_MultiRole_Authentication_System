import supertest from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "testsecret";
	await mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
});

describe("User integration tests", () => {
	test("POST /api/v1/user/createUser creates a user", async () => {
		const res = await supertest(app)
			.post("/api/v1/user/createUser")
			.send({
				name: "Test User",
				username: "testuser",
				email: "testuser@example.com",
			password: "Password123",
				role: "employee",
			})
			.expect(201);

		expect(res.body).toHaveProperty("message");
		expect(res.body).toHaveProperty("username", "testuser");
		expect(res.body).toHaveProperty("email", "testuser@example.com");
	});

	test("GET /api/v1/user returns created users", async () => {
		// create a user first
		await supertest(app)
			.post("/api/v1/user/createUser")
			.send({
				name: "Another",
				username: "anotheruser",
				email: "another@example.com",
			password: "Password123",
				role: "employee",
			})
			.expect(201);

		const res = await supertest(app).get("/api/v1/user").expect(200);
		expect(res.body).toHaveProperty("users");
		expect(Array.isArray(res.body.users)).toBe(true);
		expect(res.body.users.length).toBeGreaterThanOrEqual(1);
	});
});

