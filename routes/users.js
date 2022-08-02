var express = require('express');
const passport = require('passport');
const db = require('../connection');
var router = express.Router();
const genPassword = require('../passwordUtils').genPassword;

function userExists(req, res, next) {
  db.query('SELECT * FROM users where email= ?', [req.body.email], function(error, results, fields) {
    if (error) {
      console.log('Error');
    } else if (results.length > 0) {
      res.redirect('/userAlreadyExists')
    } else {
      next();
    }
  })
}

router.post('/register', userExists, (req, res) => {
  const saltHash = genPassword(req.body.pw);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  try {
  db.query(
    'INSERT INTO users(username, email, hash, salt) VALUES(?, ?, ?, ?)',
    [req.body.username, req.body.email, hash, salt],
    (err, result) => {
      if (err) {
      console.log(err);
    } 
      console.log("Successfully Entered");
      res.send(result);
    }
  );
  } catch(error) {
    console.error(error);
    res.status(500).send(error);
  }
});
  
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({msg: 'User not Authorized'});
  }
}

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
  if(req.isAuthenticated()) {
    res.send(req.data)
  } else {
    res.status(401).json({msg: 'Incorrect Password'})
  }
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    
  });
});

router.get('/currentUser', isAuth, (req,res) => {
  res.json(req.session.passport.user);
})

module.exports = router;
