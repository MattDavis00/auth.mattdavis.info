//////////////////////////////////// Dependencies ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
"use strict";

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
const jwt  = require('jsonwebtoken');
const fs   = require('fs');

// PRIVATE and PUBLIC key
const path = require('path');
const privateKEY = fs.readFileSync( path.join(__dirname, 'private.key'), 'utf8');
const publicKEY = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

var date = new Date();

// Parse body of request as a JSON object.
app.use(express.json());

// Do not cache any server-side authentication requests.
// Client must check again each time to ensure consistency.
const nocache = require('nocache');
app.use(nocache());

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
                        login(req, res); // User has been registered, now log the user in with those credentials.
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
    app.post('/login', function (req, res){
        login(req, res);
    });

    function login(req, res) {
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
                    req.session.hash = result[0].Password_Hash;

                    var sql = "UPDATE User SET Last_Login = NOW() WHERE User_ID = ?";
                    con.query(sql, [result[0].User_ID], function (err, result) {
                        if (err)
                            errorHandler(err, res);
                    });

                    res.send(JSON.stringify({"success": true, "errors": []}));
                } else {
                    res.send(JSON.stringify({"success": false, "errors": [{"id": "all", "reason": "Email and/or password are incorrect."}]}));
                }
            } else {
                errorHandler(err, res);
            }
        });
    }

    /////////////////////// Update ////////////////////////
    app.post('/update', function (req, res) {
        var request = req.body;
        console.log(req.body);

        var val = new Validation();

        
        
        if (!val.empty(request.email))
            val.email(request.email);
        if (!val.empty(request.firstName))
            val.name(request.firstName);
        if (!val.empty(request.lastName))
            val.name(request.lastName);
        if (!val.empty(request.password) || !val.empty(request.passwordRepeat))
            val.password(request.password, request.passwordRepeat)
        
        if (val.getOutput().success) {
            var hash = bcrypt.hashSync(request.password.data, 10); // Generate BCrypt Hash
            var sql = "UPDATE User SET Email = ?, First_Name = ?, Last_Name = ?, Password_Hash = ? WHERE Email = ?";
            con.query(sql, [
                (val.empty(request.email)?req.session.email:request.email.data),
                (val.empty(request.firstName)?req.session.firstName:request.firstName.data),
                (val.empty(request.lastName)?req.session.lastName:request.lastName.data),
                (val.empty(request.password)?req.session.hash:hash),
                req.session.email
            ], function (err, result) {
                if (!err)
                {
                    req.session.email = (val.empty(request.email)?req.session.email:request.email.data);
                    req.session.firstName = (val.empty(request.firstName)?req.session.firstName:request.firstName.data);
                    req.session.lastName = (val.empty(request.lastName)?req.session.lastName:request.lastName.data);
                    req.session.hash = (val.empty(request.password)?req.session.hash:hash);

                    console.log("Number of records updated: " + result.affectedRows);
                    if (result.affectedRows === 1) {
                        res.send(JSON.stringify({"success": true}));
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

    /////////////////////// Logout ////////////////////////
    app.get('/logout', function (req, res) {
        if (req.session.loggedIn)
            req.session.destroy();

        if(req.query.redirect === "true") {
            res.redirect("https://auth.mattdavis.info/#/login");
        } else {
            res.send(JSON.stringify({"loggedIn": false}));
        }

    });

    /////////////////////// Auth ////////////////////////
    app.get('/auth', function (req, res) {

        req.query.redirectURL = decodeURIComponent(req.query.redirectURL);
        req.query.tokenURL = decodeURIComponent(req.query.tokenURL);

        if (checkURL(req.query.redirectURL) && checkURL(req.query.tokenURL)) {
            req.session.redirectURL = req.query.redirectURL;
            req.session.tokenURL = req.query.tokenURL;
            if (req.session.loggedIn) {
                sendAuthToken(req, res);
            } else {
                res.redirect("https://auth.mattdavis.info/#/login");
            }
        } else {
            res.send("Website is not on allowed list!!!!");
        }
    });

    function sendAuthToken (req, res) {
        if (req.session.loggedIn && checkURL(req.session.redirectURL) && checkURL(req.session.tokenURL)) {
            // PAYLOAD
            let payload = {
                userID: req.session.userID,
                redirectURL: req.session.redirectURL,
                loggedIn: true,
                checkTokenURL: "https://auth.mattdavis.info/api/check-token"
            };

            // SIGNING OPTIONS
            let signOptions = {
                issuer:  "https://auth.mattdavis.info",
                expiresIn:  "30s",
                algorithm:  "RS256"
            };

            let token = jwt.sign(payload, privateKEY, signOptions);

            let decoded = jwt.decode(token, {complete: true});
            console.log("\nToken Contents: " + JSON.stringify(decoded));

            res.redirect(req.session.tokenURL + "?token=" + token);
            req.session.redirectURL = undefined;
            req.session.tokenURL = undefined;
        } else {
            res.redirect("https://auth.mattdavis.info/#/login");
        }
    }

    /**
     * Checks whether a URL is on the allowed list
     * @param {String} urlToCheck The URL to check
     * @returns True if the URL is allowed
     */
    function checkURL (urlToCheck) {
        if (typeof urlToCheck === 'undefined')
            return false;

        let safeURLs = ["https://auth.mattdavis.info", "https://pastebin.mattdavis.info", "https://pubgolf.mattdavis.info"];

        for (let i = 0; i < safeURLs.length; i++) {
            if (urlToCheck.indexOf(safeURLs[i]) === 0)
                return true;
        }

        console.log("Returned false");
        return false;
    }

    /////////////////////// Check If There Is A Redirect Pending ////////////////////////
    app.get('/check-for-redirect', function (req, res) {
        sendAuthToken(req, res);
    });

    /////////////////////// Check Token ////////////////////////
    app.get('/check-token', function (req, res) {

        let token = req.query.token;

        // VERIFYING OPTIONS
        let verifyOptions = {
            issuer:  "https://auth.mattdavis.info",
            expiresIn:  "30s",
            algorithm:  "RS256"
        };
        
        try {
            let data = jwt.verify(token, publicKEY, verifyOptions);
            res.send(JSON.stringify(data));
        } catch {
            res.send(JSON.stringify({loggedIn: false}));
        }

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
            res.send(JSON.stringify({"success": false, "errors": [{"id": "fatal", "reason": "Unable to perform request. Please try again."}]}));
    }




}
catch(err)
{
    console.log(err);
}