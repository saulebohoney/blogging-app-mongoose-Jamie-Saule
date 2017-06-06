const mongoose = require('mongoose');
//const uuid = require('uuid');

// function StorageException(message) {
//    this.message = message;
//    this.name = 'StorageException';
// }
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {type: String, required: true},
  created: {type: String, required: true}
  }
// const blogSchema = mongoose.Schema({
//   title: {type: String, required: true},
//   content: {type: String, required: true},
//   author: {
//     firstName: String,
//     // coord will be an array of string values
//     lastname: String
//   }
// })

const Blog = mongoose.model('Blog', restaurantSchema);

module.exports = {Restaurant};