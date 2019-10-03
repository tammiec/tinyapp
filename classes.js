const bcrypt = require('bcrypt');

// creates a new shortURL
class URL {
  constructor(longURL, userID) {
    this.longURL = longURL,
    this.userID = userID,
    this.totalVisitors = 0,
    this.uniqueVisitors = 0,
    this.visitHistory = [];
  }
  countTotalVisitors() {
    this.totalVisitors++;
  }
  countUniqueVisitors(currentVisitor) {
    if (this.visitHistory.find(log => log.visitor === currentVisitor)) {
      return;
    } else {
      this.uniqueVisitors++;
    }
  }
  addVisitHistory(visitor) {
    const newVisitor = {
      visitor: visitor,
      timestamp: new Date()
    }
    this.visitHistory.push(newVisitor);
  } 
};

// creates a new user
class User {
  constructor(id, email, password) {
    this.id = id,
    this.email = email,
    this.password = bcrypt.hashSync(password, 10)
  }
};

module.exports = {
  URL,
  User
}