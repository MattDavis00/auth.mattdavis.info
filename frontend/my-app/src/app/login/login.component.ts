import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


import backendURL from '../backendURL';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";
  isLoading: boolean = false;

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

  login() {
    this.isLoading = true;
    console.log("Ran login function!!!!!");
    console.log(this.email + this.password);
    this.http.post<{
      success: boolean;
    }>(backendURL + "/login",
    {
    "email": {"data": this.email, "id": "email"},
    "password": {"data": this.password, "id": "password"}
    })
    .subscribe(
      data  => {
        console.log("POST Request is successful ", data);
        if (data.success)
          this.router.navigate(['/profile']); // Login was successful, redirect to profile.
        else
          this.isLoading = false;
      },
      error  => {
        this.isLoading = false;
        console.log("Error", error);
      }

    );

  }

}
