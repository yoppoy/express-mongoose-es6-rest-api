const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Users = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'email',
}, (email, password, next) => {
  Users.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return next(null, false, { errors: { 'email or password': 'is invalid' } });
      }
      return next(null, user);
    })
    .catch(next);
}));
