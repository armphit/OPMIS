import { ChangeDetectorRef } from '@angular/core';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  DateAdapter,
  MatDateFormats,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

export interface JVElement {
  positionID: string;
  drugCode: string;
  drugName: string;
  packageSpec: string;
  firmName: string;
  amount: string;
  miniUnit: string;
  deviceName: string;
}

@Component({
  selector: 'app-other-med',
  templateUrl: './other-med.component.html',
  styleUrls: ['./other-med.component.scss'],
})
export class OtherMedComponent implements OnInit {
  public name: string = 'JV';
  public dataDrug: any = null;
  public tab = [
    'เครื่องนับยาเม็ด',
    'ตู้ยาฉีด',
    'ตู้เย็น',
    'ตู้จัดมือ',
    'ยาเศษ',
  ];
  public displayedColumns: string[] = [
    'drugCode',
    'drugName',
    'packageSpec',
    'amount',
    'miniUnit',
    'drugCount',
    'drugSum',
    'deviceName',
    'positionID',
  ];
  selected = '';
  public dataSource: any = null;
  public dataSource2: any = null;
  public dataSource3: any = null;
  public dataSource4: any = null;
  public dataSource5: any = null;
  public dataSource6: any = null;

  public dataTable: any = null;
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  // @ViewChild(MatSort)
  // sort!: MatSort;
  // sort2!: MatSort;
  // sort3!: MatSort;
  // sort4!: MatSort;
  // sort5!: MatSort;

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

  constructor(private http: HttpService) {
    this.getDataID();
    const momentDate = new Date();
    const endDate = moment(momentDate).format('YYYY-MM-DD');
    const startDate = moment(momentDate).format('YYYY-MM-DD');
    const end_Date2 = moment(momentDate).format('DD/MM/YYYY');
    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');
    this.startDate = startDate;
    this.endDate = endDate;

    // this.getTest();
  }

  ngOnInit(): void {
    // this.dataSource.filterPredicate = (data: any, filter: string) => {
    //   return data.drugCode == filter;
    // };
  }
  public dataD = Array();
  public getName: any = null;

  // public async getTest() {
  //   try {
  //     let getID: any = await this.http.getpath(
  //       'http://192.168.42.1/unit/ssr/pharm_rep/service/getINV_STOCK.asp?DEPT=OPD_T'
  //     );
  //     console.log(getID);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  public async getDataID() {
    let nameData = new FormData();
    nameData.append('name', this.name);
    let getID: any = await this.http.post('listDevice', nameData);
    this.getName = getID.response.result;
    for (let index = 0; index < getID.response.result.length; index++) {
      this.dataD.push(getID.response.result[index].deviceID);
    }

    this.getData();
  }
  public startDate: any = null;
  public endDate: any = null;

  public async getData() {
    // this.nameExcel = null;
    let data = JSON.stringify(this.dataD);

    let startDate = this.startDate + ' ' + '00:00:00';
    let endDate = this.endDate + ' ' + '23:59:59';
    let formData = new FormData();
    formData.append('deviceID', data);
    formData.append('name', this.name);
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);
    let getData: any = await this.http.post('listDrugDeviceTEST', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        if (this.name == 'JV') {
          this.dataSource = new MatTableDataSource(this.dataDrug);

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        } else if (this.name == 'INJ') {
          this.dataSource2 = new MatTableDataSource(this.dataDrug);
          this.dataSource2.sort = this.sort2;
          this.dataSource2.paginator = this.paginator2;
        } else if (this.name == 'R') {
          this.dataSource3 = new MatTableDataSource(this.dataDrug);
          this.dataSource3.sort = this.sort3;
          this.dataSource3.paginator = this.paginator3;
        } else if (this.name == 'M') {
          this.dataSource4 = new MatTableDataSource(this.dataDrug);
          this.dataSource4.sort = this.sort4;
          this.dataSource4.paginator = this.paginator4;
        } else if (this.name == 'N') {
          this.dataSource5 = new MatTableDataSource(this.dataDrug);
          this.dataSource5.sort = this.sort5;
          this.dataSource5.paginator = this.paginator5;
        } else if (this.name == 'CD') {
          this.dataSource6 = new MatTableDataSource(this.dataDrug);
          this.dataSource6.sort = this.sort6;
          this.dataSource6.paginator = this.paginator6;
        }
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    this.dataDrug = null;

    this.nameExcel2 =
      this.nameExcel + '(' + this.startDate + '_' + this.endDate + ')';
  }
  customFilterPredicate(): any {
    throw new Error('Method not implemented.');
  }
  public nameExcel: any = 'เครื่องนับยาเม็ด (JV)';
  public nameExcel2: any = null;
  public getTab(num: any) {
    this.nameExcel = null;
    if (num == 0) {
      this.nameExcel = 'เครื่องนับยาเม็ด (JV)';
      this.name = 'JV';
    } else if (num == 1) {
      this.name = 'INJ';
      this.nameExcel = 'ตู้ยาฉีด (INJ)';
    } else if (num == 2) {
      this.name = 'R';
      this.nameExcel = 'ตู้เย็น (R)';
    } else if (num == 3) {
      this.nameExcel = 'จัดมือ (M)';
      this.name = 'M';
    } else if (num == 4) {
      this.nameExcel = 'ยาเศษ (N)';
      this.name = 'N';
    } else if (num == 5) {
      this.nameExcel = 'CD-Med_OPD';
      this.name = 'CD';
    }
    this.dataD = [];

    this.getDataID();
  }

  public applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }

  public applyFilter3(event: Event) {
    this.selected = '';
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
    this.nameExcel = 'จัดมือ (M)';
    this.nameExcel =
      this.nameExcel + '(' + this.startDate + '_' + this.endDate + ')';
  }

  public applyFilter4(event: Event) {
    this.selected = '';
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
    this.nameExcel = 'ตู้เย็น (R)';
    this.nameExcel =
      this.nameExcel + '(' + this.startDate + '_' + this.endDate + ')';
  }

  public applyFilter5(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource5.filter = filterValue.trim().toLowerCase();
    if (this.dataSource5.paginator) {
      this.dataSource5.paginator.firstPage();
    }
  }

  public applyFilter6(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource6.filter = filterValue.trim().toLowerCase();
    if (this.dataSource6.paginator) {
      this.dataSource6.paginator.firstPage();
    }
  }

  public getDataR(event: any) {
    this.nameExcel = null;
    if (event) {
      this.nameExcel = event;
    }
    this.dataSource3.filter = event;
    this.nameExcel =
      this.nameExcel + '(' + this.startDate + '_' + this.endDate + ')';
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
  }

  public getDataM(event: any) {
    this.nameExcel = null;
    if (event) {
      this.nameExcel = event;
    }
    this.nameExcel =
      this.nameExcel + '(' + this.startDate + '_' + this.endDate + ')';
    this.name = event;
    this.dataSource4.filter = event;

    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
  }

  public start_date: any = null;
  public startChange(event: any) {
    this.nameExcel2 = null;
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

    // let formData = new FormData();
    // formData.append('startDate', this.startDate);
    // formData.append('endDate', this.endDate);
    this.getData();
    //   let getData: any = await this.http.post('SEDispense', formData);

    //   if (getData.connect) {
    //     if (getData.response.rowCount > 0) {
    //       this.dataSEDispense = getData.response.result;
    //       this.dataSource2 = new MatTableDataSource(this.dataSEDispense);
    //       this.dataSource2.sort = this.SortT2;
    //       this.dataSource2.paginator = this.paginator2;
    //     } else {
    //       this.dataSEDispense = null;
    //     }
    //   } else {
    //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    //   }
    // }
  }
}
