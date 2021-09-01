import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  // public rootPath: string = 'http://localhost/api/index.php/';
  public apiPath: string = 'http://localhost/api/';
  public loading: boolean = false;
  public rootPath: string = 'http://192.168.185.160:88/api/index.php/';
  public sendPath: string =
    'http://192.168.185.102:8788/axis2/services/DIHPMPFWebservice?wsdl';
  public drugAppointPath: string =
    'http://192.168.42.1/unit/ssr/pharm_rep/service/drugAppoint.asp';

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
        })
        .catch((reason) => {
          resolve({ connect: false, response: reason });
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

  public drugAppoint_send = async (formdata: any = null) => {
    this.loading = true;
    // let delayres = await this.delay(500);
    return new Promise((resolve) => {
      this.http
        .post(this.drugAppointPath, formdata)
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
