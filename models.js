'use strict';
const mongoose = require('mongoose');
//const uuid = require('uuid');

// function StorageException(message) {
//    this.message = message;
//    this.name = 'StorageException';
// }
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName:{ type: String,  required: true}
},
  created: {type: Date, default: Date.now}
});
// date: { type: Date, default: Date.now },
// const blogSchema = mongoose.Schema({
//   title: {type: String, required: true},
//   content: {type: String, required: true},
//   author: {
//     firstName: String,
//     // coord will be an array of string values
//     lastname: String
//   }
// })

blogSchema.virtual('nameString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();});

blogSchema.methods.apiRepr = function() {
  return {
   // id: this._id,
    title: this.title,
    content: this.content,
    author: this.nameString,
    created: this.created
  };
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};