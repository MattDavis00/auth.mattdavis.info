import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import backendURL from '../backendURL';

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

  constructor(private http: HttpClient, public router: Router) { }

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
    console.log("Register function ran!");
    this.http.post<{
      success: boolean;
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
      },
      error  => {
        console.log("Error", error);
      }

    );
  }

}
