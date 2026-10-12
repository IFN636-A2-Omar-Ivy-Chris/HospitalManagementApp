const { expect } = require('chai');
const sinon = require('sinon');
const HomePageFacade = require('../facades/HomePageFacade');
const Note = require('../models/Note');

describe('HomePageFacade - navigation links by role', () => {
  const facade = new HomePageFacade();

  // The Facade reads notes from the database, so replace it with a fake one
  beforeEach(() => {
    sinon.stub(Note, 'find').resolves([]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('doctor sees Patient, Ward and Pharmacy links', async () => {
    const data = await facade.getHomePageData('doctor');
    const labels = data.links.map((link) => link.label);

    expect(labels).to.deep.equal(['Patient', 'Ward', 'Pharmacy']);
  });

  it('nurse sees Patient, Ward and Pharmacy links', async () => {
    const data = await facade.getHomePageData('nurse');
    const labels = data.links.map((link) => link.label);

    expect(labels).to.deep.equal(['Patient', 'Ward', 'Pharmacy']);
  });

  it('pharmacist does not see the Patient link', async () => {
    const data = await facade.getHomePageData('pharmacist');
    const labels = data.links.map((link) => link.label);

    expect(labels).to.deep.equal(['Ward', 'Pharmacy']);
  });

  it('unknown role sees no links', async () => {
    const data = await facade.getHomePageData('visitor');

    expect(data.links).to.deep.equal([]);
  });

  it('each link has a label and a path', async () => {
    const data = await facade.getHomePageData('doctor');

    data.links.forEach((link) => {
      expect(link).to.have.property('label');
      expect(link).to.have.property('path');
    });
  });

  it('returns all home page sections in one call', async () => {
    const data = await facade.getHomePageData('doctor');

    expect(data).to.have.all.keys('links', 'news', 'onCall', 'notes');
  });

  it('hides its internal methods (Encapsulation)', () => {
    expect(facade.getNavLinks).to.equal(undefined);
    expect(facade.getNews).to.equal(undefined);
  });
});
