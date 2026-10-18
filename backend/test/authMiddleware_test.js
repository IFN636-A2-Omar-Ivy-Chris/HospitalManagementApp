const chai = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const { expect } = chai;

const mockResponse = () => ({
  status: sinon.stub().returnsThis(),
  json: sinon.spy(),
});

describe("Role access: pharmacy (PHA) and prescribing (MED)", () => {
  it("should allow a pharmacist to manage medications", () => {
    const next = sinon.spy();
    const res = mockResponse();

    authorizeRoles("pharmacist")({ user: { role: "pharmacist" } }, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.status.notCalled).to.be.true;
  });

  it("should return 403 if a doctor tries to manage medications", () => {
    const next = sinon.spy();
    const res = mockResponse();

    authorizeRoles("pharmacist")({ user: { role: "doctor" } }, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should allow a doctor to prescribe medication", () => {
    const next = sinon.spy();
    const res = mockResponse();

    authorizeRoles("doctor")({ user: { role: "doctor" } }, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it("should return 403 if a nurse tries to prescribe medication", () => {
    const next = sinon.spy();
    const res = mockResponse();

    authorizeRoles("doctor")({ user: { role: "nurse" } }, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 403 if a pharmacist tries to prescribe medication", () => {
    const next = sinon.spy();
    const res = mockResponse();

    authorizeRoles("doctor")({ user: { role: "pharmacist" } }, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(next.notCalled).to.be.true;
  });
});

describe("Authentication: protect", () => {
  const secret = "test-secret";

  let originalSecret;

  beforeEach(() => {
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = secret;
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
    sinon.restore();
  });

  it("should allow a request with a valid token and attach the user", () => {
    const token = jwt.sign({ id: "user123", role: "pharmacist" }, secret);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = sinon.spy();

    protect(req, mockResponse(), next);

    expect(next.calledOnce).to.be.true;
    expect(req.user).to.include({ id: "user123", role: "pharmacist" });
  });

  it("should return 401 if no token is provided", () => {
    const res = mockResponse();
    const next = sinon.spy();

    protect({ headers: {} }, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 401 if the token is invalid", () => {
    const res = mockResponse();
    const next = sinon.spy();

    protect({ headers: { authorization: "Bearer abc123" } }, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 401 if the token has expired", () => {
    const token = jwt.sign({ id: "user123" }, secret, { expiresIn: -10 });
    const res = mockResponse();
    const next = sinon.spy();

    protect({ headers: { authorization: `Bearer ${token}` } }, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(next.notCalled).to.be.true;
  });
});