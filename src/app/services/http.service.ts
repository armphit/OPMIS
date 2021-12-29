import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  // public rootPath: string = 'http://localhost/api/index.php/';
  public apiPath: string = 'http://localhost/api/';
  public loading: boolean = false;
  public rootPath: string = 'http://192.168.185.160:88/api/index.php/';
  public imgPath: string = 'http://192.168.185.160:88/api';
  public nodePath: string = 'http://192.168.185.160:3000/';
  // _url = 'http:// + environment.API_SERVER + :3000';
  public sendPath: string =
    'http://192.168.185.102:8788/axis2/services/DIHPMPFWebservice?wsdl';
  public drugAppointPath: string =
    'http://192.168.42.1/unit/ssr/pharm_rep/service/drugAppoint.asp?addDay=1';

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

  public node_send = async (formdata: any = null) => {
    this.loading = true;
    // let delayres = await this.delay(500);
    return new Promise((resolve) => {
      this.http
        .get(this.nodePath, formdata)
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

  public postNodejs = async (path: string, data: any) => {
    this.loading = true;
    return new Promise((resolve) => {
      this.http
        .post(this.nodePath + path, data)
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
    // return this.http
    //   .post<any>(this.nodePath + path, data)
    //   .pipe(catchError(this.errorHandler));
  };

  public getpath = async (path: string) => {
    this.loading = true;
    // let delayres = await this.delay(500);
    return new Promise((resolve) => {
      this.http
        .get(path)
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
