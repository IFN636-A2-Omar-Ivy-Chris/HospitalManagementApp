const chai = require('chai');
const sinon = require('sinon');
const Note = require('../models/Note');
const { addNote, updateNote, deleteNote } = require('../controllers/noteController');
const { expect } = chai;

// Mock response used by every test
const mockResponse = () => ({
  status: sinon.stub().returnsThis(),
  json: sinon.spy()
});

describe('AddNote Function Test', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should create a note for the logged in user', async () => {
    const req = { user: { id: 'user123' }, body: { text: 'Check ward 3' } };
    const res = mockResponse();

    const createdNote = { _id: 'note1', user: 'user123', text: 'Check ward 3' };
    const createStub = sinon.stub(Note, 'create').resolves(createdNote);

    await addNote(req, res);

    // The owner comes from the token (req.user), not from the request body
    expect(createStub.calledOnceWith({ user: 'user123', text: 'Check ward 3' })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdNote)).to.be.true;
  });

  it('should return 400 if the note is empty', async () => {
    const req = { user: { id: 'user123' }, body: { text: '' } };
    const res = mockResponse();
    const createStub = sinon.stub(Note, 'create');

    await addNote(req, res);

    expect(createStub.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Note cannot be empty' })).to.be.true;
  });

  it('should return 400 if the note is only spaces', async () => {
    const req = { user: { id: 'user123' }, body: { text: '   ' } };
    const res = mockResponse();
    const createStub = sinon.stub(Note, 'create');

    await addNote(req, res);

    expect(createStub.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const req = { user: { id: 'user123' }, body: { text: 'Check ward 3' } };
    const res = mockResponse();
    sinon.stub(Note, 'create').rejects(new Error('DB Error'));
    sinon.stub(console, 'error');

    await addNote(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
  });

});

describe('UpdateNote Function Test', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should update the note if the user is the owner', async () => {
    const note = { _id: 'note1', user: 'user123', text: 'Old text', save: sinon.stub() };
    note.save.resolves(note);
    sinon.stub(Note, 'findById').resolves(note);

    const req = { params: { noteId: 'note1' }, user: { id: 'user123' }, body: { text: 'New text' } };
    const res = mockResponse();

    await updateNote(req, res);

    expect(note.text).to.equal('New text');
    expect(note.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('should return 403 if the user is not the owner', async () => {
    const note = { _id: 'note1', user: 'user123', text: 'Old text', save: sinon.stub() };
    sinon.stub(Note, 'findById').resolves(note);

    const req = { params: { noteId: 'note1' }, user: { id: 'otherUser' }, body: { text: 'Hacked' } };
    const res = mockResponse();

    await updateNote(req, res);

    expect(note.text).to.equal('Old text');
    expect(note.save.called).to.be.false;
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 404 if the note is not found', async () => {
    sinon.stub(Note, 'findById').resolves(null);

    const req = { params: { noteId: 'missing' }, user: { id: 'user123' }, body: { text: 'New text' } };
    const res = mockResponse();

    await updateNote(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Note not found' })).to.be.true;
  });

  it('should return 400 if the new text is empty', async () => {
    const findStub = sinon.stub(Note, 'findById');

    const req = { params: { noteId: 'note1' }, user: { id: 'user123' }, body: { text: '' } };
    const res = mockResponse();

    await updateNote(req, res);

    expect(findStub.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Note, 'findById').rejects(new Error('DB Error'));
    sinon.stub(console, 'error');

    const req = { params: { noteId: 'note1' }, user: { id: 'user123' }, body: { text: 'New text' } };
    const res = mockResponse();

    await updateNote(req, res);

    expect(res.status.calledWith(500)).to.be.true;
  });

});

describe('DeleteNote Function Test', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should delete the note if the user is the owner', async () => {
    const note = { _id: 'note1', user: 'user123', deleteOne: sinon.stub().resolves() };
    sinon.stub(Note, 'findById').resolves(note);

    const req = { params: { noteId: 'note1' }, user: { id: 'user123' } };
    const res = mockResponse();

    await deleteNote(req, res);

    expect(note.deleteOne.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Note deleted successfully' })).to.be.true;
  });

  it('should return 403 if the user is not the owner', async () => {
    const note = { _id: 'note1', user: 'user123', deleteOne: sinon.stub().resolves() };
    sinon.stub(Note, 'findById').resolves(note);

    const req = { params: { noteId: 'note1' }, user: { id: 'otherUser' } };
    const res = mockResponse();

    await deleteNote(req, res);

    expect(note.deleteOne.called).to.be.false;
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 404 if the note is not found', async () => {
    sinon.stub(Note, 'findById').resolves(null);

    const req = { params: { noteId: 'missing' }, user: { id: 'user123' } };
    const res = mockResponse();

    await deleteNote(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Note, 'findById').rejects(new Error('DB Error'));
    sinon.stub(console, 'error');

    const req = { params: { noteId: 'note1' }, user: { id: 'user123' } };
    const res = mockResponse();

    await deleteNote(req, res);

    expect(res.status.calledWith(500)).to.be.true;
  });

});
