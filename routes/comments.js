var express = require('express');
var db = require('../connection');
var router = express.Router();

router.get('/', (req,res) => {
  db.query(
    `SELECT comments.*, users.username FROM comments
    LEFT JOIN users ON comments.userId = users.userId
    ORDER BY commentTimestamp DESC`,
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
    'INSERT INTO comments (userId, postId, commentText) VALUES (?, ?, ?)',
    [req.body.userId, req.body.postId, req.body.commentText],
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

module.exports = router;
