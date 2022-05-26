const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = function(app, Users) {
  app.route('/').get((req, res) => {
    res.render('pug', { title: "Connected to Database", message: "Please login", showLogin: true, showRegistration: true })
  });

  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });

  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/register').post((req, res, next) => {
    Users.findOne({ username: req.body.username }, (err, user) => {
      if(err) {
        next(err);
      } else if(user) {
        res.redirect('/');
      } else {
        Users.insertOne({
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, 12)
        },
          (err, doc) => {
            if(err) {
              res.redirect('/');
            } else {
              console.log(doc.ops[0]);
              next(null, doc.ops[0]);
            }
          }
        );
      }
    });
  },
  passport.authenticate('local', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  });

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile.pug', { username: req.user.username });
  });

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
}