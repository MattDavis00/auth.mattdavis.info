const express = require('express');
var mysql = require('mysql');
var con = require('./connect');
const app = express();
const port = 4000;

var date = new Date();

// Parse body of request as a JSON object.
app.use(express.json());

// Heath Check
app.listen(port, () => console.log(`Auth is listening on port ${port}!`));
app.get('/', (req, res) => res.send('Auth backend is running correctly! ' + date.toISOString()));

try {

/////////////////////// Register ////////////////////////
app.post('/api/register', function (req, res) {
    var request = req.body;
    console.log(req.body);

    var val = new Validation();
    val.email(request.email);
    if (val.getOutput().pass) {
        var sql = "INSERT INTO User (Email, First_Name, Last_Name, Password_Hash) VALUES (?,?,?,?)";
        con.query(sql, [request.email.data, request.firstName.data, request.lastName.data, request.password.data], function (err, result) {
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
app.post('/api/login', function (req, res) {
    var data = req.body;
    console.log(req.body);

    var sql = "SELECT Password_Hash FROM User WHERE Email = ?";
    con.query(sql, [data.email], function (err, result) {
        if (!err)
        {
            console.log("Number of records retrieved: " + result.length);
            if (result.length === 1 && result[0].Password_Hash === data.password) {
                res.send(JSON.stringify({"success": true, "errors": []}));
            } else {
                res.send(JSON.stringify({"success": false, "errors": [{"description": "Email and/or password are incorrect."}]}));
            }
        } else {
            errorHandler(err, res);
        }
    });
    
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