import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-report-phar',
  templateUrl: './report-phar.component.html',
  styleUrls: ['./report-phar.component.scss'],
})
export class ReportPharComponent implements OnInit {
  public campaignOne = new FormGroup({
    start: new FormControl(new Date(new Date())),
    end: new FormControl(new Date(new Date())),
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
    'error',
  ];

  public displayedColumns2: string[] = [
    'staff',
    'staffName',
    'order',
    'item',
    'error',
  ];

  public displayedColumns3: string[] = [
    'dispenser_id',
    'dispenser_name',

    'order',
    'item',
    'error',
  ];
  public displayedColumns4: string[] = [
    'patientNO',
    'QN',
    'patientName',
    'checker_id',
    'checker_name',
    'check_time',
    'dispenser_id',
    'dispenser_name',
    'dispens_time',
    'createDT_Q',
  ];

  select = '';
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatSort4') sort4!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;
  @ViewChild('MatPaginator4') paginator4!: MatPaginator;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private https: HttpClient
  ) {
    this.dateAdapter.setLocale('en-GB');
    if (this.dataUser.role === 'officer') {
      this.numTab = 2;
    }

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
    this.campaignOne = this.formBuilder.group({
      start: [start, Validators.required],
      end: [end, Validators.required],
    });
    formData.append('time1', this.starttime + ':00');
    formData.append('time2', this.endtime + ':00');
    formData.append('date1', start);
    formData.append('date2', end);
    formData.append('site', this.select);
    let send: any = {
      time1: this.starttime + ':00',
      time2: this.endtime + ':00',
      date1: start,
      date2: end,
      site: this.select,
    };
    // formData.forEach((value, key) => {
    //   console.log(key + '=' + value);
    // });
    if (this.numTab == 2) {
      getData = await this.http.post('onusPhar', formData);
      let getData2: any = await this.http.post('getUserall', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result.map((e: any) => {
            let temp = getData2.response.result.find(
              (element: any) => element.staff === e.staff
            );

            if (temp) {
              if (temp.staffName) {
                e.staffName = temp.staffName;
              }
            }

            return e;
          });
          // this.dataDrug= getData.response.result;
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
      // getData = await this.http.post('checkerPhar_copy', formData);
      send.choice = 1;
      getData = await this.http.postNodejs('onusPhar', send);

      if (getData.connect) {
        if (getData.response.length > 0) {
          this.dataDrug = getData.response;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort2;
          this.dataSource.paginator = this.paginator2;
          this.nameExcel = `ภาระงานเภสัชตรวจยา(${this.select}) ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 1) {
      send.choice = 2;
      getData = await this.http.postNodejs('onusPhar', send);
      // getData = await this.http.post('dispenserPhar_copy', formData);

      if (getData.connect) {
        if (getData.response.length > 0) {
          this.dataDrug = getData.response;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort3;
          this.dataSource.paginator = this.paginator3;
          this.nameExcel = `ภาระงานเภสัชจ่ายยา(${this.select}) ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 3) {
      getData = await this.http.post('reportPharCheckandDispend', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort4;
          this.dataSource.paginator = this.paginator4;
          this.nameExcel = `รายงานเภสัชเช็คยาและจ่ายยา`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 4) {
      this.reportDispend();
    }
  };
  matHeaderRowDef1: string[] = [];
  matHeaderRowDef2: string[] = [];
  matHeaderRowDef3: string[] = [];
  displayedColumns6: string[] = [];
  @ViewChild('input6') input6!: ElementRef;
  @ViewChild('MatSort6') sort6!: MatSort;
  @ViewChild('MatPaginator6') paginator6!: MatPaginator;
  selected = 'option2';
  async reportDispend() {
    this.matHeaderRowDef1 = [
      'phar',
      'numHN',
      'drungCount',
      'num_drp',
      'num_doi',
      'drp',
      'it',
      'doi',
      'roi',
    ];

    this.matHeaderRowDef2 = [
      'drp1',
      'drp2',
      'drp3',
      'drp4',
      'drp5',
      'drp6',
      'drp7',
      'drp8',
      'drp9',
      'it1',
      'it2',
      'doi1',
      'doi2',
      'doi3',
      'doi4',
      'doi5',
      'doi6',
      'doi7',
      'doi8',
      'doi9',
      'roi1',
      'roi2',
      'roi3',
    ];
    this.matHeaderRowDef3 = ['drp8_1', 'drp8_2', 'drp8_3', 'drp8_4', 'drp8_5'];
    this.displayedColumns6 = [
      'phar',
      'numHN',
      'drungCount',
      'num_drp',
      'num_doi',
      'drp1',
      'drp2',
      'drp3',
      'drp4',
      'drp5',
      'drp6',
      'drp7',
      'drp8_1',
      'drp8_2',
      'drp8_3',
      'drp8_4',
      'drp8_5',
      'drp9',
      'it1',
      'it2',
      'doi1',
      'doi2',
      'doi3',
      'doi4',
      'doi5',
      'doi6',
      'doi7',
      'doi8',
      'doi9',
      'roi1',
      'roi2',
      'roi3',
    ];
    const start = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    const end = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
    let getData: any = await this.http.postNodejs('getDispend', {
      date1: start,
      date2: end,
    });

    if (getData.connect) {
      if (getData.response.length) {
        this.dataSource = new MatTableDataSource(getData.response);
        this.dataSource.sort = this.sort6;
        this.dataSource.paginator = this.paginator6;

        this.nameExcel = `รายงานจ่ายยา(${start}  - ${end} `;
      } else {
        this.dataSource = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  change(e: any) {
    console.log(e);
  }
  @ViewChild('TABLE') table!: ElementRef;
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    );
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.nameExcel + '.xlsx');
  }
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
  public applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  valuechange() {
    this.getData();
  }

  clearValue() {
    // new Date(new Date().setDate(new Date().getDate() - 1)),
    this.campaignOne = this.formBuilder.group({
      start: [new Date(new Date()), Validators.required],
      end: [new Date(new Date()), Validators.required],
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
  @ViewChild('input5') input5!: ElementRef;
  @ViewChild('MatSort5') sort5!: MatSort;
  @ViewChild('MatPaginator5') paginator5!: MatPaginator;
  displayedColumns5: any = null;
  dataSource5: any = null;
  nameExcel5: any = null;
  async listError(val: any) {
    let datasend = {
      id:
        this.numTab == 0
          ? val.checker_id
          : this.numTab == 1
          ? val.dispenser_id
          : this.numTab == 2
          ? val.staff
          : '',
      dateend: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
      datestart: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
      time1: this.starttime + ':00',
      time2: this.endtime + ':00',
      type:
        this.numTab == 0
          ? 'check'
          : this.numTab == 1
          ? 'จ่าย'
          : this.numTab == 2
          ? 'จัด'
          : '',
      choice: 1,
    };
    let getData: any = await this.http.postNodejs('reportcheckmed', datasend);
    let dataDrug = getData.response.datadrugcheck;
    this.displayedColumns5 = [
      'hn',
      'location',
      'position_text',
      'type_text',
      'med_wrong_name',
      'med_wrong_text',
      'med_good_name',
      'med_good_text',
      'interceptor_name',
      'offender_name',
      'level',
      'occurrence',
      'source',
      'error_type',
      'site',
      'type_pre',
      'note',
      'hnDT',
    ];

    if (getData.connect) {
      if (dataDrug.length) {
        this.dataSource5 = new MatTableDataSource(dataDrug);
        this.dataSource5.sort = this.sort5;
        this.dataSource5.paginator = this.paginator5;
        this.nameExcel5 = `รายงาน MED-Error ${datasend.datestart}_${datasend.dateend}`;
        // this.nameExcel5 = `รายงานเจ้าหน้าที่เช็คยา ${datestart}_${dateend}`;
        let win: any = window;
        win.$('#exampleModal').modal('show');
        setTimeout(() => {
          this.input5.nativeElement.focus();
        }, 100);
      } else {
        this.dataSource5 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public applyFilter5(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource5.filter = filterValue.trim().toLowerCase();
  }
  public applyFilter6(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
