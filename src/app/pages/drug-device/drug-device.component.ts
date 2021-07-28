import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

export interface PeriodicElement {
  LED: string;
  Row: number;
  Column: number;
  Code: string;
  Name: string;
  Spec: string;
  Quantity: number;
  Minimum: number;
  Maximum: number;
  SupplierName: string;
  ProductExpirationDate: string;
  Lotnumber: number;
  Action: string;
}

@Component({
  selector: 'app-drug-device',
  templateUrl: './drug-device.component.html',
  styleUrls: ['./drug-device.component.scss'],
})
export class DrugDeviceComponent implements OnInit {
  public dataDrug: any = null;
  public upt_code: any = null;
  public page: number = 1;
  public pageData: number = 1;
  public led: string[] = [
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'H7',
    'H8',
    'H9',
    'H10',
    'H11',
    'H12',
    'H13',
    'H14',
    'H15',
  ];

  public dataInput = {
    quantity: null,
  };
  public inputGroup = new FormGroup({
    quantity: new FormControl(),
    Row: new FormControl({ disabled: true }),
    LED: new FormControl({ disabled: true }),
    Column: new FormControl({ disabled: true }),
    Code: new FormControl({ disabled: true }),
    Name: new FormControl({ disabled: true }),
    Spec: new FormControl({ disabled: true }),
    Minimum: new FormControl({ disabled: true }),
    Maximum: new FormControl({ disabled: true }),
    SupplierName: new FormControl({ disabled: true }),
    ProductExpirationDate: new FormControl(),
    Lotnumber: new FormControl(),
  });
  public dataLed: any = null;
  public dataRow: any = null;
  public dataColumn: any = null;
  public show_date: any = null;
  public displayedColumns: string[] = [
    'LED',
    'Row',
    'Column',
    'Code',
    'Name',
    'Spec',
    'Quantity',
    'Minimum',
    'Maximum',
    'SupplierName',
    'ProductExpirationDate',
    'Lotnumber',
    'Action',
  ];

  public dataSource!: MatTableDataSource<PeriodicElement>;

  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  // ngAfterViewInit() {
  //   this.dataSource.sort = this.sort;
  // }
  constructor(private http: HttpService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.getData();
  }

  public getData = async () => {
    let getData: any = await this.http.get('getELMed');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        // for (let i = 0; i <= this.dataDrug.length; i++) {
        //   if (i != 0 && i % 10 == 0) {
        //     this.page_.push(i);
        //   }
        // }

        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        // this.dataDrug.subscribe((contacts: any[]) => {
        //   this.dataSource = new MatTableDataSource(contacts);
        //   this.dataSource.sort = this.sort;
        // });
        // const ELEMENT_DATA: PeriodicElement[] = this.dataDrug;
        // this.dataSource = new MatTableDataSource(ELEMENT_DATA);
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public clickUpdate(i: any) {
    this.upt_code = i.ProductId;
    this.inputGroup.controls['Row'].disable();
    this.inputGroup.controls['LED'].disable();
    this.inputGroup.controls['Column'].disable();
    this.inputGroup.controls['Code'].disable();
    this.inputGroup.controls['Name'].disable();
    this.inputGroup.controls['Spec'].disable();
    this.inputGroup.controls['Minimum'].disable();
    this.inputGroup.controls['Maximum'].disable();
    this.inputGroup.controls['SupplierName'].disable();

    if (i.ProductExpirationDate == null) {
      this.show_date = null;
    } else {
      const momentDate = new Date(i.ProductExpirationDate);
      const formattedDate = moment(momentDate).format('M-D-YYYY');

      this.show_date = new Date(new Date(formattedDate).getTime());
    }

    this.inputGroup = this.formBuilder.group({
      quantity: [i.Quantity, Validators.required],
      Row: [i.Row, Validators.required],
      LED: [i.LED, Validators.required],
      Column: [i.Column, Validators.required],
      Code: [i.Code, Validators.required],
      Name: [i.Name, Validators.required],
      Spec: [i.Spec, Validators.required],
      Minimum: [i.Minimum, Validators.required],
      Maximum: [i.Maximum, Validators.required],
      SupplierName: [i.SupplierName, Validators.required],
      ProductExpirationDate: [this.show_date, Validators.required],
      Lotnumber: [i.Lotnumber, Validators.required],
    });
  }

  public updateData = async () => {
    const momentDate = new Date(this.inputGroup.value.ProductExpirationDate);
    const formattedDate = moment(momentDate).format('YYYY-MM-DD');
    let dateTime = formattedDate + ' ' + '00:00:00.000';
    let formData = new FormData();
    formData.append('ProductId', this.upt_code);
    formData.append('Quantity', this.inputGroup.value.quantity);
    formData.append('ExpDate', formattedDate);
    formData.append('LotNum', this.inputGroup.value.Lotnumber);

    let getData: any = await this.http.post('updateELMed', formData);
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let win: any = window;
        win.$('#myModal').modal('hide');
        Swal.fire('แก้ไขข้อมูลเสร็จสิ้น', '', 'success');
        this.getData();
      } else {
        Swal.fire('แก้ไขข้อมูลไม่สำเร็จ', '', 'error');
      }
    } else {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };
  public onChangeLED = async (e: any) => {
    this.dataLed = e;
  };
  public onChangeRow = async (e: any) => {
    this.dataRow = e;
  };
  public onChangeColumn = async (e: any) => {
    this.dataLed = e;
  };

  public events: Array<any> = [];
  // public dateChange(event: any) {
  //   // this.events.push(`${event.value}`);
  //   // let a = this.events;
  //   console.log(event);
  // }

  public change_date(ProductExpirationDate: any) {
    if (ProductExpirationDate == null) {
      return ProductExpirationDate;
    } else {
      return ProductExpirationDate.substring(0, 10);
    }
  }

  public searchData = async () => {
    let formData = new FormData();
    formData.append('ProductId', this.upt_code);
    formData.append('Quantity', this.inputGroup.value.quantity);
    formData.append('LotNum', this.inputGroup.value.LotNum);
    formData.append('ExpDate', this.inputGroup.value.LotNum);

    // let getData: any = await this.http.post('updateELMed', formData);
    // if (getData.connect) {
    // } else {
    //   alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    // }
  };

  public substringDate(i: any) {
    if (i) {
      return i.substring(0, 10);
    }
    return i;
  }
}
