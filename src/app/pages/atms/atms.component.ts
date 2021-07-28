import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
// import {MomentDateAdapter} from '@angular/material-moment-adapter';

export interface PeriodicElement {
  drugCode: string;
  drugName: string;
  tblt_maker: string;
  tblt_spec: string;
  totalQty: number;
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-atms',
  templateUrl: './atms.component.html',
  styleUrls: ['./atms.component.scss'],
  // providers: [
  //   {
  //     provide: DateAdapter,
  //     useClass: MomentDateAdapter,
  //     deps: [MAT_DATE_LOCALE],
  //   },
  //   { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  // ],
})
export class AtmsComponent implements OnInit {
  public Date = new Date();
  public dataDrug: any = null;
  public campaignOne = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  public startDate: any = null;
  public endDate: any = null;

  public dataSource!: MatTableDataSource<PeriodicElement>;
  public displayedColumns: string[] = [
    'drugCode',
    'drugName',
    'tblt_maker',
    'tblt_spec',
    'totalQty',
  ];

  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpService, private formBuilder: FormBuilder) {}

  ngAfterViewInit() {}

  ngOnInit(): void {
    this.getData();
  }

  public getData = async () => {
    let formData = new FormData();
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);

    let getData: any = await this.http.post('postATMS', formData);

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

  public startChange(event: any) {
    const momentDate = new Date(event.value);
    this.startDate = moment(momentDate).format('YYMMDD');
  }

  public async endChange(event: any) {
    const momentDate = new Date(event.value);
    this.endDate = moment(momentDate).format('YYMMDD');
    this.startDate = this.startDate + '000000000';
    this.endDate = this.endDate + '999999999';
    let formData = new FormData();
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);

    let getData: any = await this.http.post('postATMSsearch', formData);
    // console.log(getData);
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
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // public updateData = async () => {
  //   const momentDate = new Date();
  //   const formattedDate = moment(momentDate).format('YYMMDD');
  //   const enddate = Number(formattedDate) - 5;
  //   const start = String(enddate);
  //   const momentDate1 = new Date();
  //   const formattedDate1 = moment(momentDate).format('YYMMDD');

  //   let formData = new FormData();
  //   formData.append('startDate', '210719');
  //   formData.append('endDate', '210724');

  //   let getData: any = await this.http.post('postATMS', formData);
  //   console.log(getData);
  //   console.log(formattedDate1);
  //   console.log(start);
  //   if (getData.connect) {
  //     if (getData.response.rowCount > 0) {
  //       this.dataDrug = getData.response.result;
  //     } else {
  //       this.dataDrug = null;
  //     }
  //   } else {
  //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //   }
  // };
}
