var express = require('express');
var db = require('../connection');
var router = express.Router();

// Get all posts
router.get('/', (req,res) => {
  db.query(
    `SELECT users.username as poster, posts.*, distinctFavorites.*, ifnull(numberComments, 0) commentsCount, ifnull(likesCount, 0) postLikes, EXISTS(SELECT * FROM post_interaction WHERE userId=? AND postId=posts.id) liked
    FROM posts
    LEFT JOIN users ON users.userId = posts.posterId
    LEFT JOIN
        (SELECT comments.*, users.username as commenter
        FROM comments
        LEFT JOIN users
        ON users.userId = comments.commenterId
        WHERE commentId IN (
          SELECT MAX(commentId) AS commentId
          FROM (
              SELECT  a.id as postId, b.commentId, b.commentLikes
              FROM posts a 
              INNER JOIN comments b 
              ON a.id = b.postId
              INNER JOIN  (   
                    SELECT      postId, MAX(commentLikes) maxLikes   
                    FROM        comments   
                    GROUP BY    postId  ) post_favoriteComments
              ON  post_favoriteComments.postId = b.postId AND post_favoriteComments.maxLikes = b.commentLikes
          ) allFavoriteComments
        GROUP BY postId)) distinctFavorites
    ON posts.id = distinctFavorites.postId
    LEFT JOIN
        (SELECT postId, COUNT(commentId) numberComments
        FROM comments
        GROUP BY postId) countRef
    ON countRef.postId = posts.id
	  LEFT JOIN
      (SELECT postId, COUNT(postId) likesCount
      FROM post_interaction
      GROUP BY postId) likeRef
    ON likeRef.postId = posts.id
    ORDER BY posts.timestamp DESC`,
    [req.query.userId],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

//Get filtered posts
router.put('/getResults', (req,res) => {
  db.query(
    `SELECT filteredPosts.*, distinctFavorites.*, ifnull(numberComments, 0) commentsCount, ifnull(likesCount, 0) postLikes, EXISTS(SELECT * FROM post_interaction WHERE userId=? AND postId=filteredPosts.id) liked
    FROM (
		SELECT users.username as poster, posts.*
    FROM posts
		LEFT JOIN users ON users.userId = posts.posterId
		WHERE posts.postDetails LIKE ? OR users.username LIKE ?) filteredPosts
    LEFT JOIN
        (SELECT comments.*, users.username as commenter
        FROM comments
        LEFT JOIN users
        ON users.userId = comments.commenterId
        WHERE commentId IN (
          SELECT MAX(commentId) AS commentId
          FROM (
              SELECT  a.id as postId, b.commentId, b.commentLikes
              FROM posts a 
              INNER JOIN comments b 
              ON a.id = b.postId
              INNER JOIN  (   
                    SELECT      postId, MAX(commentLikes) maxLikes   
                    FROM        comments   
                    GROUP BY    postId  ) post_favoriteComments
              ON  post_favoriteComments.postId = b.postId AND post_favoriteComments.maxLikes = b.commentLikes
          ) allFavoriteComments
        GROUP BY postId)) distinctFavorites
    ON filteredPosts.id = distinctFavorites.postId
    LEFT JOIN
        (SELECT postId, COUNT(commentId) numberComments
        FROM comments
        GROUP BY postId) countRef
    ON countRef.postId = filteredPosts.id
    LEFT JOIN
        (SELECT postId, COUNT(postId) likesCount
        FROM post_interaction
        GROUP BY postId) likeRef
    ON likeRef.postId = filteredPosts.id
    ORDER BY filteredPosts.timestamp DESC`,
    [req.body.userId, req.body.searchQuery, req.body.searchQuery],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

//Get user's posts
router.get('/getUserPosts', (req,res) => {
  db.query(
    `SELECT filteredPosts.*, distinctFavorites.*, ifnull(numberComments, 0) commentsCount, ifnull(likesCount, 0) postLikes, EXISTS(SELECT * FROM post_interaction WHERE userId=? AND postId=filteredPosts.id) liked
    FROM (
		SELECT users.username as poster, posts.*
    FROM posts
		LEFT JOIN users ON users.userId = posts.posterId
		WHERE posts.posterId=?) filteredPosts
    LEFT JOIN
        (SELECT comments.*, users.username as commenter
        FROM comments
        LEFT JOIN users
        ON users.userId = comments.commenterId
        WHERE commentId IN (
          SELECT MAX(commentId) AS commentId
          FROM (
              SELECT  a.id as postId, b.commentId, b.commentLikes
              FROM posts a 
              INNER JOIN comments b 
              ON a.id = b.postId
              INNER JOIN  (   
                    SELECT      postId, MAX(commentLikes) maxLikes   
                    FROM        comments   
                    GROUP BY    postId  ) post_favoriteComments
              ON  post_favoriteComments.postId = b.postId AND post_favoriteComments.maxLikes = b.commentLikes
          ) allFavoriteComments
        GROUP BY postId)) distinctFavorites
    ON filteredPosts.id = distinctFavorites.postId
    LEFT JOIN
        (SELECT postId, COUNT(commentId) numberComments
        FROM comments
        GROUP BY postId) countRef
    ON countRef.postId = filteredPosts.id
    LEFT JOIN
      (SELECT postId, COUNT(postId) likesCount
      FROM post_interaction
      GROUP BY postId) likeRef
    ON likeRef.postId = filteredPosts.id
    ORDER BY filteredPosts.timestamp DESC`,
    [req.query.requestor, req.query.userId],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

// Add new post
router.post('/insert', (req,res) => {
  try {
  db.query(
    'INSERT INTO posts (posterId, postDetails) VALUES (?, ?)',
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
      'DELETE FROM posts WHERE id=? AND posterId=?',
      [req.body.id, req.body.userId],
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

router.post('/likePost', (req,res) => {
  try {
  db.query(
    `INSERT INTO post_interaction (postId, userId) VALUES (?, ?)`,
    [req.body.postId, req.body.userId],
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

router.delete('/unlikePost', (req,res) => {
  try {
    db.query(
      'DELETE FROM post_interaction WHERE postId=? AND userId=?',
      [req.body.postId, req.body.userId],
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
      'UPDATE posts SET postDetails=? WHERE id=? AND posterId=?',
      [req.body.postDetails, req.body.id, req.body.userId],
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

router.get('/getPost', (req,res) => {
  db.query(
    `SELECT posts.*, ifnull(likesCount, 0) postLikes, EXISTS(SELECT * FROM post_interaction WHERE userId=? AND postId=posts.id) liked
    FROM posts     
    LEFT JOIN       
      (SELECT postId, COUNT(postId) likesCount       
        FROM post_interaction
        GROUP BY postId) likeRef     
    ON likeRef.postId = posts.id
    WHERE posts.id = ?`,
    [req.query.userId, req.query.postId],
    (err, result) => {
      if(err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

module.exports = router;
