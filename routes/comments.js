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

// missing commenter name?
router.get('/getComments/', (req,res) => {
  db.query(
    `SELECT comments.*, users.username as commenter, COUNT(ci.commentId) commentLikes, EXISTS(SELECT * FROM comment_interaction WHERE userId=? AND commentId=comments.commentId) commentLiked
    FROM comments
    LEFT JOIN users ON comments.commenterId = users.userId
    LEFT JOIN comment_interaction ci
    ON ci.commentId=comments.commentId
    WHERE postId=?
    GROUP BY commentId
    ORDER BY commentTimestamp DESC`,
    [req.query.userId, req.query.postId],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

router.get('/getComment', (req,res) => {
  db.query(
    `SELECT comments.*, users.username as commenter, COUNT(ci.commentId) commentLikes, EXISTS(SELECT * FROM comment_interaction WHERE userId=? AND commentId=comments.commentId) commentLiked
    FROM comments
    LEFT JOIN users ON comments.commenterId = users.userId
    LEFT JOIN comment_interaction ci
    ON ci.commentId=comments.commentId
    WHERE comments.commentId=?`,
    [req.query.userId, req.query.commentId],
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

router.post('/likeComment', (req,res) => {
  try {
  db.query(
    `INSERT INTO comment_interaction (commentId, userId) VALUES (?, ?)`,
    [req.body.commentId, req.body.userId],
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

router.delete('/unlikeComment', (req,res) => {
  try {
    db.query(
      'DELETE FROM comment_interaction WHERE commentId=? AND userId=?',
      [req.body.commentId, req.body.userId],
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
      'DELETE FROM comments WHERE commentId=? AND commenterId=?',
      [req.body.commentId, req.body.userId],
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
      'UPDATE comments SET commentText=? WHERE commentId=? AND commenterId=?',
      [req.body.commentText, req.body.commentId, req.body.userId],
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
