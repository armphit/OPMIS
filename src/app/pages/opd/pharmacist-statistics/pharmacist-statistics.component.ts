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
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  public startDate: any = null;
  public endDate: any = null;
  public fileName: any = null;
  public nameExcel: any = null;
  public numOrder: any = null;
  public numItem: any = null;
  public dataSource: any = null;
  public dataSource2: any = null;
  public avgTime = new Array();
  public displayedColumns: string[] = [
    'staffCode',
    'staffName',
    'numOrder',
    'numItem',
    'avgTime',
  ];
  // public displayedColumns3: string[] = [
  //   'staffCode',
  //   'staffName',
  //   'numOrder',
  //   'numItem',
  //   'avgTime',
  // ];
  // public displayedColumns4: string[] = [
  //   'staffCode',
  //   'staffName',
  //   'numOrder',
  //   'numItem',
  //   'avgTime',
  // ];
  public displayedColumns2: string[] = [
    'patientName',
    'staffCode',
    'createdDT',
    'completeDT',
    'waitTime',
  ];
  @Input() max: any;
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
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getDataAll();
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
        this.dataSource2.sortingDataAccessor = (
          item: { [x: string]: any; birthday: string | number | Date },
          property: string | number
        ) => {
          switch (property) {
            case 'birthday':
              return new Date(item.birthday).getTime();

            default:
              return item[property];
          }
        };
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

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

  // downloadExcel() {
  //   let header = null;
  //   if (this.numTab != 3) {
  //     header = [
  //       {
  //         A: 'รหัส',
  //         B: 'ชื่อ',
  //         C: 'จำนวน Order',
  //         D: 'จำนวน Item',
  //         E: 'เวลาเฉลี่ย',
  //       },
  //     ];
  //   } else {
  //     header = [
  //       {
  //         A: 'patientName',
  //         B: 'staffCode',
  //         C: 'staffName',
  //         D: 'createdDT',
  //         E: 'completeDT',
  //         F: 'waitTime',
  //       },
  //     ];
  //   }

  //   this.exportAsExcelFile(this.dataPharmacist, header, 'excel');
  // }

  // public exportAsExcelFile(
  //   json: any[],
  //   headerText: any[],
  //   excelFileName: string
  // ): void {
  //   var worksheet = XLSX.utils.json_to_sheet(headerText, {
  //     header: [],
  //     skipHeader: true,
  //   });

  //   XLSX.utils.sheet_add_json(worksheet, json, {
  //     skipHeader: true,
  //     origin: 'A2',
  //   });

  //   const workbook: XLSX.WorkBook = {
  //     Sheets: { data: worksheet },
  //     SheetNames: ['data'],
  //   };

  //   const excelBuffer: any = XLSX.write(workbook, {
  //     bookType: 'xlsx',
  //     type: 'array',
  //   });

  //   this.saveAsExcelFile(excelBuffer, excelFileName);
  // }

  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {
  //     type: EXCEL_TYPE,
  //   });
  //   FileSaver.saveAs(data, this.nameExcel4);
  // }

  exportToExcel() {
    console.log(this.nameExcel4);
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
}
