import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as JsonToXML from 'js2xmlparser';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { utf8Encode } from '@angular/compiler/src/util';
// var iconv = require('iconv-lite');
// const Buffer = require('Buffer');
// import * as iconv from 'iconv-lite';

// import * as Buffer from 'Buffer';
// import * as iconv from 'iconv-lite';
// var request = require('request');

export interface PeriodicElement {
  Code: string;
  Name: string;
  Spec: string;
  Unit: string;
  firmName: string;
}

export interface Data {
  data: string;
}

@Component({
  selector: 'app-atms',
  templateUrl: './sent-drug.component.html',
  styleUrls: ['./sent-drug.component.scss'],
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
    private dateAdapter: DateAdapter<Date>,
    private _http: HttpClient
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // this.swiper.nativeElement.focus();
  }

  disableClick = false;
  isOpen = false;

  public getData = async () => {
    let getData: any = await this.http.get('dataDrug');
    // let getData2: any = await this.http.get('jvmExpire');
    // console.log(getData2);
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
        allowOutsideClick: false,
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
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `จำนวนยา: ${text} ${val.unit}`,
          showConfirmButton: false,
          timer: 850,
        });
      }
      val.alias = '';
      val.method = '';
      val.type = '';
      val.note = '';
      val.Qty = `${text}`;
      val.itemNo = this.value2.length + 1;
      let formData = new FormData();
      formData.append('code', val.code.trim());
      let listDrugLCA: any = await this.http.post('listDrugLCA', formData);
      // console.log(listDrugLCA);
      if (listDrugLCA.response.rowCount == 1) {
        if (val.Qty >= listDrugLCA.response.result[0].packageRatio) {
        }
      }
      this.value.push(val);
    } else {
      let index = this.value.indexOf(val);
      if (index > -1) {
        this.value.splice(index, 1);
      }
    }
    // console.log(this.value);
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
  selected = '';

  public async send() {
    const momentDate = new Date();
    this.datePayment = moment(momentDate).format('YYYY-MM-DD');
    let dateA = moment(momentDate).format('YYMMDD');
    let dateB = moment(momentDate).format('DD/MM/YYYY');
    let numRandom =
      '99' +
      Math.floor(Math.random() * 100000000) +
      '_' +
      Math.floor(Math.random() * 100);

    let numJV = '6400' + Math.floor(Math.random() * 1000000);
    let getAge = new Date().getFullYear() - 2020;
    let codeArr = new Array();
    let numDontKnow = Math.floor(Math.random() * 10000);

    // var utf8String = iconv.encode('Sample input string', 'win1251');

    let j = 0;
    for (var i = 0; i < this.value.length; i++) {
      let formData = new FormData();
      formData.append('code', this.value[i].code.trim());
      let getData: any = await this.http.post('checkJV', formData);

      if (getData.response.rowCount == 1) {
        formData.append('code', this.value[i].code.trim());
        let getData2: any = await this.http.post('jvmExpire', formData);

        let dateC = null;
        let date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        // let dateC = moment(date).format('DD/MM/YYYY');
        if (getData2.response.result[0].ExpiredDate) {
          dateC = moment(getData2.response.result[0].ExpiredDate).format(
            'DD/MM/YYYY'
          );
        } else {
          dateC = moment(date).format('DD/MM/YYYY');
        }

        j++;
        // if (this.value[i].Qty > 400) {
        //   let n = null;
        //   n = this.value[i].Qty / 400;
        // }
        //
        let data =
          this.inputGroup2.value.nameS +
          '|' +
          this.inputGroup2.value.hnS +
          j +
          '|' +
          numJV +
          '|1/1/2020 0:00:00|OPD|||' +
          getAge +
          '||' +
          numDontKnow +
          '|I|' +
          this.value[i].Qty +
          '|' +
          this.value[i].code +
          '|' +
          this.value[i].Name +
          '|' +
          dateA +
          '|' +
          dateA +
          '|' +
          '00:0' +
          j +
          '|||โรงพยาบาลมหาราชนครราชสีมา|||' +
          numJV +
          this.value[i].code +
          '|||' +
          dateB +
          '|' +
          dateC +
          '|' +
          this.inputGroup2.value.hnS +
          '||';

        codeArr.push(data);
      }
      this.value[i].code;
      let num = i + 1;
      this.value[i].itemNo = num;

      let value = {
        drug: this.value[i],
      };
      this.value2.push(value);
    }
    // console.log(this.value2);
    let DataJV = null;

    if (codeArr.join('\r\n') != '') {
      DataJV = codeArr.join('\r\n');
    }

    this.jsonDrug = {
      patient: {
        patID: this.inputGroup2.value.hnS,
        patName: this.inputGroup2.value.nameS,
        gender: this.inputGroup2.value.sexS,
        birthday: '2020-01-01',
        age: this.inputGroup2.value.ageS,
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
    let getDataJV: any = null;
    let getDataDIH: any = null;
    if (DataJV) {
      let dataJv = { data: DataJV };

      getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
    }
    let dataXml = { data: xmlDrug };
    getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);

    if (getDataJV) {
      if (getDataJV.connect == true && getDataDIH.connect == true) {
        if (getDataJV.response == 1 && getDataDIH.response == 1) {
          Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
          let win: any = window;
          win.$('#myModal').modal('hide');
        } else if (getDataJV.response == 0 && getDataDIH.response == 0) {
          Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      }
    } else {
      if (getDataDIH.connect == true) {
        if (getDataDIH.response == 1) {
          Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
          let win: any = window;
          win.$('#myModal').modal('hide');
        } else {
          Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      }
    }

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
    this.value2 = [];
    this.value = [];
    this.datePayment = null;

    this.getData();
    this.selected = '';

    // window.location.reload();
  }

  public inputGroup2 = new FormGroup({
    hnS: new FormControl(),
    nameS: new FormControl(),
    sexS: new FormControl(),
    ageS: new FormControl(),
  });

  edit() {
    this.inputGroup2 = this.formBuilder.group({
      hnS: ['0000', Validators.required],
      nameS: ['TEST', Validators.required],
      sexS: ['M', Validators.required],
      ageS: ['1', Validators.required],
    });
  }

  noDrug() {
    Swal.fire('ไม่มีข้อมูลยา', '', 'error');
  }
}
