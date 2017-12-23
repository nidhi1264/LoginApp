var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/users');
var router = express.Router();
require('dotenv').config();
router.get('/register', function(req, res) {
  res.render('register');
})

router.get('/login', function(req, res) {
  res.render('login');
})

router.post('/register', function(req, res) {
  // res.render('register');
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors) {
    console.log('YES');
    res.render('register', {
      errors : errors
    })
  } else {
    // console.log('No');
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      provider: 'local',
    });
    User.createUser(newUser, function(err, user){
      if (err) throw err;
    })

    req.flash('success_msg', 'You are registerd and can now login');
    res.redirect('login')
  }

})

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, 'local', function(err, user){
      if(err) throw err;
      if(!user) {
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      })

    })

  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users/login',
                                   failureFlash: true }),

  function(req, res) {
    res.redirect('/');
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/users/auth/google/callback",
    scope: ['email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("profile", profile);
    var newUser = new User({
      name: profile.name.givenName,
      email: profile.emails[0].value,
      username: profile.displayName,
      provider: profile.provider
    });
    User.getUserByUsername(newUser.username, newUser.provider, function(err, user){
      if (err) throw err;
      if(user == null) {
        User.createUserGoogle(newUser, function(err, user) {
          if(err) throw err;
          if(user){
            return done(null, user);
          } else {
            return done(null, false, {message: 'Something went wrong'});
          }
        })
      } else {
        return done(null, user);
      }
    })
  }
));
router.get('/auth/google',
  passport.authenticate('google',  function(err, user) {
    console.log('111', user, err)
      if (err) throw err;
      if (!user) {  res.redirect('/users/login'); }
      res.redirect('/')
    })
);

router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  }), function(err, user) {
      if (err) throw err;
      if (!user) { res.redirect('/users/login') }
      res.redirect('/');

    }
);

// router.get('/auth/google', function(req, res) {
//   console.log('calll')
//   passport.authenticate('google',  function(err, user) {
//     console.log(err, user)
//       if (err) throw err;
//       if (!user) {  res.redirect('/login'); }
//     });
// })

// router.get('/auth/google/callback', function(req, res) {
//   console.log('call')
//   passport.authenticate('google',  function(err, user) {
//       console.log('err', err)
//       console.log("user", user)
//       if (err) { res.redirect('users/login') }
//       if (!user) { res.redirect('users/login') }
//         req.login(user, function(err) {
//         if (err) throw err;
//         res.redirect('/');
//       });
//     });
// });

router.get('/logout', function(req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');

  });
module.exports = router;
