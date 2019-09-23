var mysql = require('mysql');
var cred = require('./credentials');
// credentials.js file should follow this format:
// exports.host = "localhost";
// exports.user = "username";
// exports.password = "strongPassword";
// exports.database = "databaseName";


var con = mysql.createConnection({
    host: cred.host,
    user: cred.user,
    password: cred.password,
    database: cred.database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = con;