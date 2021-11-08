import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
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
  code: string;
  Name: string;
  spec: string;
  unit: string;
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

  selection: any = new SelectionModel<PeriodicElement>(true, []);
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: any;
  public jsonArr = new Array();
  @ViewChildren('checkboxes')
  checkboxes!: QueryList<ElementRef>;

  @ViewChild('name') nameField!: ElementRef;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private _http: HttpClient,
    private renderer: Renderer2
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.dataSource.paginator = this.paginator;
    // }, 1000);
  }

  ngAfterViewInit() {}

  disableClick = false;
  isOpen = false;

  editName(): void {
    this.nameField.nativeElement.focus();
  }
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
  numArr: number = 0;

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

      // val.itemNo = this.value.length + 1;

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
    let codeArrPush = new Array();
    let numDontKnow = Math.floor(Math.random() * 10000);

    // var utf8String = iconv.encode('Sample input string', 'win1251');

    let j = 0;
    let p = 0;
    for (let i = 0; i < this.value.length; i++) {
      let formData = new FormData();
      formData.append('code', this.value[i].code.trim());

      let listDrugSE: any = await this.http.post(
        'SEListStockPrepack',
        formData
      );

      if (listDrugSE.response.rowCount > 0) {
        for (let xx = 0; xx < listDrugSE.response.rowCount; xx++) {
          var se: any = {};
          if (
            this.value[i].Qty >= listDrugSE.response.result[xx].HisPackageRatio
          ) {
            se.code = listDrugSE.response.result[xx].drugCode;
            se.Name = this.value[i].Name;
            se.alias = this.value[i].alias;
            se.firmName = this.value[i].firmName;
            se.method = this.value[i].method;
            se.note = this.value[i].note;
            se.spec = this.value[i].spec;
            se.type = this.value[i].type;
            se.unit = this.value[i].unit;
            se.Qty =
              Math.floor(
                this.value[i].Qty /
                  listDrugSE.response.result[xx].HisPackageRatio
              ) * listDrugSE.response.result[xx].HisPackageRatio;
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugSE.response.result[xx].HisPackageRatio;
            // console.log(this.numArr);
            codeArrPush.push(se);
          }
        }
      }

      let listDrugLCA: any = await this.http.post('listDrugLCA', formData);

      if (listDrugLCA.response.rowCount == 1) {
        if (
          Math.floor(
            this.value[i].Qty / listDrugLCA.response.result[0].packageRatio
          ) *
            listDrugLCA.response.result[0].packageRatio >
          0
        ) {
          var lca: any = {};
          lca.code = listDrugLCA.response.result[0].drugCode;
          lca.Qty =
            Math.floor(
              this.value[i].Qty / listDrugLCA.response.result[0].packageRatio
            ) * listDrugLCA.response.result[0].packageRatio;
          // this.numArr = this.numArr + 1;
          // a.itemNo = this.this.valueue.length + 1;
          lca.Name = this.value[i].Name;
          lca.alias = this.value[i].alias;
          lca.firmName = this.value[i].firmName;
          lca.method = this.value[i].method;
          lca.note = this.value[i].note;
          lca.spec = this.value[i].spec;
          lca.type = this.value[i].type;
          lca.unit = this.value[i].unit;
          // console.log(this.numArr);
          codeArrPush.push(lca);
          this.value[i].Qty =
            this.value[i].Qty % listDrugLCA.response.result[0].packageRatio;
          // if (
          //   this.value[i].Qty % listDrugLCA.response.result[0].packageRatio >
          //   0
          // ) {
          //   this.value[i].Qty =
          //     this.value[i].Qty % listDrugLCA.response.result[0].packageRatio;
          // }
        }
      }

      if (this.value[i].Qty > 0) {
        let getData: any = await this.http.post('checkJV', formData);

        if (getData.response.rowCount == 1) {
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

          //ยาเกิน 400
          //   let jvdata = null;
          //   if (this.value[i].Qty > 400) {
          //     jvdata = this.value[i].Qty % 400;

          //     // this.value[i].Qty = this.value[i].Qty % 400;
          //     let n = null;
          //     let s = 400;
          //     n = this.value[i].Qty;
          //     while (n > 400) {
          //       p++;
          //       n = n - 400;
          //       let dataOver =
          //         this.inputGroup2.value.nameS +
          //         '|' +
          //         this.inputGroup2.value.hnS +
          //         p +
          //         '|' +
          //         numJV +
          //         '|1/1/2020 0:00:00|OPD|||' +
          //         getAge +
          //         '||' +
          //         numDontKnow +
          //         '|I|' +
          //         s +
          //         '|' +
          //         this.value[i].code +
          //         '|' +
          //         this.value[i].Name +
          //         '|' +
          //         dateA +
          //         '|' +
          //         dateA +
          //         '|' +
          //         '00:0' +
          //         j +
          //         '|||โรงพยาบาลมหาราชนครราชสีมา|||' +
          //         numJV +
          //         this.value[i].code +
          //         '|||' +
          //         dateB +
          //         '|' +
          //         dateC +
          //         '|' +
          //         this.inputGroup2.value.hnS +
          //         '||';

          //       codeArrOver.push(dataOver);
          //     }
          //   }

          //   if (jvdata) {
          //     jvdata = jvdata;
          //   } else {
          //     jvdata = this.value[i].Qty;
          //   }
          //   j++;
          //   let data =
          //     this.inputGroup2.value.nameS +
          //     '|' +
          //     this.inputGroup2.value.hnS +
          //     j +
          //     '|' +
          //     numJV +
          //     '|1/1/2020 0:00:00|OPD|||' +
          //     getAge +
          //     '||' +
          //     numDontKnow +
          //     '|I|' +
          //     jvdata +
          //     '|' +
          //     this.value[i].code +
          //     '|' +
          //     this.value[i].Name +
          //     '|' +
          //     dateA +
          //     '|' +
          //     dateA +
          //     '|' +
          //     '00:0' +
          //     j +
          //     '|||โรงพยาบาลมหาราชนครราชสีมา|||' +
          //     numJV +
          //     this.value[i].code +
          //     '|||' +
          //     dateB +
          //     '|' +
          //     dateC +
          //     '|' +
          //     this.inputGroup2.value.hnS +
          //     '||';

          //   codeArr.push(data);
          // }
        }

        // let num = i + 1;
        // this.value[i].itemNo = num;
        codeArrPush.push(this.value[i]);
      }
    }

    for (let index = 0; index < codeArrPush.length; index++) {
      codeArrPush[index].itemNo = index + 1;
      let value = {
        drug: codeArrPush[index],
      };
      this.value2.push(value);
    }

    let DataJV: any = null;
    // let DataJV2: any = null;
    // let DataFinal: any = [];

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

    // let xmlDrug = JsonToXML.parse('outpOrderDispense', this.jsonDrug);
    // let getDataJV: any = null;
    // let getDataDIH: any = null;
    // if (DataJV) {
    //   let dataJv = { data: DataJV };

    //   getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
    // }
    // let dataXml = { data: xmlDrug };
    // getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);

    // if (getDataJV) {
    //   if (getDataJV.connect == true && getDataDIH.connect == true) {
    //     if (getDataJV.response == 1 && getDataDIH.response == 1) {
    //       Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    //       let win: any = window;
    //       win.$('#myModal').modal('hide');
    //     } else if (getDataJV.response == 0 && getDataDIH.response == 0) {
    //       Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    //     }
    //   } else {
    //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //   }
    // } else {
    //   if (getDataDIH.connect == true) {
    //     if (getDataDIH.response == 1) {
    //       Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    //       let win: any = window;
    //       win.$('#myModal').modal('hide');
    //     } else {
    //       Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    //     }
    //   } else {
    //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //   }
    // }

    let win: any = window;
    win.$('#myModal').modal('hide');

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
      nameS: ['', Validators.required],
      sexS: ['M', Validators.required],
      ageS: ['1', Validators.required],
    });
  }

  noDrug() {
    Swal.fire('ไม่มีข้อมูลยา', '', 'error');
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
}
