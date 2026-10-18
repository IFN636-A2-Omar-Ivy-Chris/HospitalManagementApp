const chai = require("chai");
const sinon = require("sinon");
const protect = require("../middleware/authMiddleware");

const { expect } = chai;

// Every router, with the base path it is mounted on in server.js
const routers = {
  "/api/auth": require("../routes/authRoutes"),
  "/api/wards": require("../routes/wardRoutes"),
  "/api/patients": require("../routes/patientRoutes"),
  "/api/patients/:patientId/medications": require("../routes/prescriptionRoutes"),
  "/api/home": require("../routes/homeRoutes"),
  "/api/notes": require("../routes/noteRoutes"),
  "/api/medications": require("../routes/medicationRoutes"),
};

// Routes anyone can use without logging in
const publicRoutes = ["POST /api/auth/login"];

// User role table: which roles may use each restricted route
const roleRules = {
  "POST /api/medications": ["pharmacist"],
  "PUT /api/medications/:id": ["pharmacist"],
  "DELETE /api/medications/:id": ["pharmacist"],
  "POST /api/patients/:patientId/medications": ["doctor"],
  "PUT /api/patients/:patientId/medications/:prescriptionId": ["doctor"],
  "DELETE /api/patients/:patientId/medications/:prescriptionId": ["doctor"],
  "POST /api/patients": ["doctor"],
  "PATCH /api/patients/:patientId/transfer": ["doctor"],
  "DELETE /api/patients/:patientId": ["doctor"],
};

const allRoles = ["doctor", "nurse", "pharmacist"];

// Reads every route straight from the routers, e.g. "POST /api/medications"
const routes = Object.entries(routers).flatMap(([base, router]) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => {
      const method = Object.keys(layer.route.methods)[0].toUpperCase();
      const path = layer.route.path === "/" ? base : base + layer.route.path;

      return {
        name: `${method} ${path}`,
        handlers: layer.route.stack.map((s) => s.handle),
      };
    }),
);

const mockResponse = () => ({
  status: sinon.stub().returnsThis(),
  json: sinon.spy(),
});

describe("NFR-02 Security: every route requires login", () => {
  routes
    .filter((route) => !publicRoutes.includes(route.name))
    .forEach((route) => {
      it(`${route.name} requires a valid token`, () => {
        expect(route.handlers).to.include(protect);
      });
    });
});

describe("NFR-02 Security: role restrictions match the user role table", () => {
  Object.entries(roleRules).forEach(([name, allowedRoles]) => {
    allRoles.forEach((role) => {
      const allowed = allowedRoles.includes(role);

      it(`${name} ${allowed ? "allows" : "refuses (403)"} a ${role}`, () => {
        const route = routes.find((r) => r.name === name);
        expect(route, `${name} exists`).to.exist;

        // The role check is the middleware straight after protect
        const roleCheck = route.handlers[route.handlers.indexOf(protect) + 1];
        const res = mockResponse();
        const next = sinon.spy();

        roleCheck({ user: { role } }, res, next);

        if (allowed) {
          expect(next.calledOnce).to.be.true;
        } else {
          expect(res.status.calledWith(403)).to.be.true;
          expect(next.notCalled).to.be.true;
        }
      });
    });
  });
});