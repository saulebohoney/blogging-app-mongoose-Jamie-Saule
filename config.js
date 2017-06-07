
require('dotenv').config();
exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||'localhost:27017/database';
    //'mongodb://saule:123@ds113282.mlab.com:13282/blogging-app';

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

exports.PORT = process.env.PORT || 8080; 