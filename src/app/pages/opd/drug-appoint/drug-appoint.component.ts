import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { delay } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

export interface PeriodicElement {
  drugCode: string;
  name: string;
  package: string;
  amount: string;
  forDate: string;
  miniUnit: string;
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
  public inputGroup = new FormGroup({
    pack: new FormControl(),
  });
  public dataSource!: MatTableDataSource<PeriodicElement>;
  public dataSource2!: MatTableDataSource<PeriodicElement2>;
  public dataSource3!: MatTableDataSource<PeriodicElement>;
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

  public displayedColumns3: string[] = [
    'date',
    'code',
    'drugCode',
    'dept',
    'qty',
    'miniUnit',
    'name',
    'HISPackageRatio',
    'Action',
  ];

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
  nrSelect = '';
  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource3.filter = filterValue.trim().toLowerCase();
  }

  public applyFilter4(event: Event) {}

  public async getUnit(med: any) {
    if (med) {
      const start_Date = moment(this.startDate).format('YYYY-MM-DD');

      let splitted = med.split(',');
      let data = JSON.stringify(splitted);
      let formData = new FormData();
      formData.append('data', data);
      formData.append('startDate', start_Date);
      let getData: any = await this.http.post('getPackageDrug', formData);
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
    } else {
      this.getTakemedicine();
    }
  }

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

  public clickData(i: any) {
    this.inputGroup = this.formBuilder.group({
      pack: [i.HISPackageRatio, Validators.required],
      code: [i.drugCode],
    });
  }

  public async updateData() {
    let formData = new FormData();
    formData.append('pack', this.inputGroup.value.pack);
    formData.append('drugCode', this.inputGroup.value.code);
    formData.forEach((value, key) => {
      console.log(key + '=' + value);
    });
    let getData: any = await this.http.post('updatePack104', formData);
    let getData2: any = await this.http.post('updatePack101', formData);
    let getData3: any = await this.http.post('updatePack102', formData);
    let getData4: any = await this.http.post('updatePack102_mySQL', formData);
    // let getDataArr = new Array();
    // getDataArr.push(getData.response.rowCount);
    // getDataArr.push(getData2.response.rowCount);
    // getDataArr.push(getData3.response.rowCount);
    // getDataArr.push(getData4.response.rowCount);
    // console.log(getData4);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let win: any = window;
        win.$('#myModal').modal('hide');
        Swal.fire('แก้ไขข้อมูลเสร็จสิ้น', '', 'success');
        this.getTakemedicine();
      } else {
        Swal.fire('แก้ไขข้อมูลไม่สำเร็จ', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
}
