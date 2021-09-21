import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as JsonToXML from 'js2xmlparser';

export interface PeriodicElement {
  Code: string;
  Name: string;
  Spec: string;
  Unit: string;
  firmName: string;
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
    'Unit',
    'firmName',
  ];

  public inputGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl(),
    sex: new FormControl(),
    age: new FormControl(),
    dateB: new FormControl(),
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
  @ViewChild('swiper') swiper!: ElementRef;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
    // const today = new Date();
    // const tomorrow = new Date(today.setDate(today.getDate() + 1));
    // console.log(moment(tomorrow).format('YYYY-MM-DD'));
    // var arrayElements = [1, 2, 3, 4, 2];
    // var arr = [];
    // arrayElements.forEach((element, index) => {
    //   if (element == 2) delete arrayElements[index];
    // });
    // for (let index = 0; index < arrayElements.length; index++) {
    //   if (arrayElements[index] != undefined) {
    //     arr.push(arrayElements[index]);
    //   }
    // }
    // console.log(arr);
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // this.swiper.nativeElement.focus();
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
        Swal.fire(`จำนวนยา: ${text} ${val.unit}`);
      }
      val.alias = '';
      val.method = '';
      val.type = '';
      val.note = '';
      val.Qty = `${text}`;
      val.itemNo = this.value2.length + 1;
      this.value.push(val);
    } else {
      let index = this.value.indexOf(val);
      if (index > -1) {
        this.value.splice(index, 1);
      }
    }
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

  public async send() {
    const momentDate = new Date();
    this.datePayment = moment(momentDate).format('YYYY-MM-DD');
    let numRandom =
      '99' +
      Math.floor(Math.random() * 100000000) +
      '_' +
      Math.floor(Math.random() * 100);

    for (var i = 0; i < this.value.length; i++) {
      let num = i + 1;
      this.value[i].itemNo = num;

      let value = {
        drug: this.value[i],
      };
      this.value2.push(value);
    }
    // this.jsonDrug = {
    //   patient: {
    //     patID: this.inputGroup.value.id,
    //     patName: this.inputGroup.value.name,
    //     gender: this.inputGroup.value.sex,
    //     birthday: this.dateBirth,
    //     age: this.inputGroup.value.age,
    //     identity: '',
    //     insuranceNo: '',
    //     chargeType: '',
    //   },
    //   prescriptions: {
    //     prescription: {
    //       orderNo: numRandom,
    //       ordertype: 'M',
    //       pharmacy: 'OPD',
    //       windowNo: '',
    //       paymentIP: '',
    //       paymentDT: this.datePayment,
    //       outpNo: '3',
    //       visitNo: '',
    //       deptCode: '',
    //       deptName: '',
    //       doctCode: '',
    //       doctName: '',
    //       diagnosis: '',
    //       drugs: this.value2,
    //     },
    //   },
    // };

    this.jsonDrug = {
      patient: {
        patID: '0000',
        patName: 'TEST',
        gender: 'M',
        birthday: '1900-12-12',
        age: '100',
        identity: '',
        insuranceNo: '',
        chargeType: '',
      },
      prescriptions: {
        prescription: {
          orderNo: numRandom,
          ordertype: 'M',
          pharmacy: 'OPD',
          windowNo: '',
          paymentIP: '',
          paymentDT: this.datePayment,
          outpNo: '3',
          visitNo: '',
          deptCode: '',
          deptName: '',
          doctCode: '',
          doctName: '',
          diagnosis: '',
          drugs: this.value2,
        },
      },
    };
    let xmlDrug = JsonToXML.parse('outpOrderDispense', this.jsonDrug);
    // let formData = new FormData();
    // formData.append('xmlDrug', xmlDrug);

    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = xmlDrug;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    // let getData: any = await this.http.post('drugManual', formData);
    // console.log(xmlDrug);
    // let XMLService =
    //   'http://192.168.185.102:8788/axis2/services/DIHPMPFWebservice?wsdl';

    // this.inputGroup.reset();
    // this.inputGroup.enable();
    // if (getData) {
    //   Swal.fire({
    //     position: 'center',
    //     icon: 'success',
    //     title: 'Send information successfully',
    //     showConfirmButton: false,
    //     timer: 1500,
    //   });
    //   this.value2 = [];
    //   window.location.reload();
    // } else {
    //   Swal.fire({
    //     position: 'center',
    //     icon: 'error',
    //     title: 'Failed to submit information',
    //     showConfirmButton: false,
    //     timer: 1500,
    //   });
    //   this.value2 = [];
    // }
    this.value2 = [];
    window.location.reload();
  }

  public sendFail() {}

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

  // async test() {
  //   fetch(`http://` + '192.168.185.160' + `:3000/ELMedStock`)
  //     .then((e) => {
  //       return e.json();
  //     })
  //     .then((e) => {
  //       console.log(e);
  //     });
  // }
}
