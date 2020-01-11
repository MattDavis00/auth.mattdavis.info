import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


import backendURL from '../backendURL';
import { HandleErrorsService } from '../handle-errors.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";
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

  login() {
    this.isLoading = true;
    console.log("Ran login function!!!!!");
    console.log(this.email + this.password);
    this.http.post<{
      success: boolean;
      errors: [];
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
        else {
          this.isLoading = false;
          this.errService.handleErrors(this.el, data.errors, ["email", "password"]);
        }
      },
      error  => {
        this.isLoading = false;
        console.log("Error", error);
        this.errService.handleErrors(this.el, [{"id": "fatal", "reason": "Unable to perform request. Please try again."}], []);
      }

    );

  }

}
