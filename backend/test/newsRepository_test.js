const { expect } = require('chai');
const sinon = require('sinon');
const News = require('../models/News');
const NewsRepository = require('../repositories/NewsRepository');
const BaseRepository = require('../repositories/BaseRepository');

describe('NewsRepository Test', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should list news from newest to oldest', async () => {
    // Fake database: News.find() returns something with a sort() method
    const sortStub = sinon.stub().resolves([]);
    sinon.stub(News, 'find').returns({ sort: sortStub });

    await new NewsRepository().findAll();

    expect(sortStub.calledOnceWith({ publishedAt: -1 })).to.be.true;
  });

  it('should return the news from the database', async () => {
    const newsItems = [
      { _id: 'news2', title: 'Newer news', publishedAt: new Date('2026-10-13') },
      { _id: 'news1', title: 'Older news', publishedAt: new Date('2026-10-01') }
    ];
    sinon.stub(News, 'find').returns({ sort: sinon.stub().resolves(newsItems) });

    const result = await new NewsRepository().findAll();

    expect(result).to.deep.equal(newsItems);
  });

  it('should inherit from BaseRepository (Inheritance)', () => {
    expect(new NewsRepository()).to.be.an.instanceOf(BaseRepository);
  });

});
