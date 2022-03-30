import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public inputGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  constructor(private http: HttpService) {}

  ngOnInit(): void {
    if (sessionStorage.getItem('userLogin') != null) {
      this.http.navRouter('/');
    }
  }

  public submitInput() {
    let data = {
      email: this.inputGroup.value.name,
      password: this.inputGroup.value.password,
    };

    this.http
      .postNodejs('login', data)
      .then((login: any) => {
        if (login.connect == true) {
          sessionStorage.setItem('userLogin', JSON.stringify(login.response));

          this.http.alertLog('success', 'Login Success.');
          this.http.navRouter('/');
        } else {
          this.http.alertLog('error', 'Login failure.');
        }
      })
      .catch((error) => {
        this.http.alertLog('error', 'Login failure.');
      });
  }
}
