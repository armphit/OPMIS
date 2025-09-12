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
    start: new FormControl(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
    end: new FormControl(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
  });
  typeDevice: string = 'in';
  // startDate: any = null;
  dataSource: any = null;
  dataDrug: any = null;
  dataDrug_filter: any = null;
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
    this.getData();
  }

  ngOnInit(): void {}
  typeleave: Array<string> = [
    '',
    'ลาป่วย',
    'ลากิจ',
    'ลาพักร้อน',
    'ขาดงาน',
    'มาสาย',
  ];
  timeleave: Array<string> = ['', 'เต็มเวลา', 'ครึ่งเช้า', 'ครึ่งบ่าย'];
  public getData = async () => {
    this.displayedColumns = [
      'USERID',
      'userName',
      'datestamp',
      'check_in',
      'check_out',
      'type_leave',
      'leave_time',
      'leave_note',
      'Action',
    ];

    let startDate = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    // let formData = new FormData();
    // formData.append('date1', startDate);
    // formData.append('date2', endDate);

    // if (this.typeDevice) {
    //   formData.append('type', this.typeDevice);
    // }
    // let getData: any = await this.http.post('doorReport', formData);
    let send = {
      date1: startDate,
      date2: endDate,
      type: this.typeDevice ? this.typeDevice : '',
      choice: 1,
    };
    let getData: any = await this.http.postNodejs('doorReport', send);

    if (getData.connect) {
      if (getData.response.recordset.length) {
        this.dataDrug = getData.response.recordset;

        this.dataFilter();
        this.nameExcel = `รายงานเวลาเข้าประตู ${this.typeDevice} ${startDate}_${endDate}`;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  getDept: any = null;
  dataFilter() {
    if (this.getDept) {
      this.dataDrug_filter = this.dataDrug.filter(
        (val: any) => val.DEPTNAME == this.getDept
      );
    } else {
      this.dataDrug_filter = this.dataDrug;
    }
    this.dataSource = new MatTableDataSource(this.dataDrug_filter);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  displayedColumns2: any = null;
  dataSource2: any = null;
  public getDatafreq = async () => {
    this.displayedColumns2 = [
      // 'index',
      'USERID',
      'Name',
      'DEPTNAME',
      'time1',
      'time2',
      'time3',
      'time4',
      'time5',
      'time6',
    ];

    let startDate = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    // let formData = new FormData();
    // formData.append('date1', startDate);
    // formData.append('date2', endDate);
    // if (this.typeDevice) {
    //   formData.append('type', this.typeDevice);
    // }
    // let getData: any = await this.http.post('doorFreq', formData);
    let send = {
      date1: startDate,
      date2: endDate,
      type: this.typeDevice ? this.typeDevice : '',
      choice: 2,
    };
    let getData: any = await this.http.postNodejs('doorReport', send);

    if (getData.connect) {
      if (getData.response.recordset.length) {
        this.dataDrug = getData.response.recordset;
        this.dataDrug_filter = this.dataDrug;
        this.dataFilter2();
        this.nameExcel = `รายงานความถี่การเข้างานแต่ละช่วงเวลา ${this.typeDevice} ${startDate}_${endDate}`;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  dataFilter2() {
    if (this.getDept) {
      this.dataDrug_filter = this.dataDrug.filter(
        (val: any) => val.DEPTNAME == this.getDept
      );
    } else {
      this.dataDrug_filter = this.dataDrug;
    }
    this.dataSource2 = new MatTableDataSource(this.dataDrug_filter);
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;
  }

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
      start: [new Date(new Date().setDate(new Date().getDate() - 1))],
      end: [new Date(new Date().setDate(new Date().getDate() - 1))],
    });
    if (e === 0) {
      this.getData();
    } else if (e === 1) {
      this.getDatafreq();
    }
  }
  startdate: any = new Date();
  enddate: any = new Date();
  openModal(element: any) {
    this.startdate = new Date();
    this.enddate = new Date();
    // Open the modal and pass the selected element data
    console.log('Open modal for element:', element);
  }
  toggleEdit(element: any) {
    if (!element.isEditing) {
      // เริ่มแก้ไข
      element.isEditing = true;
    } else {
      // บันทึกข้อมูลใหม่
      console.log('New Data:', element);
      element.isEditing = false; // กลับสู่โหมดปกติ
    }
  }
}
