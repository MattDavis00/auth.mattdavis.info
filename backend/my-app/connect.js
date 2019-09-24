var mysql = require('mysql');
var cred = require('./credentials');


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