const express = require('express');
const authController = require('./../controllers/authController');
const formidable = require('express-formidable');

const router = express.Router();

router.route('/signup').post(formidable(), authController.signUp);
router.route('/login').post(formidable(), authController.logIn);

module.exports = router;
