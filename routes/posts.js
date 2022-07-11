var express = require('express');
var db = require('../connection');
var router = express.Router();

router.get('/', (req,res) => {
  db.query(
    'SELECT * FROM posts',
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

router.post('/insert', (req,res) => {
  try {
  db.query(
    'INSERT INTO posts (userId, postDetails) VALUES (?, ?)',
    [req.body.userId, req.body.postDetails],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
  } catch(error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.delete('/deletepost', (req,res) => {
  try {
    db.query(
      'DELETE FROM posts WHERE id=?',
      [req.body.id],
      (err, result) => {
        if(err) {
          console.log(err);
        }
        res.send(result);
      }
    );
    } catch(error) {
      console.error(error);
      res.status(500).send(error);
    }
})

module.exports = router;
