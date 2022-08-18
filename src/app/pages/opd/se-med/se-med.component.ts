import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  DateAdapter,
  MatDateFormats,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
(pdfMake as any).fonts = {
  THSarabunNew: {
    normal: 'THSarabunNew.ttf',
    bold: 'THSarabunNew-Bold.ttf',
    italics: 'THSarabunNew-Italic.ttf',
    bolditalics: 'THSarabunNew-BoldItalic.ttf',
  },
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

export interface PeriodicElement {
  drugCode: string;
  Name: string;
  Spec: string;
  Quantity: string;
  Maximum: string;
  percenStock: string;
  totalQty: string;
  drugLocation: string;
  Action: string;
}

export interface PeriodicElement2 {
  Code: string;
  Name: string;
  Firmname: string;
  totalQty: string;
}

export const GRI_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    } as Intl.DateTimeFormatOptions,
  },
};

@Component({
  selector: 'app-se-med',
  templateUrl: './se-med.component.html',
  styleUrls: ['./se-med.component.scss'],
})
export class SeMedComponent implements OnInit {
  public dataDrug: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}')
    .role;
  public displayedColumns: string[] = [];

  public displayedColumns2: string[] = ['Code', 'Name', 'Spec', 'totalQty'];
  public displayedColumns3: string[] = ['Code', 'Name', 'Spec'];

  public dataSource!: MatTableDataSource<PeriodicElement>;
  public dataSource2!: MatTableDataSource<PeriodicElement2>;
  public dataSource3: any = null;
  public dataSEDispense: any;
  public dataNOSEDispense: any;
  public Date = new Date();
  public test = null;
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  public startDate: any = null;
  public endDate: any = null;
  public nameStock: any = null;
  public nameSEDispense: any = null;

  @ViewChild('SortT1') SortT1!: MatSort;
  @ViewChild('SortT2') SortT2!: MatSort;
  @ViewChild('SortT3') SortT3!: MatSort;

  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;
  // @ViewChild('testq') testq!: ElementRef;
  typeFilter = new FormControl('');
  filterValues = {
    drugCode: '',
  };

  public clickLo: any = null;
  public inputGroup = new FormGroup({
    location: new FormControl(),
  });

  public inputGroup2 = new FormGroup({
    lotno: new FormControl(),
    expire: new FormControl(),
  });
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    const momentDate = new Date();
    const endDate = moment(momentDate).format('YYYY-MM-DD');
    const startDate = moment(momentDate).format('YYYY-MM-DD');

    this.startDate = startDate;
    this.endDate = endDate;
    this.dateAdapter.setLocale('en-GB');
    setTimeout(async () => {
      await this.getDataSEListStock();
      await this.getDataSEDispense();
      await this.getDataSENODispense();
    }, 0);

    // this.getDataSEListStock();
    // this.getDataSEDispense();
    // this.getDataSENODispense();

    //  console.log(moment(new Date()).format('MM/DD/YYYY HH:mm:ss'));
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.testq.nativeElement.focus();
  //   }, 1000);
  // }

  ngOnInit(): void {}

  public getDataSEListStock = async () => {
    let getData: any = await this.http.get('SEListStock');
    let getDrugOnHand: any = await this.http.get('getDrugOnHand');
    if (this.dataUser == 'admin') {
      this.displayedColumns = [
        'drugCode',
        'Name',
        'Quantity',
        'Maximum',
        'percenStock',
        // 'totalQty',
        'drugLocation',
        'LOT_NO',
        'EXP_Date',

        'amount',
        'active',
        'Action',
      ];
    } else {
      this.displayedColumns = [
        'drugCode',
        'Name',
        'Quantity',
        'Maximum',
        'percenStock',
        // 'totalQty',
        'drugLocation',
        'LOT_NO',
        'EXP_Date',

        'amount',
      ];
    }

    const result = Array.from(
      new Set(
        getDrugOnHand.response.result.map((s: { drugCode: any }) => s.drugCode)
      )
    ).map((lab) => {
      return {
        codeMap: lab,
        LOT_NO: getDrugOnHand.response.result
          .filter((s: { drugCode: any }) => s.drugCode === lab)
          .map((edition: { LOT_NO: any }) => edition.LOT_NO),
        EXP_Date: getDrugOnHand.response.result
          .filter((s: { drugCode: any }) => s.drugCode === lab)
          .map((edition: { EXP_Date: any }) => edition.EXP_Date),
        amount: getDrugOnHand.response.result
          .filter((s: { drugCode: any }) => s.drugCode === lab)
          .map((edition: { amount: any }) => edition.amount),
      };
    });

    var finalVal = getData.response.result.map(function (emp: {
      codeMap: any;
    }) {
      return {
        ...emp,
        ...(result.find(
          (item: { codeMap: any }) => item.codeMap === emp.codeMap
        ) ?? { LOT_NO: [], EXP_Date: [], amount: [] }),
      };
    });

    const endDate = moment(new Date()).format('DD/MM/YYYY');
    this.nameStock = 'SE-Med Stock' + '(' + endDate + ')';

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = finalVal;

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

  public getDataPrepack = async (e: any) => {
    if (e == 'All') {
      this.getDataSEListStock();
    } else {
      const endDate = moment(new Date()).format('DD/MM/YYYY');
      if (e == 'Y') {
        this.nameStock = 'SE-Med Prepack' + '(' + endDate + ')';
      } else if (e == 'N') {
        this.nameStock = 'SE-Med Main Drug' + '(' + endDate + ')';
      }

      let formData = new FormData();
      formData.append('prepack', e);
      let getData: any = await this.http.post('SEPrepack', formData);
      let getDrugOnHand: any = await this.http.get('getDrugOnHand');
      const result = Array.from(
        new Set(
          getDrugOnHand.response.result.map(
            (s: { drugCode: any }) => s.drugCode
          )
        )
      ).map((lab) => {
        return {
          codeMap: lab,
          LOT_NO: getDrugOnHand.response.result
            .filter((s: { drugCode: any }) => s.drugCode === lab)
            .map((edition: { LOT_NO: any }) => edition.LOT_NO),
          EXP_Date: getDrugOnHand.response.result
            .filter((s: { drugCode: any }) => s.drugCode === lab)
            .map((edition: { EXP_Date: any }) => edition.EXP_Date),
          amount: getDrugOnHand.response.result
            .filter((s: { drugCode: any }) => s.drugCode === lab)
            .map((edition: { amount: any }) => edition.amount),
        };
      });

      var finalVal = getData.response.result.map(function (emp: {
        codeMap: any;
      }) {
        return {
          ...emp,
          ...(result.find(
            (item: { codeMap: any }) => item.codeMap === emp.codeMap
          ) ?? { LOT_NO: [], EXP_Date: [], amount: [] }),
        };
      });

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = finalVal;

          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.SortT1;
          this.dataSource.paginator = this.paginator;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  };

  public getDataActive = async (e: any) => {
    if (e == 'All') {
      this.getDataSEListStock();
    } else {
      let formData = new FormData();
      formData.append('data', e);
      let getData: any = await this.http.post('SEActive', formData);

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
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public getDataSEDispense = async () => {
    this.nameSEDispense =
      'SEDispense' +
      '(' +
      String(this.startDate) +
      '-' +
      String(this.endDate) +
      ')';
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
  nameNOSEDispense: any = null;
  public getDataSENODispense = async () => {
    const momentDate = new Date();

    this.nameNOSEDispense =
      'SENODispense' +
      '(' +
      String(this.startDate) +
      '-' +
      String(this.endDate) +
      ')';
    let formData = new FormData();
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);
    let getData: any = await this.http.post('SENODispense', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataNOSEDispense = getData.response.result;

        this.dataSource3 = new MatTableDataSource(this.dataNOSEDispense);
        this.dataSource3.sort = this.SortT3;
        this.dataSource3.paginator = this.paginator3;
      } else {
        this.dataNOSEDispense = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public PrepackDispense = async (e: any) => {
    if (e == 'All') {
      this.getDataSEDispense();
    } else {
      const endDate = moment(new Date()).format('DD/MM/YYYY');
      if (e == 'Y') {
        this.nameSEDispense = 'Dispense Prepack' + '(' + endDate + ')';
      } else if (e == 'N') {
        this.nameSEDispense = 'Dispense Main Drug' + '(' + endDate + ')';
      }

      let formData = new FormData();
      formData.append('prepack', e);
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
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  };

  public PrepackNODispense = async (e: any) => {
    if (e == 'All') {
      this.getDataSENODispense();
    } else {
      const endDate = moment(new Date()).format('DD/MM/YYYY');
      if (e == 'Y') {
        this.nameNOSEDispense = 'Dispense Prepack' + '(' + endDate + ')';
      } else if (e == 'N') {
        this.nameNOSEDispense = 'Dispense Main Drug' + '(' + endDate + ')';
      }

      let formData = new FormData();
      formData.append('prepack', e);
      formData.append('startDate', this.startDate);
      formData.append('endDate', this.endDate);
      let getData: any = await this.http.post('SENODispense', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataNOSEDispense = getData.response.result;

          this.dataSource3 = new MatTableDataSource(this.dataNOSEDispense);
          this.dataSource3.sort = this.SortT3;
          this.dataSource3.paginator = this.paginator3;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  };
  public start_date: any = null;
  public startChange(event: any) {
    this.nameSEDispense = null;
    const momentDate = new Date(event.value);
    this.startDate = moment(momentDate).format('YYYY-MM-DD');
    const start_Date = moment(momentDate).format('DD/MM/YYYY');
    this.start_date = 'SEDispense' + '(' + String(start_Date);
  }

  public async endChange(event: any) {
    const momentDate = new Date(event.value);
    const end_Date = moment(momentDate).format('DD/MM/YYYY');
    this.nameSEDispense = this.start_date + '-' + String(end_Date) + ')';
    this.nameNOSEDispense = this.start_date + '-' + String(end_Date) + ')';
    this.endDate = moment(momentDate).format('YYYY-MM-DD');
    this.getDataSEDispense();
    this.getDataSENODispense();
    // let formData = new FormData();
    // formData.append('startDate', this.startDate);
    // formData.append('endDate', this.endDate);

    // let getData: any = await this.http.post('SEDispense', formData);

    // if (getData.connect) {
    //   if (getData.response.rowCount > 0) {
    //     this.dataSEDispense = getData.response.result;
    //     this.dataSource2 = new MatTableDataSource(this.dataSEDispense);
    //     this.dataSource2.sort = this.SortT2;
    //     this.dataSource2.paginator = this.paginator2;
    //   } else {
    //     this.dataSEDispense = null;
    //   }
    // } else {
    //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    // }
  }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }
  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
  }
  applyFilterType(filterValue: string) {
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  public expression: any = null;
  async clickData(i: any) {
    this.expression = 1;
    this.inputGroup = this.formBuilder.group({
      location: [i.drugLocation, Validators.required],
      code: [i.drugCode],
    });
  }
  public dataDrugEdit: any = null;
  public async updateData() {
    let formData = new FormData();
    formData.append('drugLocation', this.inputGroup.value.location);
    formData.append('drugCode', this.inputGroup.value.code);
    // formData.forEach((value, key) => {
    //   console.log(key + '=' + value);
    // });
    let getData: any = await this.http.post('updateXLocat', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let win: any = window;
        win.$('#edit').modal('hide');
        Swal.fire('แก้ไขข้อมูลเสร็จสิ้น', '', 'success');
        this.getDataSEListStock();
      } else {
        Swal.fire('แก้ไขข้อมูลไม่สำเร็จ', '', 'error');
        this.dataDrugEdit = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public detailDrug: any = null;
  async clickDataDrug(i: any) {
    this.detailDrug = i;
    this.expression = 2;
    this.inputGroup2 = this.formBuilder.group({
      lotno: ['', Validators.required],
      expire: [new Date(), Validators.required],
    });
  }
  public printPDF() {
    const start_Date = moment(new Date()).format('DD/MM/YYYY');
    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const expire_Date = moment(date).format('DD/MM/YYYY');
    let a = '';
    if (this.inputGroup2.value.expire) {
      a = moment(this.inputGroup2.value.expire).format('DD/MM/YYYY');
    } else {
      a = expire_Date;
    }
    var docDefinition = {
      pageSize: { width: 325, height: 350 },
      pageMargins: [5, 100, 1, 1] as any,
      header: {} as any,

      content: [
        this.detailDrug.Name,
        'Spec : ' + this.detailDrug.Spec,
        {
          alignment: 'justify',
          columns: [
            {
              text:
                'Lot No. : ' +
                this.inputGroup2.value.lotno +
                '\nMfd. : ' +
                start_Date +
                ' \nExp. : ' +
                a,
              fontSize: 15,
              margin: [0, 5, 0, 0],
            },
            { qr: this.detailDrug.drugCode, fit: '80', margin: [0, 0, 0, 0] },
          ],
        },
      ],

      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 20,
        bold: true,
      },
    };
    pdfMake.createPdf(docDefinition).open();
    let win: any = window;
    win.$('#edit').modal('hide');
  }

  public changeActive(data: any) {
    Swal.fire({
      title: 'Change Status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let st = '';
        if (data.active == 'Y') {
          st = 'N';
        } else {
          st = 'Y';
        }

        let formData = new FormData();
        formData.append('active', st);
        formData.append('drugCode', data.drugCode);
        // formData.forEach((value, key) => {
        //   console.log(key + '=' + value);
        // });
        let getData: any = await this.http.post('updateActive', formData);

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            await this.getDataSEListStock();
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Your work has been saved',
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            Swal.fire('error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }
}
