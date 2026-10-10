const { expect } = require('chai');

describe('CI Setup Check', () => {
  it('should run the test pipeline', () => {
    expect(1 + 1).to.equal(2);
  });
});