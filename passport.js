const db = require('./connection');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const validPassword = require('./passwordUtils').validPassword;

const customFields = {
  usernameField: 'email',
  passwordField: 'pw',
};

const verifyCallback = (email, password, done) => {
  db.query('SELECT  * FROM users WHERE email = ? ', [email], function(error, results, fields) {
    if (error) {return done(error)}
    if (results.length===0) {return done(null, false)}

    const isValid = validPassword(password, results[0].hash, results[0].salt);
    user = {
      userId: results[0].userId,
      email: results[0].email
    };

    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}

const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.userId)
});

passport.deserializeUser((userId, done) => {
  db.query('SELECT * FROM users where userId = ?', [userId], function(error, results) {
    done(null, results[0]);
  });
});

module.exports = passport;