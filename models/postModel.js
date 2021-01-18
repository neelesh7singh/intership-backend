const mongoose = require('mongoose');

// Schema
const postSchema = new mongoose.Schema({
  about: {
    type: String,
    maxlength: 500,
  },
  img: {
    type: String,
  },
  lat: {
    type: String,
    required: [true, 'Post must have a latitude'],
  },
  lng: {
    type: String,
    required: [true, 'Post must have a longitude'],
  },
  country: {
    type: String,
    required: [true, 'Post must have a country'],
  },
});

// Model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
