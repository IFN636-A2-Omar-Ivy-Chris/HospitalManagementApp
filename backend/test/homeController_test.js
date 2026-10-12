const chai = require('chai');
const sinon = require('sinon');
const HomePageFacade = require('../facades/HomePageFacade');
const { getHomePage } = require('../controllers/homeController');
const { expect } = chai;

describe('GetHomePage Function Test', () => {

  it('should return home page data for the logged in user role', () => {
    // Mock request (protect middleware puts the user from the token into req.user)
    const req = { user: { id: 'user123', role: 'doctor' } };

    // Mock response
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    getHomePage(req, res);

    // Assertions
    expect(res.status.calledWith(200)).to.be.true;

    const data = res.json.firstCall.args[0];
    const labels = data.links.map((link) => link.label);
    expect(labels).to.deep.equal(['Patient', 'Ward', 'Pharmacy']);
  });

  it('should pass the user role to the Facade', () => {
    // Spy on the Facade to check what the controller sends it
    const facadeSpy = sinon.spy(HomePageFacade.prototype, 'getHomePageData');

    const req = { user: { id: 'user456', role: 'pharmacist' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    getHomePage(req, res);

    expect(facadeSpy.calledOnceWith('pharmacist')).to.be.true;

    const data = res.json.firstCall.args[0];
    const labels = data.links.map((link) => link.label);
    expect(labels).to.deep.equal(['Ward', 'Pharmacy']);

    // Restore original method
    facadeSpy.restore();
  });

  it('should return 500 if an error occurs', () => {
    // Stub the Facade to throw an error
    const facadeStub = sinon.stub(HomePageFacade.prototype, 'getHomePageData').throws(new Error('Facade Error'));

    // Hide the expected error log so the test output stays clean
    const consoleStub = sinon.stub(console, 'error');

    const req = { user: { id: 'user123', role: 'doctor' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    getHomePage(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;

    // Restore original methods
    facadeStub.restore();
    consoleStub.restore();
  });

});
