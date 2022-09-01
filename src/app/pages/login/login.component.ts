import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
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

  public inputRegister = new FormGroup({
    id: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    passwordCon: new FormControl('', [Validators.required]),
  });

  public inputRepassword = new FormGroup({
    id: new FormControl('', [Validators.required]),
    passwordOld: new FormControl('', [Validators.required]),
    passwordNew: new FormControl('', [Validators.required]),
    passwordCon: new FormControl('', [Validators.required]),
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
          if (
            JSON.parse(sessionStorage.getItem('userLogin') || '{}').role ==
            'opd'
          ) {
            this.http.navRouter('/opd');
          } else if (
            JSON.parse(sessionStorage.getItem('userLogin') || '{}').role ==
            'ipd'
          ) {
            this.http.navRouter('/ipd');
          } else {
            this.http.navRouter('/');
          }
        } else {
          this.http.alertLog('error', 'Login failure.');
        }
      })
      .catch((error) => {
        this.http.alertLog('error', 'Login failure.');
      });
  }

  async submitRegister() {
    if (
      this.inputRegister.value.password !== this.inputRegister.value.passwordCon
    ) {
      this.inputRegister.controls.password.setValue('');
      this.inputRegister.controls.passwordCon.setValue('');
      this.http.alertLog('error', 'รหัสผ่านไม่ถูกต้อง');
    } else {
      let formData = new FormData();
      formData.append('id', this.inputRegister.value.id);
      let getData: any = await this.http.post('getUser', formData);
      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.inputRegister.controls.id.setValue('');
          this.http.alertLog('error', 'มี ID ผู้ใช้นี้แล้ว');
        } else {
          let data = {
            email: this.inputRegister.value.id,
            name: this.inputRegister.value.name,
            password: this.inputRegister.value.password,
            role: 'opd',
          };

          let getInsert: any = await this.http.postNodejs('register', data);
          if (getInsert.connect) {
            if (getInsert.response.message === 'success') {
              let win: any = window;
              win.$('#singup').modal('hide');
              this.http.alertLog('success', 'เพิ่มผู้ใช้สำเร็จ');
            } else {
              this.http.alertLog('error', 'ไม่สามารถเพิ่มผู้ใช้ได้');
            }
          } else {
            Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', 'register', 'error');
          }
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', 'getUser', 'error');
      }
    }
  }

  async submitRepassword() {
    let data = {
      email: this.inputRepassword.value.id,
      password: this.inputRepassword.value.passwordOld,
    };
    let checkUser: any = await this.http.postNodejs('login', data);

    if (checkUser.connect) {
      if (
        this.inputRepassword.value.passwordNew ===
        this.inputRepassword.value.passwordCon
      ) {
        let val = {
          email: this.inputRepassword.value.id,
          password: this.inputRepassword.value.passwordNew,
        };
        let getInsert: any = await this.http.postNodejs('updatePassword', val);

        if (getInsert.connect) {
          if (getInsert.response.message === 'success') {
            let win: any = window;
            win.$('#repassword').modal('hide');
            this.http.alertLog('success', 'เปลี่ยนรหัสผ่านสำเร็จ');
          } else {
            this.http.alertLog('error', 'ไม่สามารถเปลี่ยนรหัสผ่านสำเร็จได้');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', 'register', 'error');
        }
      } else {
        this.inputRepassword.controls.passwordNew.setValue('');
        this.inputRepassword.controls.passwordCon.setValue('');
        this.http.alertLog('error', 'รหัสผ่านไม่ถูกต้อง');
      }
    } else {
      this.http.alertLog('error', 'ID หรือ Old-Password ไม่ถูกต้อง');
    }
  }
}
