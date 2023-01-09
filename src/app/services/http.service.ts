import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';

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
  public syncPath: string = 'http://192.168.185.160:4000/';
  public testPath: string = 'http://localhost:4000/';
  public printPath: string = 'http://192.168.185.160:5000/';
  public printTest: string = 'http://localhost:5000/';
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
        .get(
          'http://192.168.185.160:3000/reportq/checker_other/2022-07-18/2022-07-18/08:00/16:00/W9'
        )
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
        .post(this.syncPath + path, data)
        // .post(this.testPath + path, data)
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

  public serchDrug = async () => {
    this.loading = true;
    return new Promise((resolve) => {
      this.http
        .get('http://192.168.185.160:2000/drugs/*')
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

  public syncNodejs = async (path: string, data: any) => {
    this.loading = true;
    return new Promise((resolve) => {
      this.http
        // .post(this.testPath + path, data)
        .post(this.syncPath + path, data)
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

  public Printjs = async (path: string, data: any) => {
    this.loading = true;
    return new Promise((resolve) => {
      this.http
        // .post(this.printTest + path, data)
        .post(this.printPath + path, data)
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
  public alertLog = (type: 'error' | 'success', title: string) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    switch (type) {
      case 'success':
        Toast.fire({
          icon: type,
          title: title,
        });
        break;
      case 'error':
        Toast.fire({
          icon: type,
          title: title,
        });
        break;
    }
  };

  public navRouter = (path: string, params: any = {}) => {
    this.router.navigate([`${path}`], { queryParams: params });
  };
}
