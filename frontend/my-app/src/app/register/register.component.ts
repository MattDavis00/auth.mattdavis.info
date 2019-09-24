import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  register() {
    console.log("Register function ran!");
    this.http.post("http://localhost:4000/register",
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
      },
      error  => {
        console.log("Error", error);
      }

    );
  }

}
