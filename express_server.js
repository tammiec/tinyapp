const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use((bodyParser.urlencoded({extended: true})));
app.use(cookieSession( {
  name: 'session',
  keys: ['user_id']
}));

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: 'sampleID' },
  '9sm5xK': { longURL: "http://www.google.com", userID: 'sampleID' }
};

const users = {
  "sampleID": {
    id: "sampleID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const emailLookup = function(email) {
  const entries = Object.entries(users);
  for (let user of entries) {
    if (user[1].email === email) {
      return user[1].id;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let keys = Object.keys(urlDatabase);
  let filteredURL = {};
  for (let key of keys) {
    if (urlDatabase[key].userID === id) {
      filteredURL[key] = urlDatabase[key];
    }
  }
  return filteredURL;
}; 

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

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  if (!emailLookup(req.body.email)) {
    res.sendStatus(403);
  } else if (!bcrypt.compareSync(req.body.password, users[emailLookup(req.body.email)].password)) {
    res.sendStatus(403);
  } else {
    req.session.user_id = users[emailLookup(req.body.email)].id
    res.redirect('/urls');
    console.log('User logged in successfully!')
  }
});

app.post('/logout', (req, res) => {
  console.log('User logged out!')
  req.session = null;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.render('urls_landing', templateVars);
  } else {
    res.render('urls_index', templateVars);
  }
});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '' || emailLookup(req.body.email)) {
    res.sendStatus(400);
  } else {
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newId;
    res.redirect('/urls');
  }
});

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {
  let newId = generateRandomString();
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${newId}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user || templateVars.user.id !== urlDatabase[req.params.shortURL].userID) {
    res.render('urls_landing', templateVars);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user || templateVars.user.id !== urlDatabase[req.params.shortURL].userID) {
    res.render('urls_landing', templateVars);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});