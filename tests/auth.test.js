const request = require("supertest");
const app = require("../src/app");

describe("Authentication Tests", () => {
    const testUser = {
        name: "Test Student",
        email: `test${Date.now()}@test.com`,
        password: "123456"
    };

    let token;

    test("Register a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(201);
        expect(response.body.user).not.toHaveProperty("password");
    });

    test("Register fails on duplicate email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Email already exists");
    });

    test("Login fails with wrong password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: testUser.email,
                password: "wrongpassword"
            });

        expect(response.statusCode).toBe(401);
    });

    test("Login succeeds with correct credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send(testUser);

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();

        token = response.body.token;
    });

    test("Protected route rejects missing token", async () => {
        const response = await request(app)
            .get("/api/test/protected");

        expect(response.statusCode).toBe(401);
    });

    test("Protected route accepts valid token", async () => {
        const response = await request(app)
            .get("/api/test/protected")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    test("Invalid token returns 401", async () => {
        const response = await request(app)
            .get("/api/test/protected")
            .set("Authorization", "Bearer invalidtoken");

        expect(response.statusCode).toBe(401);
    });

    test("Student is blocked from Admin route", async () => {
        const response = await request(app)
            .get("/api/test/admin")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });
});