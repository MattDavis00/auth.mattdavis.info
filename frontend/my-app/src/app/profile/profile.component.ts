import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import backendURL from '../backendURL';
import { HandleErrorsService } from '../handle-errors.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  email: string = "";
  firstName: string = "";
  lastName: string = "";
  
  newEmail: string = "";
  newfirstName: string = "";
  newLastName: string = "";
  newPassword: string = "";
  newPasswordRepeat: string = "";

  isLoadingLogout: boolean = false;
  isLoadingUpdate: boolean = false;

  constructor(private http: HttpClient, public router: Router, public errService: HandleErrorsService, private el: ElementRef) { }

  ngOnInit() {
    this.http.get<{
      loggedIn: boolean;
      userID: number;
      email: string;
      firstName: string;
      lastName: string;
    }>(backendURL + "/verify")
    .subscribe(
      data  => {
        console.log("GET Request is successful ", data);
        if (data.loggedIn) {
          this.email = data.email;
          this.firstName = data.firstName;
          this.lastName = data.lastName;
        } else {
          this.router.navigate(['/login']); // If user isn't logged in, redirect to login page.
        }
      },
      error  => {
        console.log("Error", error);
      }

    );
  }

  logout() {
    this.isLoadingLogout = true;
    this.http.get<{
      loggedIn: boolean;
    }>(backendURL + "/logout")
    .subscribe(
      data  => {
        console.log("GET Request is successful ", data);
        if (!data.loggedIn)
          this.router.navigate(['/login']); // User has been logged out, redirect to login page.
        else
          this.isLoadingLogout = false;
      },
      error  => {
        console.log("Error", error);
        this.isLoadingLogout = false;
      }

    );
  }

  update() {

  }

}
