import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  LOCALE_ID,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  DateAdapter,
  MatDateFormats,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
// import {MomentDateAdapter} from '@angular/material-moment-adapter';

export interface PeriodicElement {
  Code: string;
  Name: string;
  Spec: string;
  firmName: string;
  Unit: string;
}

@Component({
  selector: 'app-atms',
  templateUrl: './atms.component.html',
  styleUrls: ['./atms.component.scss'],
})
export class AtmsComponent implements OnInit {
  public Date = new Date();
  public dataDrug: any = null;
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  public dateBirth: any = null;
  public endDate: any = null;

  displayedColumns: string[] = [
    'select',
    'Code',
    'Name',
    'Spec',
    'firmName',
    'Unit',
  ];

  public inputGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl(),
    sex: new FormControl(),
    age: new FormControl(),
    orderNo: new FormControl(),
    orderType: new FormControl(),
    pharmacy: new FormControl(),
    dateB: new FormControl(),
    dateP: new FormControl(),
  });

  public drugList: any = null;

  selection = new SelectionModel<PeriodicElement>(true, []);
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: any;
  public jsonArr = new Array();
  @ViewChildren('checkboxes')
  checkboxes!: QueryList<ElementRef>;
  globalcheckbox: boolean = false;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit(): void {
    this.getData();
  }

  disableClick = false;
  isOpen = false;
  public getData = async () => {
    let getData: any = await this.http.get('dataDrug');

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

  toggleDisable() {
    this.disableClick = !this.disableClick;
    if (this.disableClick) {
      this.inputGroup.disable();
    } else {
      this.inputGroup.enable();
    }
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  value = new Array();
  value2 = new Array();

  async showOptions(e: any, val: any): Promise<void> {
    // console.log(this.checkboxes);
    // this.checkboxes.forEach((element) => {
    //   console.log(element.nativeElement.value.deviceName);
    // });
    if (e.checked) {
      const { value: text } = await Swal.fire({
        input: 'text',
        inputLabel: 'จำนวนยา',
        inputPlaceholder: '',
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve('');
            } else {
              resolve('Input Value');
            }
          });
        },
      });
      if (text) {
        Swal.fire(`จำนวนยา: ${text}`);
      }
      val.alias = '';
      val.method = '';
      val.type = '';
      val.note = '';
      val.Qyt = `${text}`;
      val.itemNo = this.value2.length + 1;
      this.value.push(val);
      let value = {
        drug: this.value,
      };
      this.value2.push(value);
      console.log(this.value2);
    }
    this.value = [];
  }
  public date_Birth(event: any) {
    const momentDate = new Date(event.value);
    this.dateBirth = moment(momentDate).format('YYYY-MM-DD');
  }
  public datePayment: any = null;
  public date_payment(event: any) {
    const momentDate = new Date(event.value);
    this.datePayment = moment(momentDate).format('YYYY-MM-DD');
  }

  public jsonDrug: any = null;
  public test() {}

  // public async send() {
  //   console.log(this.jsonDrug);
  // }

  public send() {
    this.jsonDrug = {
      outpOrderDispense: {
        patient: {
          patID: this.inputGroup.value.id,
          patName: this.inputGroup.value.name,
          gender: this.inputGroup.value.sex,
          birthday: this.dateBirth,
          age: this.inputGroup.value.age,
          identity: '',
          insuranceNo: '',
          chargeType: '',
        },
        prescriptions: {
          prescription: {
            orderNo: this.inputGroup.value.orderNo,
            ordertype: this.inputGroup.value.orderType,
            pharmacy: this.inputGroup.value.pharmacy,
            windowNo: '',
            paymentIP: '',
            paymentDT: this.datePayment,
            outpNo: '',
            visitNo: '',
            deptCode: '',
            deptName: '',
            doctCode: '',
            doctName: '',
            diagnosis: '',
            drugs: this.value2,
          },
        },
      },
    };
    this.jsonArr.push(this.jsonDrug);
    console.log(this.jsonArr);
    // window.location.reload();
    // this.inputGroup.reset();
    // this.inputGroup.enable();
  }

  unselectedRows: Array<{}> = [];

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: PeriodicElement) =>
          this.selection.select(row)
        );
  }

  public checkDrug = new Array();

  // store() {
  //   setTimeout(async () => {
  //     this.checkDrug = this.selection.selected;
  //     if (this.checkDrug) {
  //       const { value: text } = await Swal.fire({
  //         input: 'text',
  //         inputLabel: 'จำนวนยา',
  //         inputPlaceholder: '',
  //         inputValidator: (value) => {
  //           return new Promise((resolve) => {
  //             if (value) {
  //               resolve('');
  //             } else {
  //               resolve('Input Value');
  //             }
  //           });
  //         },
  //       });
  //       if (text) {
  //         Swal.fire(`จำนวนยา: ${text}`);
  //       }
  //       var obj: any = {};
  //       // this.checkDrug.qty = `${text}`;
  //       // this.checkDrug.push(obj);
  //       // let a = {
  //       //   drug: this.value,
  //       // };
  //       console.log(this.selection.selected);
  //     }
  //     // if (e.currentTarget.checked) {
  //     //   let List = {
  //     //     drug: val,
  //     //   };
  //     //   this.value.push(List);
  //     // }
  //   });
  // }

  someFunction(globalcheckbox: any) {
    console.log(globalcheckbox);
  }
}
