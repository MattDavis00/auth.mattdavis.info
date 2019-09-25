import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  email: string = "mw.davis@hotmail.co.uk";
  firstName: string = "Matt";
  lastName: string = "Davis";
  
  newEmail: string = "";
  newfirstName: string = "";
  newLastName: string = "";
  newPassword: string = "";
  newPasswordRepeat: string = "";

  constructor() { }

  ngOnInit() {

  }

  logout() {

  }

  update() {

  }

}
