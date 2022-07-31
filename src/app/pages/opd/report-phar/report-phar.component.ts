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
    start: new FormControl(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
    end: new FormControl(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
  });
  public starttime = '08:00';

  public endtime = '16:00';
  public dataDrug: any = null;
  public dataSource: any = null;
  public displayedColumns: string[] = [
    'checker_id',
    'checker_name',

    'order',
    'item',
  ];

  public displayedColumns2: string[] = [
    'staff',
    'staffName',
    'device',

    'ord',
    'item',
  ];

  public displayedColumns3: string[] = [
    'dispenser_id',
    'dispenser_name',

    'order',
    'item',
  ];

  select = 'W8';

  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;

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
  public nameExcel = '';
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
    formData.append('site', this.select);
    if (this.numTab == 2) {
      getData = await this.http.post('onusPhar', formData);
      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.nameExcel = `ภาระงานผู้ช่วยเภสัชประจำตู้ ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 0) {
      getData = await this.http.post('checkerPhar', formData);
      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort2;
          this.dataSource.paginator = this.paginator2;
          this.nameExcel = `ภาระงานเภสัชจ่ายยา ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 1) {
      getData = await this.http.post('dispenserPhar', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort3;
          this.dataSource.paginator = this.paginator3;
          this.nameExcel = `ภาระงานเภสัชตรวจยา ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  valuechange() {
    this.getData();
  }

  clearValue() {
    this.campaignOne = this.formBuilder.group({
      start: [
        new Date(new Date().setDate(new Date().getDate() - 1)),
        Validators.required,
      ],
      end: [
        new Date(new Date().setDate(new Date().getDate() - 1)),
        Validators.required,
      ],
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

  changeFloor() {
    this.getData();
  }
}
