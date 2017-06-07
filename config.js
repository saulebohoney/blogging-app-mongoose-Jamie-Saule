
require('dotenv').config();
exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||'localhost:27017/database';
    //'mongodb://saule:123@ds113282.mlab.com:13282/blogging-app';

//exports.PORT = process.env.PORT || 8080;

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE.URL;

//require('dotenv').config();
//const DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL;
// exports.DATABASE = {
//   client: 'mongoose',
//   connection: DATABASE_URL,
//  // pool: { min: 0, max: 3 },
//   // debug: true
// };

// var db = require('dotenv')
// db.connect({
//   host: process.env.DB_HOST,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASS
// })
exports.PORT = process.env.PORT || 8080; 