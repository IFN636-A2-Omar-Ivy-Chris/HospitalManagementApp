const { expect } = require('chai');
const sinon = require('sinon');
const HomePageFacade = require('../facades/HomePageFacade');
const Note = require('../models/Note');
const NewsRepository = require('../repositories/NewsRepository');

describe('HomePageFacade - navigation links by role', () => {
  const facade = new HomePageFacade();

  // The Facade reads notes from the database, so replace it with a fake one
  beforeEach(() => {
    sinon.stub(Note, 'find').resolves([]);
    sinon.stub(NewsRepository.prototype, 'findAll').resolves([]);
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

describe('HomePageFacade - personal notes', () => {
  const facade = new HomePageFacade();

  // Notes tests do not need real news
  beforeEach(() => {
    sinon.stub(NewsRepository.prototype, 'findAll').resolves([]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('only looks for notes written by the logged in user', async () => {
    const findStub = sinon.stub(Note, 'find').resolves([]);

    await facade.getHomePageData('doctor', 'user123');

    expect(findStub.calledOnceWith({ user: 'user123' })).to.be.true;
  });

  it('returns the user notes in the home page data', async () => {
    const myNotes = [{ _id: 'note1', user: 'user123', text: 'Check ward 3' }];
    sinon.stub(Note, 'find').resolves(myNotes);

    const data = await facade.getHomePageData('nurse', 'user123');

    expect(data.notes).to.deep.equal(myNotes);
  });
});

describe('HomePageFacade - news', () => {
  const facade = new HomePageFacade();

  // News tests do not need real notes
  beforeEach(() => {
    sinon.stub(Note, 'find').resolves([]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('returns the news from the news subsystem', async () => {
    const newsItems = [{ _id: 'news1', title: 'Flu clinic', body: 'Room 2.14', publishedAt: new Date('2026-10-01') }];
    sinon.stub(NewsRepository.prototype, 'findAll').resolves(newsItems);

    const data = await facade.getHomePageData('doctor', 'user123');

    expect(data.news).to.deep.equal(newsItems);
  });

  it('every role sees the same news', async () => {
    const newsItems = [{ _id: 'news1', title: 'Flu clinic', body: 'Room 2.14', publishedAt: new Date('2026-10-01') }];
    sinon.stub(NewsRepository.prototype, 'findAll').resolves(newsItems);

    const doctorData = await facade.getHomePageData('doctor', 'user1');
    const nurseData = await facade.getHomePageData('nurse', 'user2');
    const pharmacistData = await facade.getHomePageData('pharmacist', 'user3');

    expect(doctorData.news).to.deep.equal(newsItems);
    expect(nurseData.news).to.deep.equal(newsItems);
    expect(pharmacistData.news).to.deep.equal(newsItems);
  });

  it('returns an empty list when there is no news', async () => {
    sinon.stub(NewsRepository.prototype, 'findAll').resolves([]);

    const data = await facade.getHomePageData('nurse', 'user123');

    expect(data.news).to.deep.equal([]);
  });
});
