const express = require('express');
const postsController = require('./../controllers/postsController');
const formidable = require('express-formidable');

const router = express.Router();

router
  .route('/all')
  .get(postsController.protect, formidable(), postsController.getPosts);
router
  .route('/create')
  .post(postsController.protect, formidable(), postsController.createPosts);

module.exports = router;
