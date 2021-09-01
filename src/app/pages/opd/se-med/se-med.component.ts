import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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

export interface PeriodicElement {
  drugCode: string;
  Name: string;
  Spec: string;
  Quantity: string;
  Maximum: string;
  percenStock: string;
  totalQty: string;
  drugLocation: string;
  Action: string;
}

export interface PeriodicElement2 {
  Code: string;
  Name: string;
  Firmname: string;
  totalQty: string;
}

export const GRI_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    } as Intl.DateTimeFormatOptions,
  },
};

@Component({
  selector: 'app-se-med',
  templateUrl: './se-med.component.html',
  styleUrls: ['./se-med.component.scss'],
})
export class SeMedComponent implements OnInit {
  public dataDrug: any = null;

  public displayedColumns: string[] = [
    'drugCode',
    'Name',
    'Spec',
    'Quantity',
    'Maximum',
    'percenStock',
    // 'totalQty',
    'drugLocation',
    'Action',
  ];

  public displayedColumns2: string[] = ['Code', 'Name', 'Firmname', 'totalQty'];

  public dataSource!: MatTableDataSource<PeriodicElement>;
  public dataSource2!: MatTableDataSource<PeriodicElement2>;

  public dataSEDispense: any;
  public Date = new Date();
  public test = null;
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  public startDate: any = null;
  public endDate: any = null;
  public nameStock: any = null;
  public nameSEDispense: any = null;

  @ViewChild('SortT1') SortT1!: MatSort;
  @ViewChild('SortT2') SortT2!: MatSort;
  // @ViewChild(MatSort)
  // sort!: MatSort;
  // sort2!: MatSort;

  // @ViewChild(MatPaginator, { static: false })
  // paginator!: MatPaginator;
  // paginator2!: MatPaginator;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  // @ViewChild('testq') testq!: ElementRef;
  typeFilter = new FormControl('');
  filterValues = {
    drugCode: '',
  };

  public clickLo: any = null;
  public inputGroup = new FormGroup({
    location: new FormControl(),
  });
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.testq.nativeElement.focus();
  //   }, 1000);
  // }

  ngOnInit(): void {
    this.getDataSEListStock();
    this.getDataSEDispense();
    // this.dataSource.filterPredicate = (
    //   data: PeriodicElement,
    //   filter: string
    // ) => {
    //   return data.isPrepack == filter;
    // };
  }

  public getDataSEListStock = async () => {
    let getData: any = await this.http.get('SEListStock');
    const endDate = moment(new Date()).format('DD/MM/YYYY');
    this.nameStock = 'Stock' + '(' + endDate + ')';
    // console.log(getData);
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;

        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.SortT1;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public getDataPrepack = async (e: any) => {
    if (e == 'All') {
      this.getDataSEListStock();
    } else {
      const endDate = moment(new Date()).format('DD/MM/YYYY');
      if (e == 'Y') {
        this.nameStock = 'SE-Med Prepack' + '(' + endDate + ')';
      } else if (e == 'N') {
        this.nameStock = 'SE-Med Main Drug' + '(' + endDate + ')';
      }

      let formData = new FormData();
      formData.append('prepack', e);
      let getData: any = await this.http.post('SEPrepack', formData);
      // console.log(getData);
      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;

          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.SortT1;
          this.dataSource.paginator = this.paginator;
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
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public getDataSEDispense = async () => {
    const momentDate = new Date();
    const endDate = moment(momentDate).format('YYYY-MM-DD');
    const startDate = moment(momentDate).format('YYYY-MM-DD');
    const end_Date2 = moment(momentDate).format('DD/MM/YYYY');
    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');
    this.startDate = startDate;
    this.endDate = endDate;
    this.nameSEDispense =
      'SEDispense' + '(' + String(start_Date2) + '-' + String(end_Date2) + ')';
    let formData = new FormData();
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);
    let getData: any = await this.http.post('SEDispense', formData);
    console.log(getData);
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataSEDispense = getData.response.result;

        this.dataSource2 = new MatTableDataSource(this.dataSEDispense);
        this.dataSource2.sort = this.SortT2;
        this.dataSource2.paginator = this.paginator2;
      } else {
        this.dataSEDispense = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public PrepackDispense = async (e: any) => {
    if (e == 'All') {
      this.getDataSEDispense();
    } else {
      const endDate = moment(new Date()).format('DD/MM/YYYY');
      if (e == 'Y') {
        this.nameSEDispense = 'Dispense Prepack' + '(' + endDate + ')';
      } else if (e == 'N') {
        this.nameSEDispense = 'Dispense Main Drug' + '(' + endDate + ')';
      }

      let formData = new FormData();
      formData.append('prepack', e);
      formData.append('startDate', this.startDate);
      formData.append('endDate', this.endDate);
      let getData: any = await this.http.post('SEDispense', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataSEDispense = getData.response.result;

          this.dataSource2 = new MatTableDataSource(this.dataSEDispense);
          this.dataSource2.sort = this.SortT2;
          this.dataSource2.paginator = this.paginator2;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  };
  public start_date: any = null;
  public startChange(event: any) {
    this.nameSEDispense = null;
    const momentDate = new Date(event.value);
    this.startDate = moment(momentDate).format('YYYY-MM-DD');
    const start_Date = moment(momentDate).format('DD/MM/YYYY');
    this.start_date = 'SEDispense' + '(' + String(start_Date);
  }

  public async endChange(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    this.nameSEDispense = this.start_date + '-' + String(end_Date) + ')';
    this.endDate = moment(momentDate).format('YYYY-MM-DD');
    let formData = new FormData();
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);

    let getData: any = await this.http.post('SEDispense', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataSEDispense = getData.response.result;
        this.dataSource2 = new MatTableDataSource(this.dataSEDispense);
        this.dataSource2.sort = this.SortT2;
        this.dataSource2.paginator = this.paginator2;
      } else {
        this.dataSEDispense = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  applyFilterType(filterValue: string) {
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async clickData(i: any) {
    this.inputGroup = this.formBuilder.group({
      location: [i.drugLocation, Validators.required],
      code: [i.drugCode],
    });
  }
  public dataDrugEdit: any = null;
  public async updateData() {
    let formData = new FormData();
    formData.append('drugLocation', this.inputGroup.value.location);
    formData.append('drugCode', this.inputGroup.value.code);
    // formData.forEach((value, key) => {
    //   console.log(key + '=' + value);
    // });
    let getData: any = await this.http.post('updateXLocat', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let win: any = window;
        win.$('#myModal').modal('hide');
        Swal.fire('แก้ไขข้อมูลเสร็จสิ้น', '', 'success');
        this.getDataSEListStock();
      } else {
        Swal.fire('แก้ไขข้อมูลไม่สำเร็จ', '', 'error');
        this.dataDrugEdit = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
}
