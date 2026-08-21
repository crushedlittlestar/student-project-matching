const authorize = require("../src/middlewares/role.middleware");

describe("Role Authorization Middleware", () => {
    test("Student is blocked from Admin-only route", () => {
        const req = {
            user: {
                role: "Student"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const middleware = authorize("Admin");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Access denied"
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("Admin is allowed to access Admin-only route", () => {
        const req = {
            user: {
                role: "Admin"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        const middleware = authorize("Admin");

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});