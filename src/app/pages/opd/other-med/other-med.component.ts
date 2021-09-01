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
    'positionID',
    'drugCode',
    'drugName',
    'packageSpec',
    'firmName',
    'deviceName',
  ];
  selected = '';
  public dataSource!: MatTableDataSource<JVElement>;
  public dataSource2!: MatTableDataSource<JVElement>;
  public dataSource3!: MatTableDataSource<JVElement>;
  public dataSource4!: MatTableDataSource<JVElement>;
  public dataSource5!: MatTableDataSource<JVElement>;

  public dataTable: any = null;

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

  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;
  @ViewChild('MatPaginator4') paginator4!: MatPaginator;
  @ViewChild('MatPaginator5') paginator5!: MatPaginator;

  constructor(private http: HttpService) {
    this.getDataID();
  }

  ngOnInit(): void {}
  public dataD = Array();
  public getName: any = null;

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

  public async getData() {
    let data = JSON.stringify(this.dataD);
    let formData = new FormData();
    formData.append('deviceID', data);
    let getData: any = await this.http.post('listDrugDevice', formData);
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        if (this.name == 'JV') {
          this.dataSource = new MatTableDataSource(this.dataDrug);
          // this.dataSource.filterPredicate = (data: any, filter: string) =>
          //   data.drugCode.indexOf(filter) != -1;
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
        }
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    this.dataDrug = null;
  }
  public nameExcel: any = 'เครื่องนับยาเม็ด (JV)';
  public getTab(num: any) {
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
  }

  public applyFilter4(event: Event) {
    this.selected = '';
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
    this.nameExcel = 'ตู้เย็น (R)';
  }

  public applyFilter5(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource5.filter = filterValue.trim().toLowerCase();
    if (this.dataSource5.paginator) {
      this.dataSource5.paginator.firstPage();
    }
  }

  public getDataR(event: any) {
    if (event) {
      this.nameExcel = event;
    } else {
      this.nameExcel = 'ตู้เย็น (R)';
    }
    this.dataSource3.filter = event;

    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
  }

  public getDataM(event: any) {
    if (event) {
      this.nameExcel = event;
    } else {
      this.nameExcel = 'จัดมือ (M)';
    }
    this.name = event;
    this.dataSource4.filter = event;

    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
  }
}
