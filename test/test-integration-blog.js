'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const { Blog } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedBlogData() {
  console.info('seeding blog data');
  const seedData = [];

  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBlogData());
  }
  // this will return a promise
  return Blog.insertMany(seedData);
}

function generateBlogData() {
    return {
        title: faker.company.companyName(),
        content: faker.lorem.paragraph(),
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
       // created: faker.date.recent()
    };

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function () {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedBlogData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  //ALL OTHER TESTS///


    describe('GET endpoint', function () {
    it('should return all existing blog posts', function () {
      // strategy:
      //    1. get back all restaurants returned by by GET request to `/restaurants`
      //    2. prove res has right status, data type
      //    3. prove the number of restaurants we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/blogs')
        .then(function (_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
            res.body.blogs.should.have.length.of.at.least(1);
            //console.log(res.body.blogs[0]);
            return Blog.count();
        })
        .then(function (count) {
          res.body.blogs.should.have.length.of(count);
        });
    });


    it('should return blogs with right fields', function () {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resBlog;
      return chai.request(app)
        .get('/blogs')
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.blogs.should.be.a('array');
          res.body.blogs.should.have.length.of.at.least(1);

          res.body.blogs.forEach(function (blog) {
            blog.should.be.a('object');
            blog.should.include.keys(
              'id', 'title', 'content', 'author', 'created');
          });
          resBlog = res.body.blogs[0];
          return Blog.findById(resBlog.id);
        })
        .then(function (blog) {

            resBlog.id.should.equal(blog.id);
            resBlog.title.should.equal(blog.title);
            resBlog.content.should.equal(blog.content);
            resBlog.author.should.equal(`${blog.author.firstName} ${blog.author.lastName}`);
            //resBlog.author.lastName.should.equal(blog.author.lastName);
            resBlog.created.should.be.sameMoment(blog.created);
          //try making created to created.should.equal and see if there is difference//
        });
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the restaurant we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new blog', function () {

            const newBlog = generateBlogData();
            console.log('this is the original date', newBlog.created);
            let createdAt;
      return chai.request(app)
        .post('/blogs')
        .send(newBlog)
        .then(function (res) {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys(
            'id', 'title', 'content', 'author', 'created');
          res.body.title.should.equal(newBlog.title);
          // cause Mongo should have created id on insertion
            res.body.id.should.not.be.null;
            res.body.content.should.equal(newBlog.content);
            res.body.author.should.equal(`${newBlog.author.firstName} ${newBlog.author.lastName}`);
            res.body.created.should.not.be.null;
            createdAt=res.body.created;
          return Blog.findById(res.body.id);
        })
        .then(function (blog) {
            blog.title.should.equal(newBlog.title);
            blog.content.should.equal(newBlog.content);
            // blog.author.should.equal(`${newBlog.author.firstName} ${newBlog.author.lastName}`);
            blog.author.firstName.should.equal(newBlog.author.firstName);
            blog.author.lastName.should.equal(newBlog.author.lastName);
            console.log('blog.created',blog.created);
            // log some other created date with which to check against blog.created
            //blog.created.should.equal(newBlog.created);
            blog.created.should.be.sameMoment(createdAt);
          
        });
       });
    });

    describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing restaurant from db
    //  2. Make a PUT request to update that restaurant
    //  3. Prove restaurant returned by request contains data we sent
    //  4. Prove restaurant in db is correctly updated
        it('should update fields you send over', function () {
            const updateData = {
              title: ' ',
              content: ' ',
          };

            return Blog
        .findOne()
        .exec()
        .then(function (blog) {
            updateData.id = blog.id;

          // make request then inspect it to make sure it reflects
          // data we sent
            return chai.request(app)
            .put(`/blogs/${blog.id}`)
            .send(updateData);
        })
        .then(function (res) {
            res.should.have.status(204);

            return Blog.findById(updateData.id).exec();
        })
        .then(function (blog) {
            blog.title.should.equal(updateData.title);
            blog.content.should.equal(updateData.content);
        });
      });
    });
  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a restaurant
    //  2. make a DELETE request for that restaurant's id
    //  3. assert that response has right status code
    //  4. prove that restaurant with the id doesn't exist in db anymore
    it('delete a blog by id', function () {

      let blog;

      return Blog
        .findOne()
        .exec()
        .then(function (_blog) {
          blog = _blog;
          return chai.request(app).delete(`/blogs/${blog.id}`);
        })
        .then(function (res) {
          res.should.have.status(204);
          return Blog.findById(blog.id).exec();
        })
        .then(function (_blog) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_restaurant.should.be.null` would raise
          // an error. `should.be.null(_restaurant)` is how we can
          // make assertions about a null value.
          should.not.exist(_blog);
        });
    });
  });

  ///ENDING SEMI-COLON////
})
})