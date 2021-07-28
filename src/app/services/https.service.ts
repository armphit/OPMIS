
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpsService {
  public rootPath: string =
    'http://localhost/index.php/';
    public apiPath: string = 'http://localhost/api/'
  public loading: boolean = false;
  constructor(public router: Router, private http: HttpClient) {}

  public post = async (path: string, formdata: any = null) => {
    this.loading = true;
    // let delayres = await this.delay(500);
    return new Promise((resolve) => {
      this.http
        .post(this.rootPath + path, formdata)
        .toPromise()
        .then((value) => {
          resolve({ connect: true, response: value });
          this.loading = false;
        })
        .catch((reason) => {
          resolve({ connect: false, response: reason });
          this.loading = false;
        });
    });
  };

  public get = async (path: string) => {
    this.loading = true;
    // let delayres = await this.delay(500);
    return new Promise((resolve) => {
      this.http
        .get(this.rootPath + path)
        .toPromise()
        .then((value) => {
          resolve({ connect: true, response: value });
          this.loading = false;
        })
        .catch((reason) => {
          resolve({ connect: false, response: reason });
          this.loading = false;
        });
    });
  };


}
