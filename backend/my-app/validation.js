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

module.exports = Validation;