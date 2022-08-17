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
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
})
export class CheckInComponent implements OnInit {
  displayedColumns: string[] = [];
  campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  typeDevice: string = '';
  // startDate: any = null;
  dataSource: any = null;
  dataDrug: any = null;
  nameExcel: any = null;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;

  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>,
    private formBuilder: FormBuilder
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit(): void {
    this.getData();
  }

  public getData = async () => {
    this.displayedColumns = [
      'USERID',
      'Name',
      'DEPTNAME',
      'deviceName',
      'datetime',
    ];

    let startDate = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    let formData = new FormData();
    formData.append('date1', startDate);
    formData.append('date2', endDate);

    if (this.typeDevice) {
      formData.append('type', this.typeDevice);
    }
    let getData: any = await this.http.post('doorReport', formData);

    if (getData.connect) {
      if (getData.response.result.length) {

        this.dataDrug = getData.response.result;


        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.nameExcel = `รายงานเวลาเข้าประตู ${this.typeDevice} ${startDate}_${endDate}`;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  displayedColumns2: any = null;
  dataSource2: any = null;
  public getDatafreq = async () => {
    this.displayedColumns2 = [
      'index',
      // 'USERID',
      'Name',
      'deviceName',
      'time1',
      'time2',
      'time3',
      'time4',
      'time5',
      'time6',
    ];

    let startDate = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    let formData = new FormData();
    formData.append('date1', startDate);
    formData.append('date2', endDate);
    if (this.typeDevice) {
      formData.append('type', this.typeDevice);
    }
    let getData: any = await this.http.post('doorFreq', formData);

    if (getData.connect) {
      if (getData.response.result.length) {
        this.dataDrug = getData.response.result;
        this.dataSource2 = new MatTableDataSource(this.dataDrug);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
        this.nameExcel = `รายงานความถี่การเข้างานแต่ละช่วงเวลา ${this.typeDevice} ${startDate}_${endDate}`;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public async startChange(event: any) {
    if (event.target.value) {
      this.getData();
    }
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  doSomething() {
    // this.typeDevice = e.value;
    this.getData();
  }

  public async startChange2(event: any) {
    if (event.target.value) {
      this.getDatafreq();
    }
  }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }
  doSomething2() {
    // this.typeDevice = e.value;
    this.getDatafreq();
  }

  getTab(e: any) {
    // this.typeDevice = '';
    this.campaignOne = this.formBuilder.group({
      start: [new Date()],
      end: [new Date()],
    });
    if (e === 0) {
      this.getData();
    } else if (e === 1) {
      this.getDatafreq();
    }
  }
}
