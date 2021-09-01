import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

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
  public dataSource!: MatTableDataSource<PeriodicElement>;
  public displayedColumns: string[] = [
    'staffCode',
    'staffName',
    'numOrder',
    'numItem',
    'avgTime',
  ];
  @Input() max: any;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngAfterViewInit() {}

  ngOnInit(): void {
    this.getData();
  }

  public getData = async () => {
    // this.nameExcel = null;
    const momentDate = new Date();
    // const endDate = moment(momentDate).format('YYMMDD');
    // const startDate = moment(momentDate).format('YYMMDD');
    // const end_Date2 = moment(momentDate).format('DD/MM/YYYY');
    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');
    // this.nameExcel =
    //   'ap-med' + '(' + String(start_Date2) + '-' + String(end_Date2) + ')';
    // this.startDate = startDate + '000000000';
    // this.endDate = endDate + '999999999';
    // let formData = new FormData();
    // formData.append('startDate', this.startDate);
    // formData.append('endDate', this.endDate);
    this.nameExcel = 'Pharmacist' + '(' + start_Date2 + ')';
    let getData: any = await this.http.get('reportPhar');

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
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  // public startChange(event: any) {
  //   this.nameExcel = null;
  //   this.dataPharmacist = null;
  //   const momentDate = new Date(event.value);
  //   this.startDate = moment(momentDate).format('YYMMDD');

  //   const start_Date = moment(momentDate).format('DD/MM/YYYY');
  //   this.fileName = 'ap-med' + '(' + String(start_Date);
  // }

  // public async endChange(event: any) {
  //   const momentDate = new Date(event.value);
  //   this.endDate = moment(momentDate).format('YYMMDD');
  //   const end_Date = moment(momentDate).format('DD/MM/YYYY');
  //   this.nameExcel = this.fileName + '-' + String(end_Date) + ')';
  //   this.startDate = this.startDate + '000000000';
  //   this.endDate = this.endDate + '999999999';
  //   let formData = new FormData();
  //   formData.append('startDate', this.startDate);
  //   formData.append('endDate', this.endDate);

  //   let getData: any = await this.http.post('APDispense', formData);

  //   if (getData.connect) {
  //     if (getData.response.rowCount > 0) {
  //       this.dataPharmacist = getData.response.result;
  //       this.dataSource = new MatTableDataSource(this.dataPharmacist);
  //       this.dataSource.sort = this.sort;
  //       this.dataSource.paginator = this.paginator;
  //     } else {
  //       this.dataPharmacist = null;
  //     }
  //   } else {
  //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //   }
  // }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
