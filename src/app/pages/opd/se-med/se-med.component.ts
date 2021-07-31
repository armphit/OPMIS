import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
}

export interface PeriodicElement2 {
  Code: string;
  Name: string;
  Spec: string;
  totalQty: string;
}

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
    'totalQty',
  ];

  public displayedColumns2: string[] = ['Code', 'Name', 'Spec', 'totalQty'];

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

  // ngAfterViewInit() {
  //   this.dataSource.sort = this.sort;
  // }
  constructor(private http: HttpService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.getDataSEListStock();
    this.getDataSEDispense();
  }

  public getDataSEListStock = async () => {
    let getData: any = await this.http.get('SEListStock');

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
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public getDataSEDispense = async () => {
    const momentDate = new Date();
    const endDate = moment(momentDate).format('YY-MM-DD');
    const startDate = moment(momentDate).format('YY-MM-DD');
    this.startDate = startDate;
    this.endDate = endDate;

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
  };

  public startChange(event: any) {
    const momentDate = new Date(event.value);
    this.startDate = moment(momentDate).format('YYYY-MM-DD');
  }

  public async endChange(event: any) {
    const momentDate = new Date(event.value);
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
  }
}
