import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HandleErrorsService {

  constructor() { }

  public notificationValue: string = "";
  public notificationHidden: boolean = true;


  handleErrors(el, errors, fields) {


    for (let j = 0; j < fields.length; j++) {
      if (fields[j] !== null || fields[j] !== "all" || fields[j] !== "fatal")
          el.nativeElement.querySelector("#"+fields[j]).classList.remove("input-error");
    }

    var errorMessage = "";

    for (let i = 0; i < errors.length; i++) {
      if (errors[i].id === "all") {
        for (let j = 0; j < fields.length; j++) {
          el.nativeElement.querySelector("#"+fields[j]).classList.add("input-error");
        }
      } else if (errors[i].id === "fatal") {

      } else {
      el.nativeElement.querySelector("#"+errors[i].id).classList.add("input-error");
      if (errors[i].id === "password")
        el.nativeElement.querySelector("#passwordRepeat").classList.add("input-error");
      }

      errorMessage = errorMessage + errors[i].reason + " ";
    }

    this.showNotification(errorMessage);
  }

  showNotification(text) {
    this.notificationValue = text;
    this.notificationHidden = false;
    setTimeout(() => 
    {
      this.hideNotification();
    },
    5000);
  }

  hideNotification() {
    this.notificationHidden = true;
    setTimeout(() => 
    {
      this.notificationValue = "";
    },
    500);
  }

}
