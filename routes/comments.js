var express = require('express');
var db = require('../connection');
var router = express.Router();

router.get('/', (req,res) => {
  db.query(
    `SELECT comments.*, users.username as commenter FROM comments
    LEFT JOIN users ON comments.commenterId = users.userId
    ORDER BY commentTimestamp DESC`,
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

router.get('/getComments/:postId', (req,res) => {
  db.query(
    `SELECT comments.*, users.username as commenter FROM comments
    LEFT JOIN users ON comments.commenterId = users.userId
    WHERE postId=?
    ORDER BY commentTimestamp DESC`,
    [req.params.postId],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

router.get('/getComment/:commentId', (req,res) => {
  db.query(
    `SELECT comments.*, users.username as commenter FROM comments
    LEFT JOIN users ON comments.commenterId = users.userId
    WHERE commentId=?
    ORDER BY commentTimestamp DESC`,
    [req.params.commentId],
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
    `INSERT INTO comments (commenterId, postId, commentText) VALUES (?, ?, ?)`,
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

//UDPATE LIKES
router.put('/updatelikes', (req,res) => {
  try {
    db.query(
      'UPDATE comments SET commentLikes=? WHERE commentId=?',
      [req.body.commentLikes, req.body.commentId],
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

router.delete('/deletecomment', (req,res) => {
  try {
    db.query(
      'DELETE FROM comments WHERE commentId=?',
      [req.body.commentId],
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

router.put('/updatecomment', (req,res) => {
  try {
    db.query(
      'UPDATE comments SET commentText=? WHERE commentId=?',
      [req.body.commentText, req.body.commentId],
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
