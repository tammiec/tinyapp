const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

app.set('view engine', 'ejs');
app.use((bodyParser.urlencoded({extended: true})));
app.use(cookieSession({
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
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
});

app.post('/login', (req, res) => {
  if (!getUserByEmail(req.body.email, users) || !bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].password)) {
    res.status(403).send('This email and/or password does not exist. Please <a href="/login">try again</a> or <a href="/register">create an account</a>.');
  } else {
    req.session.user_id = users[getUserByEmail(req.body.email, users)].id;
    res.redirect('/urls');
    console.log('User logged in successfully!');
  }
});

app.post('/logout', (req, res) => {
  console.log('User logged out!');
  req.session = null;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.render('urls_landing', templateVars);
  } else {
    res.render('urls_index', templateVars);
  }
});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('This email and/or password is not valid. Please <a href="/register">try again</a> with a valid username and password.');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('This user already exists. Please <a href="/login">log in</a> or <a href="/register">create a new account</a>.');
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
  if (!urlDatabase[req.params.shortURL]) {
    res.send('This shortURL does not exist. Click <a href="/urls">here</a> to return to homepage.');
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    if (!templateVars.user || templateVars.user.id !== urlDatabase[req.params.shortURL].userID) {
      res.render('urls_landing', templateVars);
    } else {
      res.render("urls_show", templateVars);
    }
  }
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
  if (!urlDatabase[req.params.shortURL]) {
    res.send('This shortURL does not exist. Click <a href="/urls">here</a> to return to homepage.');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
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