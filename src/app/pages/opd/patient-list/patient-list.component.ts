import { stringify } from 'querystring';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
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
import { Gallery } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';
import { interval, Subscription } from 'rxjs';
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

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit, AfterViewInit {
  public Date = new Date();
  public dataPharmacist: any = null;

  public startDate: any = null;
  public endDate: any = null;
  public hnPatient: any = null;
  public dataSource: any = null;
  public displayedColumns: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  public select: any = '';
  public checkprint: boolean = false;
  @ViewChild('input') input!: ElementRef;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  public dataDrug = new Array();
  nameFilter = new FormControl('');
  idFilter = new FormControl('');
  filterValues = {
    patientNO: '',
    check: '',
  };

  date1 = new FormControl(new Date());
  // @ViewChild('swiper') swiper!: ElementRef;
  private updateSubscription!: Subscription;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    public gallery: Gallery,
    public lightbox: Lightbox
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 100);
  }

  ngOnInit(): void {
    this.updateSubscription = interval(300000).subscribe((val) => {
      this.getData();
      this.nameFilter.setValue('');
      this.idFilter.setValue('');
    });

    this.idFilter.valueChanges.subscribe((patientNO) => {
      this.filterValues.patientNO = patientNO.trim();
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.nameFilter.valueChanges.subscribe((check) => {
      this.filterValues.check = check;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
  }

  ngOnDestroy() {
    this.updateSubscription.unsubscribe();
  }

  setFocus() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 300);
  }

  public getData = async () => {
    if (this.select) {
      this.displayedColumns = [
        'patientNO',
        'QN',
        'patientName',
        'createDT',
        'druglist',
        // 'check',
        'timestamp',
      ];
      let getData: any = null;
      let formData = new FormData();
      let dataPatient: any = null;
      if (this.select == 'W8' || this.select == 'W18') {
        formData.append('floor', this.select == 'W8' ? '2' : '3');
        formData.append('date', moment(this.date1.value).format('YYYY-MM-DD'));
        getData = await this.http.post('listPatientQpost', formData);
        dataPatient = getData.response.result;
      } else {
        formData.append('floor', this.select);
        formData.append(
          'date',
          moment(this.date1.value).add(543, 'year').format('YYYYMMDD')
        );
        getData = await this.http.post('getdatapatientFloor', formData);
        // let getData2: any = await this.http.post('statusyHomc', formData);
        let getData3: any = await this.http.post(
          'checkdrugAllergyHomc',
          formData
        );

        dataPatient = getData.response.result.map(function (emp: {
          patientNO: any;
        }) {
          return {
            ...emp,
            ...(getData3.response[0].result.find(
              (item: { patientNO: any }) =>
                item.patientNO.trim() === emp.patientNO.trim()
            ) ?? { status: 'N' }),
            ...(getData3.response[1].result.find(
              (item: { patientID: any }) =>
                item.patientID.trim() === emp.patientNO.trim()
            ) ?? { check: '' }),
          };
        });
      }

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataSource = new MatTableDataSource(dataPatient);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = this.createFilter();
          setTimeout(() => {
            this.input.nativeElement.focus();
          }, 100);
          this.nameFilter.setValue('');
          this.idFilter.setValue('');
          this.setFocus();
        } else {
          this.dataSource = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }

    // }
  };

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      if (!data.check) {
        data.check = 'N';
      }

      return (
        data.patientNO.toLowerCase().indexOf(searchTerms.patientNO) !== -1 &&
        data.check.indexOf(searchTerms.check) !== -1
      );
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    };
    return filterFunction;
  }
  errPatientName: any = {};
  drugPatient: any = null;
  namePhar = '';
  checkW: any = null;
  listDrug = async (val: any) => {
    this.hncut = null;
    this.dataP = {};
    this.dataDrug = [];
    this.datatime = null;
    this.checkdrug = null;

    this.datatime = val.timestamp;
    this.checkdrug = val.check;
    this.checkW =
      this.select === 'W9' ? false : this.select === 'W19' ? false : true;
    // this.errPatientName = val;
    if (!val.cid) {
      let formData = new FormData();
      formData.append('hn', val.patientNO);
      let get_cid: any = await this.http.post('patient_contract', formData);

      if (get_cid.connect) {
        if (get_cid.response.rowCount > 0) {
          val.cid = get_cid.response.result[0].cid;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }

    this.dataP = val;
    if (this.dataP) {
      let formData = new FormData();
      formData.append('cid', val.cid);
      let drug_allergic: any = await this.http.post('drug_allergic', formData);

      if (drug_allergic.connect) {
        if (drug_allergic.response.rowCount > 0) {
          this.dataDrug = drug_allergic.response.result;
        } else {
          this.dataDrug = [];
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else {
      this.dataDrug = [];
    }

    let formData = new FormData();
    formData.append('hn', val.patientNO);
    formData.append(
      'date',
      moment(this.date1.value).add(543, 'year').format('YYYYMMDD')
    );
    formData.append('queue', val.QN);
    formData.append('floor', this.select);
    let getData: any = await this.http.post('getdrugHomcFloor', formData);
    let getData2: any = await this.http.post('get_moph_confirm', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.drugPatient = getData.response.result;
        if (getData2.response.result.length) {
          this.namePhar = getData2.response.result[0].name;
        }

        let win: any = window;
        win.$('#exampleModal').modal('show');
      } else {
        this.drugPatient = null;
        let win: any = window;
        win.$('#exampleModal').modal('show');
        Swal.fire('ไม่มีข้อมูลใบสั่งยา!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  dataP: any = {};
  datatime: any = null;
  checkdrug: any = null;

  async confirm() {
    Swal.fire({
      title: 'Are you sure?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('queue', this.dataP.QN);
        formData.append('hn', this.dataP.patientNO);
        formData.append('user', this.dataUser.user);
        formData.append('name', this.dataUser.name);
        let getData: any = await this.http.post('add_moph_confirm', formData);
        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            this.getData();
            let win: any = window;
            win.$('#exampleModal').modal('hide');
            Swal.fire({
              icon: 'success',
              title: 'การยืนยันเสร็จสิ้น',
              showConfirmButton: false,
              timer: 1500,
            });
            this.dataDrug = [];
            this.dataP = null;
            this.nameFilter.setValue('');
            this.idFilter.setValue('');
            this.setFocus();
          } else {
            Swal.fire('การยืนยันข้อมูลไม่สำเร็จ', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }

  async cutDispend(val: any) {
    const { value: formValues } = await Swal.fire({
      title: 'จำนวนตัดจ่าย',
      input: 'text',
      inputAttributes: {
        input: 'number',
        required: 'true',
      },
      preConfirm: (value) => {
        if (Number(value) < Number(val.qty) && Number(value) >= 0) {
          return [value];
        } else {
          Swal.showValidationMessage('Invalid number');
          return undefined;
        }
      },
    });

    if (formValues) {
      let balanceamount = Number(val.qty) - Number(formValues[0]);
      val.balanceamount = balanceamount;
      val.formValues = formValues[0];
      if (this.checkprint) {
        let dataprint = { ...val, ...this.dataP, ...this.dataUser };
        dataprint.balanceamount = balanceamount;

        this.printPDF(dataprint).then((dataPDF) => {
          dataPDF.getBase64(async (buffer) => {
            let getData: any = await this.http.Printjs('convertbuffer', {
              data: buffer,
              name: 'testpdf' + '.pdf',
              ip: this.dataUser.print_ip,
              printName: this.dataUser.print_name,
              hn: this.dataP.patientNO,
            });
            if (getData.connect) {
              if (getData.response.connect === 'success') {
                this.insertCutdispend(val);
              } else {
                Swal.fire(
                  'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
                  '',
                  'error'
                );
              }
            } else {
              Swal.fire('ไม่สามารถสร้างไฟล์ PDF ได้!', '', 'error');
            }
          });
        });
      } else {
        this.insertCutdispend(val);
      }
    }
  }

  async insertCutdispend(data: any) {
    let formData = new FormData();
    formData.append('drugcode', data.drugCode);
    formData.append('drugname', data.drugName);
    formData.append('phar', this.dataUser.user);
    formData.append('hn', this.dataP.patientNO);
    formData.append('cutamount', data.formValues);
    formData.append('realamount', data.qty);
    formData.append('balanceamount', data.balanceamount);
    formData.append('departmentcode', this.select);
    let getData: any = await this.http.post('insertCutDispendDrug', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        Swal.fire({
          icon: 'success',
          title: `ตัดจ่ายยา ${data.drugName}\n เสร็จสิ้น`,
          showConfirmButton: false,
          timer: 2000,
        });
        this.getData();
      } else {
        Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  drugcut: any = null;
  hncut: any = null;

  async drugCut(data: any) {
    this.hncut = null;
    this.dataP = {};
    this.dataDrug = [];
    this.datatime = null;
    this.checkdrug = null;

    this.hncut = data.patientNO;
    let formData = new FormData();

    formData.append('hn', data.patientNO);
    let getData: any = await this.http.post('getCutDispendDrug', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        const result = Array.from(
          new Set(getData.response.result.map((s: { id: any }) => s.id))
        ).map((lab) => {
          return {
            id: lab,
            id2: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { id2: any }) => edition.id2),
            amount: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { amount: any }) => edition.amount),
            phar2: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { phar2: any }) => edition.phar2),
            phar2_name: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { phar2_name: any }) => edition.phar2_name),
            datetime: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { datetime: any }) => edition.datetime),
          };
        });

        let dataOwe = getData.response.result;
        dataOwe = dataOwe.filter(
          (value: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.id === value.id)
        );

        dataOwe.forEach((element: any) => {
          delete element['id2'];
          delete element['amount'];
          delete element['phar2'];
          delete element['phar2_name'];
          delete element['datetime'];
        });

        this.drugcut = dataOwe.map(function (emp: { id: any }) {
          return {
            ...emp,
            ...(result.find((item: { id: any }) => item.id === emp.id) ?? {
              id2: [],
              amount: [],
              phar2: [],
              phar2_name: [],
              datetime: [],
            }),
          };
        });
        let win: any = window;
        win.$('#modal_owe').modal('show');
      } else {
        this.drugcut = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  async dispendDrug(data: any) {
    const { value: formValues } = await Swal.fire({
      title: 'จำนวนจ่ายยา',
      input: 'text',
      inputAttributes: {
        input: 'number',
        required: 'true',
      },
      preConfirm: (value) => {
        if (
          Number(data.balanceamount) - Number(value) >= 0 &&
          Number(value) > 0
        ) {
          return [value];
        } else {
          Swal.showValidationMessage('Invalid number');
          return undefined;
        }
      },
    });

    if (formValues) {
      data.balanceamount = Number(data.balanceamount) - Number(formValues[0]);

      if (data.balanceamount === 0) {
        await this.updatedispendDrug(data, formValues);
        await this.getData();
        let win: any = window;
        this.nameFilter.setValue('');
        this.idFilter.setValue('');
        this.setFocus();
        win.$('#modal_owe').modal('hide');
      } else {
        if (this.checkprint) {
          let dataprint = { ...data, ...this.dataP, ...this.dataUser };

          this.printPDF(dataprint).then(async (dataPDF) => {
            dataPDF.getBase64(async (buffer) => {
              let getData: any = await this.http.Printjs('convertbuffer', {
                data: buffer,
                name: 'testpdf' + '.pdf',
                ip: this.dataUser.print_ip,
                printName: this.dataUser.print_name,
                hn: this.dataP.patientNO,
              });
              if (getData.connect) {
                if (getData.response.connect === 'success') {
                  await this.updatedispendDrug(data, formValues[0]);
                  await this.drugCut({ patientNO: this.hncut });
                } else {
                  Swal.fire(
                    'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
                    '',
                    'error'
                  );
                }
              } else {
                Swal.fire('ไม่สามารถสร้างไฟล์ PDF ได้!', '', 'error');
              }
            });
          });
        } else {
          await this.updatedispendDrug(data, formValues[0]);
          await this.drugCut({ patientNO: this.hncut });
        }
      }
    }
  }

  async updatedispendDrug(data: any, formValues: any) {
    let formData = new FormData();
    formData.append('cdd_id', data.id);
    formData.append('phar', this.dataUser.user);
    formData.append('balanceamount', data.balanceamount);
    formData.append('amount', String(formValues));

    let getData: any = await this.http.post('insertCutDispendOwe', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getData2: any = await this.http.post(
          'updateCutDispendDrug',
          formData
        );

        if (getData2.connect) {
          if (getData2.response.rowCount > 0) {
            Swal.fire({
              icon: 'success',
              title:
                data.balanceamount === 0
                  ? `ตัดจ่ายยา ${data.drugname}\n เสร็จสิ้น`
                  : `ตัดจ่ายยา ${data.drugname}\n คงเหลือ ${data.balanceamount}`,
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  async deleteCutdrug(val: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('id', val.id);

        let getData: any = await this.http.post(
          'deleteCutDispendDrug',
          formData
        );

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            this.drugCut({ patientNO: this.hncut });

            if (this.drugcut.length === 1) {
              this.getData();
              let win: any = window;
              win.$('#modal_owe').modal('hide');
            }
            Swal.fire({
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ',
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }
  displayedColumns2: any = null;
  dataSource2: any = null;
  public campaignOne = new FormGroup({
    // start: new FormControl(
    //   new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
    // ),
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  nameExcel2 = '';
  @ViewChild('input2') input2!: ElementRef;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  public getReport = async () => {
    this.displayedColumns2 = [
      'hn',
      'patientName',
      'checker_name',
      'floor',
      'drugcode',
      'drugname',
      'realamount',
      'cutamount',
      'status',
      'createdDT',
      'relativePhone',
      'relativeAddress',
    ];
    let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
    let formData = new FormData();
    formData.append('start', datestart);
    formData.append('end', dateend);
    formData.append('floor', this.select);
    let getData: any = await this.http.post('getReportcutdispend', formData);

    let nameArray = [
      ...new Set(getData.response.result.map((val: any) => val.hn.trim())),
    ];
    formData.append('data', JSON.stringify(nameArray));
    let getData2: any = await this.http.post('getTelHomc', formData);

    let arr2 = getData2.response.result;
    let arr1 = getData.response.result;
    let result = arr1.map((v: any) => ({
      ...v,
      ...arr2.find(
        (sp: any) =>
          sp.hn.trim() == v.hn.trim() ?? {
            relativeAddress: '',
            relativePhone: '',
            patientName: '',
          }
      ),
    }));

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataSource2 = new MatTableDataSource(result);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
        this.nameExcel2 = `รายงานตัดจ่ายยา ${datestart}_${dateend}`;
        setTimeout(() => {
          this.input2.nativeElement.focus();
        }, 100);
      } else {
        this.dataSource2 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public endChange(event: any) {
    if (event.value) {
      if (this.getTab == 1) {
        this.getReport();
      } else {
        this.getMoph();
      }
    }
  }
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  getTab: any = null;

  onTabChange(e: any) {
    this.getTab = e;
    this.getTab === 0
      ? this.getData()
      : this.getTab === 1
      ? this.getReport()
      : this.getMoph();
  }

  async deleteCutowe(dcc_id: any, val: any, amount: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('id', val);

        let getData: any = await this.http.post(
          'deleteCutDispendOwe',
          formData
        );

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            formData.append('cdd_id', dcc_id);
            formData.append('balanceamount', amount);

            let getData2: any = await this.http.post(
              'updateCutDispendDrugOwe',
              formData
            );

            if (getData2.connect) {
              if (getData2.response.rowCount > 0) {
                this.drugCut({ patientNO: this.hncut });

                Swal.fire({
                  icon: 'success',
                  title: 'ลบข้อมูลสำเร็จ',
                  showConfirmButton: false,
                  timer: 1500,
                });
              } else {
                Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
              }
            } else {
              Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
          } else {
            Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }

  displayedColumns3: any = null;
  dataSource3: any = null;
  nameExcel3 = '';
  @ViewChild('input3') input3!: ElementRef;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;
  public getMoph = async () => {
    this.displayedColumns3 = [
      'user',
      'name',
      'queue',
      'hn',
      'patientName',
      'timestamp',
    ];
    let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
    let formData = new FormData();
    formData.append('start', datestart);
    formData.append('end', dateend);

    let getData: any = await this.http.post('get_moph_report', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataSource3 = new MatTableDataSource(getData.response.result);
        this.dataSource3.sort = this.sort3;
        this.dataSource3.paginator = this.paginator3;
        this.nameExcel3 = `รายงานยืนยันแพ้ยา ${datestart}_${dateend}`;
        setTimeout(() => {
          this.input3.nativeElement.focus();
        }, 100);
      } else {
        this.dataSource3 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
  }

  cancleAllergy(x: any, val: any, cid: any) {
    Swal.fire({
      title: 'Do you want to save the changes?',

      showCancelButton: true,
      confirmButtonText: 'Save',
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('drugcode', val.drugcode);
        formData.append('cid', cid);
        formData.append('phar', this.dataUser.user);

        let getData: any = await this.http.post('cancle_allergy', formData);

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            this.dataDrug[x].status_cancle = 'Y';

            Swal.fire({
              icon: 'success',
              title: 'ยกเลิกแพ้ยาสำเร็จ',
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            Swal.fire('ไม่สามารถยกเลิกแพ้ยาได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }

  changeFloor() {
    this.getData();
  }
  changeFloorReport() {
    this.getReport();
  }

  async printPDF(data: any) {
    let numHN = data.patientNO ? data.patientNO : data.hn;

    let formData = new FormData();
    formData.append('hn', numHN);
    formData.append('floor', this.select);
    let getData: any = await this.http.post('getSiteTel', formData);

    let namePatient = getData.response[0].result[0].name_patient;

    if (namePatient.length > 25) {
      namePatient = namePatient.substring(0, 22);
      namePatient = namePatient + '...';
    }
    let date = '';
    if (data.createdDT) {
      date = moment(data.createdDT)
        .add(543, 'year')
        .format('DD/MM/YYYY HH:mm:ss');
    } else {
      date = moment(new Date()).add(543, 'year').format('DD/MM/YYYY HH:mm:ss');
    }

    var docDefinition = {
      // pageSize: { width: 325, height: 350 },
      pageSize: { width: 238, height: 255 },
      // pageMargins: [5, 50, 5, 100] as any,
      pageMargins: [0, 0, 10, 0] as any,
      header: {} as any,

      content: [
        {
          text: 'ค้างจ่ายยา',
          alignment: 'center',
          decoration: 'underline',
          fontSize: 18,
          bold: true,
        },
        {
          text: `ชื่อ ${namePatient}  HN ${numHN}`,

          fontSize: 18,
          bold: true,
        },
        {},
        {
          columns: [
            {
              width: 150,
              text: `${data.drugName ? data.drugName : data.drugname}`,
            },
            {
              width: '*',
              text: `#${
                data.balanceamount +
                ' ' +
                (data.unit ? data.unit.trim() : data.miniUnit.trim())
              }`,
              alignment: 'right',
            },
          ],
          fontSize: 18,
          bold: true,
        },
        {},
        {
          text: `รับยาที่ ${getData.response[1].result[0].site_name.trim()}`,

          fontSize: 16,
          bold: true,
        },
        {
          text: `โทร ${getData.response[1].result[0].site_tel}`,

          fontSize: 16,
          bold: true,
        },
        {
          text: `เภสัชกร ${data.name || data.phar_name}`,

          fontSize: 16,
        },
        {
          text: `วันที่ค้างยา ${date} น.`,

          fontSize: 16,
        },
      ] as any,

      defaultStyle: {
        font: 'THSarabunNew',
      },
    };
    pdfMake.createPdf(docDefinition).open();
    const pdfDocGenerator = await pdfMake.createPdf(docDefinition);

    return pdfDocGenerator;
    // let result: any = await pdfDocGenerator.getBase64(async (buffer) => {
    //   return buffer;
    //   // let getData: any = await this.http.testPrintjs('convertbuffer', {
    //   //   data: buffer,
    //   //   name: 'testpdf' + '.pdf',
    //   // });
    //   // console.log(getData.response.connect);
    //   // return getData.response.connect;
    //   // // if (getData.connect) {
    //   // //   if (getData.response.connect === 'success') {
    //   // //     console.log(getData.response.connect);
    //   // //     return 1234;
    //   // //   } else {
    //   // //     return 'error';
    //   // //   }
    //   // // } else {
    //   // //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!', '', 'error');
    //   // //   return 'error';
    //   // // }
    // });

    // pdfMake.createPdf(docDefinition).open();
  }

  sendprint(val: any) {
    val.phar_name = val.phar2_name[0]
      ? val.phar2_name[val.phar2_name.length - 1]
      : val.phar_name;
    this.printPDF(val).then((dataPDF) => {
      dataPDF.getBase64(async (buffer) => {
        let getData: any = await this.http.Printjs('convertbuffer', {
          data: buffer,
          name: 'testpdf' + '.pdf',
          ip: this.dataUser.print_ip,
          printName: this.dataUser.print_name,
          hn: val.hn,
        });
        if (getData.connect) {
          if (getData.response.connect === 'success') {
            Swal.fire('ส่งข้อมูลสำเร็จ', '', 'success');
          } else {
            Swal.fire(
              'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
              '',
              'error'
            );
          }
        } else {
          Swal.fire('ไม่สามารถสร้างไฟล์ PDF ได้!', '', 'error');
        }
      });
    });
  }

  public async startChange() {
    this.getData();
  }
  // sendprintChildren(val: any, j: any) {
  //   val.createdDT = val.datetime[j];
  //   val.phar = val.phar2_name;
  //   this.printPDF(val).then((dataPDF) => {
  //     dataPDF.getBase64(async (buffer) => {
  //       let getData: any = await this.http.Printjs('convertbuffer', {
  //         data: buffer,
  //         name: 'testpdf' + '.pdf',
  //         ip: this.dataUser.print_ip,
  //         printName: this.dataUser.print_name,
  //         hn: this.dataP.patientNO,
  //       });

  //       if (getData.connect) {
  //         if (getData.response.connect === 'success') {
  //           Swal.fire('ส่งข้อมูลสำเร็จ', '', 'success');
  //         } else {
  //           Swal.fire(
  //             'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
  //             '',
  //             'error'
  //           );
  //         }
  //       } else {
  //         Swal.fire('ไม่สามารถสร้างไฟล์ PDF ได้!', '', 'error');
  //       }
  //     });
  //   });
  // }
}
