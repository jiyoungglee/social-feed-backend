var express = require('express');
const passport = require('passport');
const db = require('../connection');
var router = express.Router();
const genPassword = require('../passwordUtils').genPassword;

function userExists(req, res, next) {
  db.query('SELECT * FROM users where email= ?', [req.body.email], function(error, results, fields) {
    if (error) {
      res.status(500).send('Invalid Request')
    } else if (results.length > 0) {
      res.status(500).send('User already exists')
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
        throw new Error(err);
      } 
      res.sendStatus(200);
    }
  );
  } catch(error) {
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

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send(req.user);
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) res.status(500).send(err)});
  res.sendStatus(200);
}); 

router.get('/currentUser', isAuth, (req,res) => {
  res.json(req.session.passport.user);
});

module.exports = router;
