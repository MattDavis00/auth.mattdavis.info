import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import backendURL from '../backendURL';

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

  constructor(private http: HttpClient, public router: Router) { }

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

  }

  update() {

  }

}
