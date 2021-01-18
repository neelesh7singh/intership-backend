const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { promisify } = require('util');
const sharp = require('sharp');
const User = require('./../models/userModel');
const Post = require('./../models/postModel');

// Returns all the posts in the database
exports.getPosts = catchAsync(async (req, res, next) => {
  const data = await Post.find();
  res.json(data);
});

// Creates Post
exports.createPosts = catchAsync(async (req, res, next) => {
  const { about, lat, lng } = req.fields;
  const { img } = req.files;
  if (!img && !about) {
    res.json({
      status: 'Failed',
      message: 'Post should have at least one entry',
    });
    return;
  }
  if (!lat || !lng) {
    console.log('No coord');
    res.json({
      status: 'Failed',
      message: 'Something went wrong while creating the post, please try again',
    });
    return;
  }

  let country;
  const config = {
    headers: {
      'content-type': 'multipart/form-data',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };

  // Gets the name of country from the coordinates
  axios
    .get(
      `http://api.positionstack.com/v1/reverse?access_key=${process.env.ACCESS_KEY}&query=${lat},${lng}`,
      config
    )
    .then(async (response) => {
      country = response.data.data[0].country;
      let post;

      if (img) {
        const filename = `public/post-${req.user._id}-${Date.now()}.jpeg`;
        await sharp(req.files.img.path)
          .resize(500, 500)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(filename);
        post = await Post.create({
          about: about,
          img: filename,
          lat: lat,
          lng: lng,
          country: country,
        });
      } else {
        post = await Post.create({
          about: about,
          img: img,
          lat: lat,
          lng: lng,
          country: country,
        });
      }
      res.status(200).json({
        status: 'Success',
        post: post,
      });
    })
    .catch((error) => {
      console.error(error);
      res.json({
        status: 'Failed',
        message:
          'Something went wrong while creating the post, please try again',
      });
    });
});

// Checks if the user is logged in
exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.status(200).json({
      status: 'Failed',
      message: 'Please login first',
    });
  }
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

  const currentUser = await User.findById({ _id: decoded.id });
  if (!currentUser) {
    return res.status(200).json({
      status: 'Failed',
      message: 'Please login first',
    });
  }
  req.user = currentUser;
  next();
});
