import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { delay } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

export interface PeriodicElement {
  drugCode: string;
  name: string;
  package: string;
  amount: string;
  forDate: string;
}

export interface PeriodicElement2 {
  orderitemcode: string;
  orderitemname: string;
  orderqty: string;
  orderunitcode: string;
}

@Component({
  selector: 'app-drug-appoint',
  templateUrl: './drug-appoint.component.html',
  styleUrls: ['./drug-appoint.component.scss'],
})
export class DrugAppointComponent implements OnInit {
  public Date = new Date();
  public dataDrug: any = null;
  public campaignOne = new FormGroup({
    picker: new FormControl(
      new Date(new Date().setDate(new Date().getDate() + 1))
    ),
  });
  public startDate: any = null;
  public endDate: any = null;
  public fileName: any = null;
  public nameExcel: any = null;
  public numOrder: any = null;
  public dataSource!: MatTableDataSource<PeriodicElement>;
  public dataSource2!: MatTableDataSource<PeriodicElement2>;
  public dataSource3!: MatTableDataSource<PeriodicElement2>;
  public displayedColumns: string[] = [
    'drugCode',
    'name',
    'amount',
    'package',
    'forDate',
  ];

  public displayedColumns2: string[] = [
    'orderitemcode',
    'orderitemname',
    'orderqty',
    'orderunitcode',
  ];

  public displayedColumns3: string[] = ['date', 'code', 'qty', 'dept'];

  @Input() max: any;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getDataTomorrow();
    const today = new Date();
    const tomorrow = new Date(today);
    this.startDate = tomorrow.setDate(tomorrow.getDate() + 1);
  }

  ngAfterViewInit() {}

  ngOnInit(): void {}

  public getDataTomorrow = async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start_Date2 = moment(tomorrow).format('DD/MM/YYYY');

    this.nameExcel = 'Drug-Appoint' + '(' + start_Date2 + ')';
    let getData: any = await this.http.drugAppoint_send();

    if (getData.connect) {
      try {
        this.dataDrug = getData.response.data;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } catch (error) {
        this.getDataTomorrow();
      }
      // if (getData.response.data) {
      //   this.dataDrug = getData.response.data;
      //   this.dataSource = new MatTableDataSource(this.dataDrug);
      //   this.dataSource.sort = this.sort;
      //   this.dataSource.paginator = this.paginator;
      //   // for (let i = 0; i < getData.response.result.length; i++) {
      //   //   this.numOrder =
      //   //     Number(getData.response.result[i].amountOrders) +
      //   //     Number(this.numOrder);
      //   // }
      // } else {
      //   this.getDataTomorrow();
      // }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  public dataDrug2: any = null;
  public getDataCurrent = async () => {
    const today = new Date();
    // const tomorrow = new Date(today);
    // tomorrow.setDate(tomorrow.getDate() + 1);
    const start_Date2 = moment(today).format('DD/MM/YYYY');

    this.nameExcel = 'Drug-Today' + '(' + start_Date2 + ')';
    let getData: any = await this.http.get('listAllDispense');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug2 = getData.response.result;
        this.dataSource2 = new MatTableDataSource(this.dataDrug2);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      } else {
        this.dataDrug2 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  // public async clickDetail(payment: any) {
  //   let formData = new FormData();
  //   formData.append('hn', payment.patientID);

  //   let drugData: any = await this.http.post('medicineList', formData);

  //   if (drugData.connect) {
  //     if (drugData.response.rowCount > 0) {
  //       this.dataDrug = drugData.response.result;
  //     } else {
  //       this.dataDrug = null;
  //     }
  //   } else {
  //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //   }
  // }

  public dataDrug3: any = null;
  public getTakemedicine = async () => {
    const start_Date = moment(this.startDate).format('YYYY-MM-DD');
    const start_Date2 = moment(this.startDate).format('DD/MM/YYYY');

    this.nameExcel = 'เบิกยา' + '(' + start_Date2 + ')';
    let formData = new FormData();
    formData.append('startDate', start_Date);

    let getData: any = await this.http.post('takeMedicine', formData);
    if (getData.connect) {
      if (getData.response.result) {
        this.dataDrug3 = getData.response.result;
        this.dataSource3 = new MatTableDataSource(this.dataDrug3);
        this.dataSource3.sort = this.sort3;
        this.dataSource3.paginator = this.paginator3;
      } else {
        this.dataDrug3 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public numberQ(orderqty: any) {
    return ~~orderqty;
  }

  public getTab(e: any) {
    if (e == 0) {
      this.getDataTomorrow();
    } else if (e == 1) {
      this.getDataCurrent();
    } else if (e == 2) {
      this.getTakemedicine();
    }
  }

  public async startChange(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    this.startDate = new Date(event.value);
    this.getTakemedicine();
  }
}
