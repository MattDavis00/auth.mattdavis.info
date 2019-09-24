import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  login() {
    console.log("Ran login function!!!!!");
    console.log(this.email + this.password);
    this.http.post("http://localhost:4000/login",
    {
    "email": {"data": this.email, "id": "email"},
    "password": {"data": this.password, "id": "password"}
    })
    .subscribe(
      data  => {
        console.log("POST Request is successful ", data);
      },
      error  => {
        console.log("Error", error);
      }

    );
    this.http.get("http://localhost:4000/")
    .subscribe(
      data  => {
        console.log("GET Request is successful ", data);
      },
      error  => {
        console.log("Error", error);
      }

    );
  }

}
