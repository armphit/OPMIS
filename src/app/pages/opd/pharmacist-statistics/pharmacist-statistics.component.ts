import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
// const EXCEL_TYPE =
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
// const EXCEL_EXTENSION = '.xlsx';

export interface PeriodicElement {
  staffCode: string;
  staffName: string;
  numOrder: string;
  numItem: string;
  avgTime: string;
}

@Component({
  selector: 'app-pharmacist-statistics',
  templateUrl: './pharmacist-statistics.component.html',
  styleUrls: ['./pharmacist-statistics.component.scss'],
})
export class PharmacistStatisticsComponent implements OnInit {
  public Date = new Date();

  public dataPharmacist: any = null;
  public campaignOne = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  public campaignTwo = new FormGroup({
    picker: new FormControl(),
  });
  public startDate: any = null;
  public endDate: any = null;
  public fileName: any = null;
  public nameExcel: any = null;
  public numOrder: any = null;
  public numItem: any = null;
  public dataSource: any = null;
  public dataSource2: any = null;
  public dataSource5: any = null;
  public dataSource6: any = null;

  public avgTime = new Array();
  public displayedColumns: string[] = [
    'staffCode',
    'staffName',
    'numOrder',
    'numItem',
    'avgTime',
  ];

  public displayedColumns2: string[] = [
    'patientID',
    'patientName',
    'staffCode',
    'staffName',
    'createdDT',
    'completeDT',
    'waitTime',
  ];

  public displayedColumns3: string[] = [
    'USERID',
    'FullName',
    'CHECKDATE',
    'CHECKTIME',
  ];
  @Input() max: any;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatSort4') sort4!: MatSort;
  @ViewChild('MatSort5') sort5!: MatSort;
  @ViewChild('MatSort6') sort6!: MatSort;

  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;
  @ViewChild('MatPaginator4') paginator4!: MatPaginator;
  @ViewChild('MatPaginator5') paginator5!: MatPaginator;
  @ViewChild('MatPaginator6') paginator6!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getDataAll();
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() - 1));

    this.campaignOne = this.formBuilder.group({
      start: [tomorrow],
      end: [tomorrow],
    });

    this.campaignTwo = this.formBuilder.group({
      picker: new Date(),
    });
  }

  ngOnInit(): void {}
  selected = 'm';
  public getData = async () => {
    this.numOrder = null;
    this.numItem = null;
    this.dataPharmacist = null;
    this.dataSource = null;
    this.nameExcel4 = null;
    const momentDate = new Date();

    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');

    this.nameExcel4 = 'Pharmacist_inTime' + '(' + start_Date2 + ')';
    let getData: any = null;
    let getData2: any = null;

    getData = await this.http.get('reportPhar');
    getData2 = await this.http.get('reportPharAVG');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataPharmacist);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        for (let i = 0; i < getData.response.result.length; i++) {
          this.numOrder =
            Number(getData.response.result[i].numOrder) + Number(this.numOrder);
          this.numItem =
            Number(getData.response.result[i].numItem) + Number(this.numItem);
        }
        let avg = {
          staffName: '',
          staffCode: '',
          numOrder: '',
          numItem: 'Average',
          avgTime: getData2.response.result[0].avgTime,
        };
        this.dataPharmacist.push(avg);
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public getDataOrder = async () => {
    this.dataPharmacist = null;
    this.nameExcel4 = null;
    const momentDate = new Date();

    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');

    this.nameExcel4 = 'listOrderTime' + '(' + start_Date2 + ')';
    let getData: any = await this.http.get('listOrderTime');
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource2 = new MatTableDataSource(this.dataPharmacist);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public getDataOrderHistory = async () => {
    this.dataPharmacist = null;
    this.nameExcel4 = null;

    let startDate = this.startDate + ' ' + '00:00:00';
    let endDate = this.endDate + ' ' + '23:59:59';

    this.nameExcel4 =
      'listOrderTimeHistory' +
      '(' +
      this.startDate +
      ')' +
      '-' +
      '(' +
      this.endDate +
      ')';

    let formData = new FormData();
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    let getData: any = await this.http.post('listOrderTimeHistory', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource5 = new MatTableDataSource(this.dataPharmacist);
        this.dataSource5.sort = this.sort5;
        this.dataSource5.paginator = this.paginator5;
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public start_date: any = null;
  public startChange(event: any) {
    this.dataPharmacist = null;
    this.nameExcel4 = null;
    // this.nameSEDispense = null;
    const momentDate = new Date(event.value);
    this.startDate = moment(momentDate).format('YYYY-MM-DD');
    const start_Date = moment(momentDate).format('DD/MM/YYYY');
    this.start_date = 'SEDispense' + '(' + String(start_Date);
  }

  public async endChange(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    // this.nameSEDispense = this.start_date + '-' + String(end_Date) + ')';
    this.endDate = moment(momentDate).format('YYYY-MM-DD');
    this.getDataOrderHistory();
  }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  public numTab: any = null;
  public getTab(e: any) {
    this.numTab = e;
    if (e == 0) {
      this.getDataAll();
    } else if (e == 1) {
      this.getData();
    } else if (e == 2) {
      this.getDataOut();
    } else if (e == 3) {
      this.getDataOrder();
    } else if (e == 4) {
      this.startDate = moment(this.campaignOne.value.start).format(
        'YYYY-MM-DD'
      );
      this.endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

      this.getDataOrderHistory();
    } else if (e == 5) {
      this.startDateDoor = moment(this.campaignTwo.value.picker).format(
        'YYYY-MM-DD'
      );

      this.drugDispensingReport();
    }
  }
  public numOrder2: any = null;
  public numItem2: any = null;
  public dataPharmacist2: any = null;
  public dataSource3: any = null;
  public nameExcel3: any = null;

  public getDataOut = async () => {
    this.numOrder2 = null;
    this.numItem2 = null;
    this.dataPharmacist = null;
    this.dataSource3 = null;
    this.nameExcel4 = null;
    const momentDate = new Date();

    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');

    this.nameExcel4 = 'Pharmacist_partTime' + '(' + start_Date2 + ')';
    let getData: any = null;
    let getData2: any = null;

    getData = await this.http.get('reportPhar16');
    getData2 = await this.http.get('reportPhar16AVG');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource3 = new MatTableDataSource(this.dataPharmacist);
        this.dataSource3.sort = this.sort3;
        this.dataSource3.paginator = this.paginator3;
        for (let i = 0; i < getData.response.result.length; i++) {
          this.numOrder2 =
            Number(getData.response.result[i].numOrder) +
            Number(this.numOrder2);
          this.numItem2 =
            Number(getData.response.result[i].numItem) + Number(this.numItem2);
        }
        let avg = {
          staffName: '',
          staffCode: '',
          numOrder: '',
          numItem: 'Average',
          avgTime: getData2.response.result[0].avgTime,
        };
        this.dataPharmacist.push(avg);
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
  }

  public numOrder3: any = null;
  public numItem3: any = null;
  public dataPharmacist3: any = null;
  public dataSource4: any = null;
  public nameExcel4: any = null;

  public getDataAll = async () => {
    this.numOrder3 = null;
    this.numItem3 = null;
    this.dataPharmacist = null;
    this.dataSource4 = null;
    this.nameExcel4 = null;
    const momentDate = new Date();

    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');

    this.nameExcel4 = 'Pharmacist' + '(' + start_Date2 + ')';
    let getData: any = null;
    let getData2: any = null;
    getData = await this.http.get('reportPharAll');
    getData2 = await this.http.get('reportPharAllAVG');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource4 = new MatTableDataSource(this.dataPharmacist);
        this.dataSource4.sort = this.sort4;
        this.dataSource4.paginator = this.paginator4;

        for (let i = 0; i < getData.response.result.length; i++) {
          this.numOrder3 =
            Number(getData.response.result[i].numOrder) +
            Number(this.numOrder3);
          this.numItem3 =
            Number(getData.response.result[i].numItem) + Number(this.numItem3);
        }
        let avg = {
          staffName: '',
          staffCode: '',
          numOrder: '',
          numItem: 'Average',
          avgTime: getData2.response.result[0].avgTime,
        };
        this.dataPharmacist.push(avg);
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
  }

  public applyFilter5(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
  }

  public applyFilter6(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource6.filter = filterValue.trim().toLowerCase();
    if (this.dataSource6.paginator) {
      this.dataSource6.paginator.firstPage();
    }
  }

  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.dataPharmacist
    );
    const workbook: XLSX.WorkBook = {
      Sheets: { Sheet1: worksheet },
      SheetNames: ['Sheet1'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    // const date = new Date();
    // const fileName = this.nameExcel4;

    FileSaver.saveAs(data, this.nameExcel4);
  }

  public drugDispensingReport = async () => {
    const start_Date = moment(this.startDateDoor).format('YYYY-MM-DD');
    const start_Date2 = moment(this.startDateDoor).format('DD/MM/YYYY');

    this.nameExcel = 'รายงานการเข้าห้องจ่ายยา' + '(' + start_Date2 + ')';
    let formData = new FormData();
    formData.append('startDate', start_Date);

    let getData: any = await this.http.post('doorReport', formData);

    if (getData.connect) {
      if (getData.response.result) {
        this.dataPharmacist = getData.response.result;
        this.dataSource6 = new MatTableDataSource(this.dataPharmacist);
        this.dataSource6.sort = this.sort6;
        this.dataSource6.paginator = this.paginator6;
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  public startDateDoor: any = null;
  public async startChangeDoor(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    this.startDateDoor = new Date(event.value);
    this.drugDispensingReport();
  }
}
