// DEPENDENCIES, MIDDLEWARE, & MODULES
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const { URL, User } = require('./classes');

app.set('view engine', 'ejs');
app.use((bodyParser.urlencoded({extended: true})));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['user_id', 'visitor']
}));
app.use(methodOverride('_method'));

// DATABASES
const urlDatabase = {
  b2xVn2: { 
    longURL: "http://www.lighthouselabs.ca", 
    userID: 'sampleID',
    totalVisitors: 0,
    uniqueVisitors: 0,
  }
};

const users = {
  "sampleID": {
    id: "sampleID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  }
};

// ROUTE HANDLERS

// root redirects users to /urls
app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// redirects to /urls if user is already logged in
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
});

// Log in a user if they are in the users database and their password matches
app.post('/login', (req, res) => {
  if (!getUserByEmail(req.body.email, users) || !bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].password)) {
    res.status(403).send('This email and/or password does not exist. Please <a href="/login">try again</a> or <a href="/register">create an account</a>.');
  } else {
    req.session.user_id = users[getUserByEmail(req.body.email, users)].id;
    res.redirect('/urls');
  }
});

// logs a user out and removes the session
app.delete('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// shows all shortened urls, only accessible by users who are logged in
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.render('urls_denied', templateVars);
  } else {
    res.render('urls_index', templateVars);
  }
});

// redirects to /urls if user is already logged in
app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

// add a new user to the database if their email and password are valid (ie. not empty strings) and if they don't already have an account
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('This email and/or password is not valid. Please <a href="/register">try again</a> with a valid username and password.');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('This user already exists. Please <a href="/login">log in</a> or <a href="/register">create a new account</a>.');
  } else {
    let newId = generateRandomString();
    users[newId] = new User(newId, req.body.email, req.body.password);
    req.session.user_id = newId;
    res.redirect('/urls');
  }
});

// redirects to /login if user is not logged in
app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

// creates a new shortURL
app.post('/urls', (req, res) => {
  let newId = generateRandomString();
  urlDatabase[newId] = new URL(req.body.longURL, req.session.user_id);
  res.redirect(`/urls/${newId}`);
});

// displays the shortURL page only to the owner of that shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send('This shortURL does not exist. Click <a href="/urls">here</a> to return to homepage.');
  } else {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL, 
      user: users[req.session.user_id], 
      uniqueVisitors: urlDatabase[req.params.shortURL].uniqueVisitors, 
      totalVisitors: urlDatabase[req.params.shortURL].totalVisitors,
      visitHistory: urlDatabase[req.params.shortURL].visitHistory
    };
    if (!templateVars.user || templateVars.user.id !== urlDatabase[req.params.shortURL].userID) {
      res.render('urls_denied', templateVars);
    } else {
      res.render("urls_show", templateVars);
    }
  }
});

// allows the user who owns the shortURL to change the longURL
app.put("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user || templateVars.user.id !== urlDatabase[req.params.shortURL].userID) {
    res.render('urls_denied', templateVars);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});

// redirects to longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send('This shortURL does not exist. Click <a href="/urls">here</a> to return to homepage.');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    let visitorID;
    if (!req.cookies.visitor) {
      visitorID = generateRandomString();
    } else {
      visitorID = req.cookies.visitor;
    }
    urlDatabase[req.params.shortURL].countTotalVisitors();
    urlDatabase[req.params.shortURL].countUniqueVisitors(visitorID);
    urlDatabase[req.params.shortURL].addVisitHistory(visitorID);
    res.cookie('visitor', visitorID).redirect(longURL);
  }
});

// allows the user who owns the shortURL to delete it from the database
app.delete('/urls/:shortURL', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user || templateVars.user.id !== urlDatabase[req.params.shortURL].userID) {
    res.render('urls_denied', templateVars);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});