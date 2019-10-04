import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import backendURL from '../backendURL';

import {HandleErrorsService} from '../handle-errors.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  email: string = "";
  firstName: string = "";
  lastName: string = "";
  password: string = "";
  passwordRepeat: string = "";
  isLoading: boolean = false;

  constructor(private http: HttpClient, public router: Router, public errService: HandleErrorsService, private el: ElementRef) { }

  ngOnInit() {
    this.http.get<{
      loggedIn: boolean;
    }>(backendURL + "/verify")
    .subscribe(
      data  => {
        console.log("GET Request is successful ", data);
        if (data.loggedIn) {
          this.router.navigate(['/profile']); // User is already logged in, redirect to profile.
        }
      },
      error  => {
        console.log("Error", error);
      }

    );
    
  }

  register() {
    this.isLoading = true;
    console.log("Register function ran!");
    this.http.post<{
      success: boolean;
      errors: [];
    }>(backendURL + "/register",
    {
    "email": {"data": this.email, "id": "email"},
    "firstName": {"data": this.firstName, "id": "firstName"},
    "lastName": {"data": this.lastName, "id": "lastName"},
    "password": {"data": this.password, "id": "password"},
    "passwordRepeat": {"data": this.passwordRepeat, "id": "passwordRepeat"},
    })
    .subscribe(
      data  => {
        console.log("POST Request is successful ", data);
        if (data.success)
          this.router.navigate(['/profile']); // Registration was successful, redirect to profile.
        else // Handle errors
        {
          this.isLoading = false;
          this.errService.handleErrors(this.el, data.errors, ["email", "firstName", "lastName", "password", "passwordRepeat"]);
        }
      },
      error  => {
        console.log("Error", error);
        this.isLoading = false;
        this.errService.handleErrors(this.el, {"id": "fatal", "reason": "Unable to perform request. Please try again."}, []);
      }

    );
  }

}
