const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use((bodyParser.urlencoded({extended: true})));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const emailLookup = function(email) {
  const entries = Object.entries(users);
  for (let user of entries) {
    if (user[1].email === email) {
      return true
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  res
    .cookie('email', req.body.email)
    .redirect('/urls');
});

app.post('/logout', (req, res) => {
  res
    .clearCookie('user_id')
    .redirect('/urls');
})

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  console.log('New User:', req.body)
  if (req.body.email === '' || req.body.password === '' || emailLookup(req.body.email)) {
    res.sendStatus(400);
  } else {
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: req.body.password
    };
    console.log('Current users:', users);
    res
      .cookie('user_id', newId)
      .redirect('/urls');
  }
});

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  let newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {  
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});