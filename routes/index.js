var express = require('express');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
  res.render('index');
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login')
  }
}
module.exports = router;
