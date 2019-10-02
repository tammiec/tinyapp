const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const getUserByEmail = function(email, database) {
  const entries = Object.entries(database);
  for (let user of entries) {
    if (user[1].email === email) {
      return user[1].id;
    }
  }
  return false;
};

const urlsForUser = function(id, database) {
  let keys = Object.keys(database);
  let filteredURL = {};
  for (let key of keys) {
    if (database[key].userID === id) {
      filteredURL[key] = database[key];
    }
  }
  return filteredURL;
}; 

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
}