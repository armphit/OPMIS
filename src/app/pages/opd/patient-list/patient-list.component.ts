import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { delay } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export interface PeriodicElement {
  patientID: string;
  patientName: string;
  staffName: string;
  createdDT: string;
  orderStatus: string;
}

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit, AfterViewInit {
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
  public dataSource!: MatTableDataSource<PeriodicElement>;
  public displayedColumns: string[] = [
    'patientID',
    'patientName',
    'staffName',
    'createdDT',
    'orderStatus',
    'Action',
  ];
  public inputGroup: any = null;

  @Input() max: any;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public dataDrug: any = null;
  @ViewChild('swiper') swiper!: ElementRef;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 0);
  }

  ngOnInit(): void {}

  public getData = async () => {
    const momentDate = new Date();
    const start_Date2 = moment(momentDate).format('DD/MM/YYYY');

    this.nameExcel = 'Patient' + '(' + start_Date2 + ')';
    let getData: any = await this.http.get('listPatient');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataPharmacist);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = function (
          data,
          filter: string
        ): boolean {
          return (
            data.patientName.toLowerCase().includes(filter) ||
            data.patientID.toLowerCase().includes(filter)
          );
        };
        // for (let i = 0; i < getData.response.result.length; i++) {
        //   this.numOrder =
        //     Number(getData.response.result[i].amountOrders) +
        //     Number(this.numOrder);
        // }
      } else {
        this.dataPharmacist = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public chageStatus(orderStatus: any) {
    if (orderStatus == 'Y') {
      return 'สำเร็จ';
    } else {
      return 'ไม่สำเร็จ';
    }
  }

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

  public async clickDetail(payment: any) {
    let formData = new FormData();
    formData.append('hn', payment.patientID);

    let drugData: any = await this.http.post('medicineList', formData);

    if (drugData.connect) {
      if (drugData.response.rowCount > 0) {
        this.dataDrug = drugData.response.result;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public numberQ(orderqty: any) {
    return ~~orderqty;
  }

  public fixName(name: any) {
    var str = name;
    var splitted = str.split('(', 1);

    return splitted[0];
  }

  public async clickAllergy(cid: any) {
    console.log(cid);
    let formData = new FormData();
    formData.append('cid', cid);

    let drugData: any = await this.http.post('AllergyList', formData);

    // if (drugData.connect) {
    //   if (drugData.response.rowCount > 0) {
    //     this.dataDrug = drugData.response.result;
    //   } else {
    //     this.dataDrug = null;
    //   }
    // } else {
    //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    // }
  }
}
