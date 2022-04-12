import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { timeout, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-report-phar',
  templateUrl: './report-phar.component.html',
  styleUrls: ['./report-phar.component.scss'],
})
export class ReportPharComponent implements OnInit {
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private https: HttpClient
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
    // this.getData2();
  }

  ngOnInit(): void {}

  public startChange(event: any) {
    const momentDate = new Date(event.value);

    const start_Date = moment(momentDate).format('DD/MM/YYYY');
  }

  public async endChange(event: any) {
    this.getData();
    this.getData2();
  }

  public getData = async () => {
    const start = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    const end = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    let getData = await this.http.getpath(
      `http://192.168.185.160:3000/reportq/checker/${start}/${end}`
    );

    console.log(getData);
  };

  public getData2 = async () => {
    const start = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    const end = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    let getData = await this.http.getpath(
      `http://192.168.185.160:3000/reportq/dispenser/${start}/${end}`
    );

    // console.log(getData);
  };
  public applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public applyFilter2(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
