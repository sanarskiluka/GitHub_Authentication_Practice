'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const routes = require('./routes.js');
const auth = require('./auth.js');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');

const app = express();

app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

myDB(async client => {
  const Users = await client.db('database').collection('users');
  routes(app, Users);
  auth(app, Users);
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
