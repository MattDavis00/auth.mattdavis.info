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
  newFirstName: string = "";
  newLastName: string = "";
  newPassword: string = "";
  newPasswordRepeat: string = "";

  isLoadingLogout: boolean = false;
  isLoadingUpdate: boolean = false;

  constructor(private http: HttpClient, public router: Router, public errService: HandleErrorsService, private el: ElementRef) { }

  ngOnInit() {
    this.reloadProfile();
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
    this.isLoadingUpdate = true;

    this.http.post<{
      success: boolean;
      errors: [];
    }>(backendURL + "/update",
    {
    "email": {"data": this.newEmail, "id": "email"},
    "firstName": {"data": this.newFirstName, "id": "firstName"},
    "lastName": {"data": this.newLastName, "id": "lastName"},
    "password": {"data": this.newPassword, "id": "password"},
    "passwordRepeat": {"data": this.newPasswordRepeat, "id": "passwordRepeat"}
    })
    .subscribe(
      data  => {
        console.log("POST Request is successful ", data);
        if (data.success) {
          // Remove errors and show success message.
          this.errService.removeErrors(this.el, ["email", "firstName", "lastName", "password", "passwordRepeat"]);
          this.errService.showNotification("Details have been updated");

          // Clear update form.
          this.newEmail = "";
          this.newFirstName = "";
          this.newLastName = "";
          this.newPassword = "";
          this.newPasswordRepeat = "";

          // Populate placeholders with new data
          this.reloadProfile();
        } else {
          this.errService.handleErrors(this.el, data.errors, ["email", "firstName", "lastName", "password", "passwordRepeat"]);
        }
        this.isLoadingUpdate = false;
      },
      error  => {
        console.log("Error", error);
        this.isLoadingUpdate = false;
      }

    );
  }

  reloadProfile() {
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

}
