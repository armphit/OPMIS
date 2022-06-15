import { DatePipe } from '@angular/common';
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
import { stringify } from 'querystring';
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
  public campaignTwo = new FormGroup({
    picker1: new FormControl(
      new Date(new Date().setDate(new Date().getDate() + 1))
    ),
  });
  public startDate: any = null;
  public startDate2: any = null;
  public endDate: any = null;
  public fileName: any = null;
  public nameExcel: any = null;
  public numOrder: any = null;
  public inputGroup = new FormGroup({
    pack: new FormControl(),
  });
  public dataSource!: MatTableDataSource<PeriodicElement>;
  // public dataSource2!: MatTableDataSource<PeriodicElement2>;
  public dataSource3!: MatTableDataSource<PeriodicElement>;
  public displayedColumns: string[] = [
    'drugCode',
    'name',
    'amount',
    'package',
    'forDate',
  ];

  // public displayedColumns2: string[] = [
  //   'orderitemcode',
  //   'orderitemname',
  //   'orderqty',
  //   'orderunitcode',
  // ];

  public displayedColumns3: string[] = [
    'date',
    'code',
    'drugCode',
    'name',
    'dept',
    'HISPackageRatio',
    'qty',
    'SALE_UNIT',
    'DISP_NAME',

    // 'DFORM_NAME',
  ];

  @Input() max: any;
  @ViewChild('MatSort') sort!: MatSort;
  // @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  // @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    const today = new Date();
    const tomorrow = new Date(today);
    this.dateAdapter.setLocale('en-GB');
    this.startDate = new Date(new Date().setDate(new Date().getDate() + 1));
    this.startDate2 = new Date(new Date().setDate(new Date().getDate() + 1));

    this.getDataAppiont();
  }

  ngAfterViewInit() {}

  ngOnInit(): void {}

  public getDataAppiont = async () => {
    const start_Date = moment(this.startDate2).format('YYYY-MM-DD');
    const start_Date2 = moment(this.startDate2).format('DD/MM/YYYY');

    this.nameExcel = 'Drug-Appoint' + '(' + start_Date2 + ')';
    let formData = new FormData();

    formData.append('startDate', start_Date);

    let getData: any = await this.http.post('getAppiont', formData);

    if (getData.connect) {
      if (getData.response.result) {
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
  public dataDrug2: any = null;

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  nrSelect = '';
  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource3.filter = filterValue.trim().toLowerCase();
  }

  public applyFilter4(event: Event) {}

  public changMed: any = null;
  public async getUnit(med: any) {
    this.changMed = med;
    this.getTakemedicine();
  }

  public dataDrug3: any = null;
  public checkedMap: any = null;
  public getTakemedicine = async () => {
    const start_Date = moment(this.startDate).format('YYYY-MM-DD');
    // const start_Date2 = moment(this.startDate).format('DD/MM/YYYY');
    let name = null;
    if (this.changMed == 4) {
      name = 'ยาเม็ด';
    } else if (this.changMed == 3) {
      name = 'ยาฉีด';
    } else if (this.changMed == 5) {
      name = 'ยาอื่นๆ';
      this.changMed = "NOT IN ('3','4')";
    } else if (this.changMed == 6) {
      name = 'ยาอื่นๆ';
      this.changMed = 'IS NULL';
    } else {
      name = '';
      this.changMed = "NOT IN ('')";
    }

    this.nameExcel = 'เบิกยา' + '(' + name + ')' + '(' + start_Date + ')';
    let formData = new FormData();
    formData.append('data', this.changMed);
    formData.append('startDate', start_Date);
    formData.append('depCode', 'W8');
    formData.append('deviceID', JSON.stringify(['6Z04JU6D4ZPMX45B70QC9HH978']));

    let getData: any = await this.http.post('takeMedicine_getUnit', formData);
    let getData2: any = await this.http.post('listINV', formData);
    let listDrugDevice: any = await this.http.post('listDrugDevice', formData);

    if (getData.connect) {
      if (getData.response.result) {
        let newPetList = getData2.response.result.map((val: any) => ({
          drugCode: val.drugCode,
          INVamount: val.amount,
        }));
        this.dataDrug3 = getData.response.result
          .map(function (emp: { drugCode: any }) {
            return {
              ...emp,
              ...(newPetList.find(
                (item: { drugCode: any }) => item.drugCode === emp.drugCode
              ) ?? { INVamount: 0 }),
            };
          })
          .map((data: any) => ({
            ...data,
            Mqty: data.HISPackageRatio
              ? data.INVamount
                ? Math.ceil(
                    (data.amount - data.INVamount) / data.HISPackageRatio
                  ) * data.HISPackageRatio
                : Math.ceil(data.amount / data.HISPackageRatio) *
                  data.HISPackageRatio
              : data.amount,
          }))
          .filter((val: any) => {
            return val.Mqty > 0;
          });

        let dataInj = listDrugDevice.response.result;

        if (this.changMed == 3) {
          this.dataDrug3 = this.dataDrug3.filter((o1: any) =>
            dataInj.some(
              (o2: any) =>
                o1.drugCode.toLowerCase() === o2.drugCode.toLowerCase()
            )
          );
        }

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
      this.getDataAppiont();
      this.nrSelect = '';
    } else if (e == 1) {
      this.getTakemedicine();
      this.nrSelect = '';
    }
  }

  public async startChange(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    this.startDate = new Date(event.value);
    this.getTakemedicine();
    this.nrSelect = '';
  }

  public async startChange2(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    this.startDate2 = new Date(event.value);
    this.getDataAppiont();
  }

  public dataUnit: any = null;
  public async getDataUnit() {
    const start_Date = moment(this.startDate).format('YYYY-MM-DD');

    let formData = new FormData();
    formData.append('startDate', start_Date);
    let getData: any = await this.http.post('getDFrom', formData);
    if (getData.connect) {
      if (getData.response.result) {
        this.dataUnit = getData.response.result;
      } else {
        this.dataUnit = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  changDrugMap() {
    this.getTakemedicine();
  }
}
