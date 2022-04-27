import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

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
  public starttime = '08:00';

  public endtime = '16:00';
  public dataDrug: any = null;
  public dataSource: any = null;
  public displayedColumns: string[] = [
    'checker_id',
    'checker_name',
    'item',
    'order',
  ];

  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  public getData = async () => {
    this.dataDrug = null;
    const start = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    const end = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
    let getData: any = null;
    let formData = new FormData();
    formData.append('time1', this.starttime + ':00');
    formData.append('time2', this.endtime + ':00');
    formData.append('date1', start);
    formData.append('date2', end);
    if (this.numTab == 0) {
      getData = await this.http.post('checkerPhar', formData);
    } else {
      getData = await this.http.post('dispenserPhar', formData);
    }

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
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

  valuechange() {
    this.getData();
  }

  clearValue() {
    this.campaignOne = this.formBuilder.group({
      start: [new Date(), Validators.required],
      end: [new Date(), Validators.required],
    });
    this.starttime = '08:00';
    this.endtime = '16:00';
    this.getData();
  }

  numTab = 0;
  public getTab(num: any) {
    this.numTab = num;
    this.getData();
  }
}
