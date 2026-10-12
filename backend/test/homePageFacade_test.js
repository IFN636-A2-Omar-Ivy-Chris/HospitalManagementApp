const { expect } = require('chai');
const HomePageFacade = require('../facades/HomePageFacade');

describe('HomePageFacade - navigation links by role', () => {
  const facade = new HomePageFacade();

  it('doctor sees Patient, Ward and Pharmacy links', () => {
    const data = facade.getHomePageData('doctor');
    const labels = data.links.map((link) => link.label);

    expect(labels).to.deep.equal(['Patient', 'Ward', 'Pharmacy']);
  });

  it('nurse sees Patient, Ward and Pharmacy links', () => {
    const data = facade.getHomePageData('nurse');
    const labels = data.links.map((link) => link.label);

    expect(labels).to.deep.equal(['Patient', 'Ward', 'Pharmacy']);
  });

  it('pharmacist does not see the Patient link', () => {
    const data = facade.getHomePageData('pharmacist');
    const labels = data.links.map((link) => link.label);

    expect(labels).to.deep.equal(['Ward', 'Pharmacy']);
  });

  it('unknown role sees no links', () => {
    const data = facade.getHomePageData('visitor');

    expect(data.links).to.deep.equal([]);
  });

  it('each link has a label and a path', () => {
    const data = facade.getHomePageData('doctor');

    data.links.forEach((link) => {
      expect(link).to.have.property('label');
      expect(link).to.have.property('path');
    });
  });

  it('returns all home page sections in one call', () => {
    const data = facade.getHomePageData('doctor');

    expect(data).to.have.all.keys('links', 'news', 'onCall', 'notes');
  });

  it('hides its internal methods (Encapsulation)', () => {
    expect(facade.getNavLinks).to.equal(undefined);
    expect(facade.getNews).to.equal(undefined);
  });
});
