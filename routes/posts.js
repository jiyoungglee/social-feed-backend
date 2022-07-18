var express = require('express');
var db = require('../connection');
var router = express.Router();

router.get('/', (req,res) => {
  db.query(
    `SELECT usersPost.username as poster, posts.*, JSON_ARRAYAGG(
      JSON_OBJECT(
        'commentId', comments.commentId, 
        'commenter', usersComment.username,
        'commentLikes', comments.commentLikes, 
        'commentText', comments.commentText, 
        'commentTimestamp', comments.commentTimestamp
      )
    ) as comments
    FROM posts
    LEFT JOIN comments ON comments.postId = posts.id
    LEFT JOIN users usersPost
    ON usersPost.userId = posts.userId
    LEFT JOIN users usersComment
    ON usersComment.userId = comments.userId
    GROUP BY posts.id
    ORDER BY timestamp DESC`,
    (err, result) => {
      if(err) {
        console.log(err);
      }
      result.forEach(post => post.comments = JSON.parse(post.comments))
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

//UDPATE LIKES
router.put('/updatelikes', (req,res) => {
  try {
    db.query(
      'UPDATE posts SET postLikes=? WHERE id=?',
      [req.body.postLikes, req.body.id],
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

//UDPATE POST
router.put('/updatepost', (req,res) => {
  try {
    db.query(
      'UPDATE posts SET postDetails=? WHERE id=?',
      [req.body.postDetails, req.body.id],
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
