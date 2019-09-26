//////////////////////////////////// Dependencies ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

var Validation = require("./validation");

const express = require('express');
var mysql = require('mysql');
var con = require('./connect');
var session = require('express-session')
var cred = require('./credentials');
var MySQLStore = require('express-mysql-session')(session);
const app = express();
const port = 4000;
const bcrypt = require('bcrypt');

var date = new Date();

// Parse body of request as a JSON object.
app.use(express.json());

// ONLY TO BE USED IN DEVELOPMENT Allow requests from different origins.
//var cors = require('cors');
//app.use(cors());

var sessionStore = new MySQLStore({}, con);

// Set Session Parameters
app.use(session({
    key: "auth.mattdavis.info cookie",
    secret: cred.sessionSecret,
    saveUninitialized: false,
    store: sessionStore,
    resave: false,
    cookie: {
        maxAge: 21600000, // 6 Hours
        secure: cred.secureCookie,
        httpOnly: true
    }
}));

// Heath Check
app.listen(port, () => console.log(`Auth is listening on port ${port}!`));
// app.get('/', (req, res) => res.send('Auth backend is running correctly! ' + date.toISOString()));

app.get('/', function(req, res){
    if(req.session.loggedIn){
       res.send("loggedIn: " + req.session.loggedIn + "\n" +
       "email: " + req.session.email + "\n" +
       "firstName: " + req.session.firstName);
    } else {
       res.send("Not logged in!");
    }
 });

//////////////////////////////////// Code ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

try {

    /////////////////////// Register ////////////////////////
    app.post('/register', function (req, res) {
        var request = req.body;
        console.log(req.body);

        var val = new Validation();
        val.email(request.email);
        val.name(request.firstName);
        val.name(request.lastName);
        val.password(request.password, request.passwordRepeat)
        if (val.getOutput().success) {

            var hash = bcrypt.hashSync(request.password.data, 10); // Generate BCrypt Hash
            var sql = "INSERT INTO User (Email, First_Name, Last_Name, Password_Hash) VALUES (?,?,?,?)";
            con.query(sql, [request.email.data, request.firstName.data, request.lastName.data, hash], function (err, result) {
                if (!err)
                {
                    console.log("Number of records inserted: " + result.affectedRows);
                    if (result.affectedRows === 1) {
                        res.send(JSON.stringify({"success": true, "errors": []}));
                    } else {
                        errorHandler(err, res);
                    }
                } else {
                    errorHandler(err, res);
                }
            });

        } else {
            val.sendResponse(res);
        }
        
    });


    /////////////////////// Login ////////////////////////
    app.post('/login', function (req, res) {
        var request = req.body;
        console.log(req.body);

        var sql = "SELECT User_ID, Email, Password_Hash, First_Name, Last_Name FROM User WHERE Email = ?";
        con.query(sql, [request.email.data], function (err, result) {
            if (!err)
            {
                console.log("Number of records retrieved: " + result.length);
                if (result.length === 1 &&  bcrypt.compareSync(request.password.data, result[0].Password_Hash)) {
                    req.session.loggedIn = true;
                    req.session.userID = result[0].User_ID;
                    req.session.email = result[0].Email;
                    req.session.firstName = result[0].First_Name;
                    req.session.lastName = result[0].Last_Name;

                    var sql = "UPDATE User SET Last_Login = NOW() WHERE User_ID = ?";
                    con.query(sql, [result[0].User_ID], function (err, result) {
                        if (err)
                            errorHandler(err, res);
                    });

                    res.send(JSON.stringify({"success": true, "errors": []}));
                } else {
                    res.send(JSON.stringify({"success": false, "errors": [{"description": "Email and/or password are incorrect."}]}));
                }
            } else {
                errorHandler(err, res);
            }
        });
        
    });

    /////////////////////// Verify ////////////////////////
    app.get('/verify', function (req, res) {
        if (req.session.loggedIn)
            res.send(JSON.stringify({"loggedIn": req.session.loggedIn, "userID": req.session.userID, "email": req.session.email, "firstName": req.session.firstName, "lastName": req.session.lastName}));
        else
            res.send(JSON.stringify({"loggedIn": false}));
    });

    /////////////////////// Error Handler ////////////////////////
    function errorHandler (err, res) {
        console.log(err);
        if (res !== undefined)
            res.send(JSON.stringify({"success": false, "errors": [{"description": "Unable to perform request. Please try again."}]}));
    }


    /////////////////////// Validations ////////////////////////
    class Validation {
        constructor() {
            this.output = {};
            this.output.success = true;
            this.output.errors = [];
        }
        
        /**
         * Email validation function. Checks email is 100 character or less and is a valid email.
         * If not it will add an error report to the Validation object.
         * @param {*} email The email object to be validated. Should contain the email at email.data and optional id at email.id
         */
        email(email) {
            var regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/);
            if (this.defined(email))
            {
                if (email.data.length > 100) {
                    this.handleFail(email, "Email is over 100 characters.");
                }
                if (!regex.test(email.data)) {
                    this.handleFail(email, "Email is not valid.");
                }
            }
            else
            {
                this.handleFail(email, "Please enter your email.");
            }
        }

        name(name) {
            if (this.defined(name))
            {
                if (name.data.length > 50) {
                    this.handleFail(name, "Name is over 50 characters.");
                }
                if (name.data.length <=0) {
                    this.handleFail(name, "Please enter your name.");
                }
            }
            else
            {
                this.handleFail(name, "Please enter your name.");
            }
        }

        password(pass, passRepeat) {
            if (this.defined(pass) && this.defined(passRepeat))
            {
                if (pass.data.length < 8) {
                    this.handleFail(pass, "Password must be 8+ characters.");
                }
                if (pass.data !== passRepeat.data) {
                    this.handleFail(pass, "Passwords do not match.");
                }
            }
            else
            {
                this.handleFail(pass, "Please enter a password.");
            }
        }

        defined(variable) {
            if (typeof variable !== 'undefined')
                return true;
            else
                return false;
        }

        handleFail(data, reason) {
            this.output.success = false;
            this.output.errors.push({"id": data.id, "reason": reason});
        }

        getOutput() {
            return this.output;
        }

        sendResponse(res) {
            res.send(JSON.stringify(this.output));
        }
    }

}
catch(err)
{
    console.log(err);
}