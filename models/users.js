var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    username: {
      type: String,
      index: true
    },
    password: {
      type: String
    },
    email: {
      type: String
    },
    name: {
      type: String
    },
    provider: {
      type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {

  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          // Store hash in your password DB.
          newUser.password = hash;
          newUser.save()  ;
      });
  });

}

module.exports.getUserByUsername = function(username, provider, callback) {
  var query = {
    username: username,
    provider: provider,
  };
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}
module.exports.createUserGoogle = function(newUser, callback) {
  newUser.save().then(function(res){
    callback(null, res);
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        // console.log(err, isMatch)
        if(err) throw err;
        callback(null, isMatch);
    });
  }
