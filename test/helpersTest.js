const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: 'sampleID' },
  '9sm5xK': { longURL: "http://www.google.com", userID: 'sampleID' }
};

describe('getUserByEmail', () => {
  it('should return a user id with valid email', () => {
    const userId = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(userId, expectedOutput);
  });
  it('should return undefined for an email that is not in the database', () => {
    const userId = getUserByEmail('hello@example.com', testUsers);
    assert.isUndefined(userId);
  });
});

describe('urlsForUser', () => {
  it('should return an object containing all the URLs that a user owns', () => {
    const userUrls = urlsForUser('sampleID', urlDatabase);
    const expectedOutput = {
      b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: 'sampleID' },
      '9sm5xK': { longURL: "http://www.google.com", userID: 'sampleID' }
    };
    assert.deepEqual(userUrls, expectedOutput);
  });
  it('should return an empty object for a user that owns no URLs', () => {
    const userUrls = urlsForUser('sampleID2', urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(userUrls, expectedOutput);
  });
});