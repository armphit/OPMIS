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
import { interval, Observable, Subscription } from 'rxjs';
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

  // date1 = new FormControl(new Date());
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

    // this.getDrug();
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
    // setTimeout(() => {

    this.idFilter.valueChanges.subscribe((patientNO) => {
      this.filterValues.patientNO = patientNO ? patientNO.trim() : '';

      // if (this.filterValues.patientNO) {
      if (this.select) {
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
      // }
    });

    this.nameFilter.valueChanges.subscribe((check) => {
      this.filterValues.check = check ? check : '';
      if (this.select) {
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    });

    // }, 500);
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
        'createdDT',
        'druglist',
        // 'check',
        'timestamp',
      ];
      let getData: any = null;
      let formData = new FormData();
      let dataPatient: any = null;
      if (this.select == 'W8' || this.select == 'W18') {
        formData.append('floor', this.select == 'W8' ? '2' : '3');
        formData.append(
          'date1',
          moment(this.campaignOne.value.start).format('YYYY-MM-DD')
        );
        formData.append(
          'date2',
          moment(this.campaignOne.value.end).format('YYYY-MM-DD')
        );
        getData = await this.http.post('listPatientQpost', formData);

        dataPatient = getData.response.result;
      } else {
        formData.append('floor', this.select);
        formData.append(
          'date',
          moment(this.campaignOne.value.start)
            .add(543, 'year')
            .format('YYYYMMDD')
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
          // setTimeout(() => {
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
  userList: any = null;
  drugList: any = null;
  listDrug = async (val: any) => {
    let formData = new FormData();
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

    formData.append('hn', val.patientNO);
    formData.append(
      'date',
      moment(val.createdDT).add(543, 'year').format('YYYYMMDD')
    );
    formData.append('date2', moment(val.createdDT).format('YYYY-MM-DD'));
    formData.append('queue', val.QN);
    formData.append('floor', this.select);
    let getData: any = await this.http.post('getdrugHomcFloor', formData);
    let getData2: any = await this.http.post('get_moph_confirm', formData);
    let getData3: any = await this.http.postNodejs('getCompiler', {
      hn: val.patientNO,
      date: moment(val.createdDT).format('YYYY-MM-DD'),
    });

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let mergeData = getData.response.result;

        if (getData3.connect) {
          if (getData3.response.get_compiler) {
            if (getData3.response.user.length) {
              this.userList = getData3.response.user.map((elm: any) => ({
                user: elm.user,
                name: elm.name,
                nameCheck: elm.name,
                userName: elm.user + ' ' + elm.name,
              }));

              mergeData = getData.response.result
                .map((emp: any) => {
                  return {
                    ...emp,
                    ...(getData3.response.get_compiler.find(
                      (item: { drugCode: any }) =>
                        item.drugCode.trim() === emp.drugCode.trim()
                    ) ??
                      (this.select == 'W9'
                        ? { userCheck: 'จนท ชั้น1' }
                        : this.select == 'W18'
                        ? { userCheck: 'จนท ชั้น3' }
                        : this.select == 'W19'
                        ? { userCheck: 'จนท M-Park' }
                        : { userCheck: '' })),
                  };
                })
                .map((val: any) => {
                  return {
                    ...val,
                    ...(this.userList.find(
                      (item: { user: any }) => item.user === val.userCheck
                    ) ??
                      (this.select == 'W9'
                        ? { nameCheck: 'จนท ชั้น1', userName: 'จนท ชั้น1' }
                        : this.select == 'W18'
                        ? { nameCheck: 'จนท ชั้น3', userName: 'จนท ชั้น3' }
                        : this.select == 'W19'
                        ? { nameCheck: 'จนท M-Park', userName: 'จนท M-Park' }
                        : { nameCheck: '', userName: '' })),
                  };
                });
            } else {
              this.userList = null;
            }
          }

          if (getData3.response.drug) {
            this.drugList = getData3.response.drug;
          } else {
            this.drugList = null;
          }
        }
        this.drugPatient = mergeData;

        if (getData2.response.result.length) {
          this.namePhar = getData2.response.result[0].name;
        }

        let win: any = window;
        win.$('#exampleModal').modal('show');
      } else {
        this.drugPatient = null;
        // let win: any = window;
        // win.$('#exampleModal').modal('show');
        Swal.fire('ไม่มีข้อมูลใบสั่งยา!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public manageErrormed = async (val: any, text: any) => {
    if (text === 'edit') {
      // let check_interceptor = this.userList.find((user: any) => {
      //   if (user.user === val.interceptor_id) {
      //     return val.interceptor_id + ' ' + val.interceptor_name;
      //   } else {
      //     return val.interceptor_id;
      //   }
      // });
      // console.log(check_interceptor);
      this.medError.reset();
      this.medError.patchValue({
        med: val.med,
        hn: val.hn,
        location: val.location,
        position: val.position_text,
        position_text: '',
        type: val.type_text,
        type_text: '',
        medWrong: val.med_wrong,
        medWrong_text: val.med_wrong_text,
        medGood: val.med_good,
        medGood_text: val.med_good_text,
        interceptor: val.interceptor_id + ' ' + val.interceptor_name,
        offender: val.offender_id + ' ' + val.offender_name,
        note: val.note,
      });

      let win: any = window;
      win.$('#check_error').modal('show');
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(val.id);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  // dataSelect: any = null;
  dataGood: any;
  dataWrong: any;
  dataInterceptor: any;
  dataOffender: any;
  @ViewChild('inputgood') inputgood!: ElementRef<HTMLInputElement>;
  @ViewChild('inputwrong') inputwrong!: ElementRef<HTMLInputElement>;
  @ViewChild('inputinterceptor')
  inputinterceptor!: ElementRef<HTMLInputElement>;
  @ViewChild('inputoffender') inputoffender!: ElementRef<HTMLInputElement>;
  setText = {
    textposition: false,
    texttype: false,
  };
  public medError = new FormGroup({
    hn: new FormControl(''),
    med: new FormControl(''),
    position: new FormControl(''),
    position_text: new FormControl(''),
    type: new FormControl(''),
    type_text: new FormControl(''),
    medGood: new FormControl(''),
    medGood_text: new FormControl(''),
    medWrong: new FormControl(''),
    medWrong_text: new FormControl(''),
    interceptor: new FormControl(''),
    offender: new FormControl(''),
    note: new FormControl(''),
    location: new FormControl(''),
  });
  dataUsercheck: any = null;
  async reportError(val: any) {
    let dataUser: any = await this.http.postNodejs('positionError', {
      ...val.dataP,
      ...val.item,
      site: this.select,
    });
    let positionError = {
      key: '',
      check: '',
    };
    if (dataUser.connect) {
      positionError = {
        key: dataUser.response.key,
        check: dataUser.response.check,
      };
    }

    this.dataUsercheck = { ...positionError, userName: val.item.userName };
    let dataDrug = this.drugList.find(
      (data: any) => data.code === val.item.drugCode.trim()
    );

    this.medError.reset();

    this.medError.patchValue({
      med: {
        code: val.item.drugCode ? val.item.drugCode.trim() : '',
        med_name: val.item.drugName ? val.item.drugName.trim() : '',
      },
      hn: {
        hn: val.dataP.patientNO,
        hnDT: val.dataP.createdDT,
      },
      location: this.select,
      position: 'key',
      type: 'จำนวน',
      medWrong: dataDrug ? dataDrug.name : '',
      medGood: dataDrug ? dataDrug.name : '',
      interceptor: this.dataUser.user + ' ' + this.dataUser.name,
      // offender: dataUser ? dataUser.userName : this.drugPatient.userName,
    });
    this.getDataselect();
    let win: any = window;
    win.$('#check_error').modal('show');
  }
  public async submitInput() {
    this.medError.value.position === 'other'
      ? this.medError.value.position_text
        ? this.medError.value.position_text
        : 'ไม่ระบุข้อความ'
      : this.medError.patchValue({
          position_text: this.medError.value.position,
        });

    this.medError.value.type === 'other'
      ? this.medError.value.type_text
        ? this.medError.value.type_text
        : 'ไม่ระบุข้อความ'
      : this.medError.patchValue({
          type_text: this.medError.value.type,
        });

    this.medError.patchValue({
      interceptor: this.userList.find(
        (val: any) => val.userName === this.medError.value.interceptor
      ) ?? {
        name: this.medError.value.interceptor,
        user: this.medError.value.interceptor,
        userName: this.medError.value.interceptor,
      },
      offender: this.userList.find(
        (val: any) => val.userName === this.medError.value.offender
      ) ?? {
        name: this.medError.value.offender,
        user: this.medError.value.offender,
        userName: this.medError.value.offender,
      },
      medGood: this.drugList.find(
        (val: any) => val.name.trim() === this.medError.value.medGood
      ) ?? {
        code: this.medError.value.medGood,
        name: this.medError.value.medGood,
      },
      medWrong: this.drugList.find(
        (val: any) => val.name.trim() === this.medError.value.medWrong
      ) ?? {
        code: this.medError.value.medWrong,
        name: this.medError.value.medWrong,
      },
      note: this.medError.value.note ? this.medError.value.note : '',
      medGood_text: this.medError.value.medGood_text
        ? this.medError.value.medGood_text
        : '',
      medWrong_text: this.medError.value.medWrong_text
        ? this.medError.value.medWrong_text
        : '',
    });

    let win: any = window;
    win.$('#check_error').modal('hide');

    let getData3: any = await this.http.postNodejs(
      'medError',
      this.medError.value
    );
    if (getData3.connect) {
      if (getData3.response.length) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire('ไม่มีข้อมูล!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  getDataselect() {
    this.medError.value.position === 'other'
      ? (this.setText.textposition = true)
      : ((this.setText.textposition = false),
        this.medError.patchValue({ position_text: '', offender: '' }));
    this.medError.value.type === 'other'
      ? (this.setText.texttype = true)
      : ((this.setText.texttype = false),
        this.medError.patchValue({ type_text: '', offender: '' }));

    if (this.medError.value.position === 'key') {
      this.medError.patchValue({
        offender: this.dataUsercheck.key,
      });
      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort: val.user.toLowerCase().charAt(0) == 'c' ? 1 : 2,
        };
      });
      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
    } else if (this.medError.value.position === 'จัด') {
      this.medError.patchValue({
        offender: this.dataUsercheck.userName,
      });

      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort: val.user.toLowerCase().charAt(0) == 'o' ? 1 : 2,
        };
      });
      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
    } else if (this.medError.value.position === 'check') {
      this.medError.patchValue({
        offender: this.dataUsercheck.check,
      });
      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort:
            val.user.toLowerCase().charAt(0) != 'c' &&
            val.user.toLowerCase().charAt(0) != 'o'
              ? 1
              : 2,
        };
      });
      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
    }
    this.userList.forEach((v: any) => {
      delete v.valSort;
    });
  }

  filter_good(): void {
    const filterValue = this.inputgood.nativeElement.value.toLowerCase();

    this.dataGood = this.drugList.filter((o: any) =>
      o.name.trim().toLowerCase().includes(filterValue)
    );
  }
  filter_wrong(): void {
    const filterValue = this.inputwrong.nativeElement.value.toLowerCase();

    this.dataWrong = this.drugList.filter((o: any) =>
      o.name.trim().toLowerCase().includes(filterValue)
    );
  }

  filter_interceptor(): void {
    const filterValue = this.inputinterceptor.nativeElement.value.toLowerCase();

    this.dataInterceptor = this.userList.filter((o: any) =>
      o.userName.trim().toLowerCase().includes(filterValue)
    );
  }

  filter_offender(): void {
    const filterValue = this.inputoffender.nativeElement.value.toLowerCase();

    this.dataOffender = this.userList.filter((o: any) =>
      o.userName.trim().toLowerCase().includes(filterValue)
    );
  }

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
        dataprint.datecut = moment(new Date())
          .add(543, 'year')
          .format('DD/MM/YYYY HH:mm:ss');
        this.printPDF(dataprint).then((dataPDF: any) => {
          if (dataPDF) {
            dataPDF.getBase64(async (buffer: any) => {
              let getData: any = await this.http.Printjs('convertbuffer', {
                data: buffer,
                name: `${this.dataP.patientNO}.pdf`,
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
          }
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
    formData.append(
      'date',
      moment(data.lastmodified).format('YYYY-MM-DD HH:mm:ss')
    );
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
          dataprint.datecut = moment(new Date())
            .add(543, 'year')
            .format('DD/MM/YYYY HH:mm:ss');

          this.printPDF(dataprint).then(async (dataPDF: any) => {
            if (dataPDF) {
              dataPDF.getBase64(async (buffer: any) => {
                let getData: any = await this.http.Printjs('convertbuffer', {
                  data: buffer,
                  name: `${this.dataP.patientNO}.pdf`,
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
            }
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

      'createdDT',
      'relativePhone',
      'relativeAddress',
      'status',
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
      if (this.getTab == 2) {
        this.getReport();
      } else if (this.getTab == 1) {
        this.getMoph();
      } else if (this.getTab == 3) {
        this.reportDispend();
      } else if (this.getTab == 4) {
        this.reportCheckmed();
      } else if (this.getTab == 0 || this.getTab == null) {
        this.getData();
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
      ? this.getMoph()
      : this.getTab === 2
      ? this.getReport()
      : this.getTab === 3
      ? this.reportDispend()
      : this.reportCheckmed();
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
    if (this.getTab === 2) {
      this.getReport();
    } else if (this.getTab === 3) {
      this.reportDispend();
    }
  }

  async printPDF(data: any) {
    let numHN = data.patientNO ? data.patientNO : data.hn;

    let data_send = {
      hn: numHN.trim(),
      date: moment(data.createdDT).format('YYYY-MM-DD'),
      floor: this.select,
      code: data.drugcode
        ? data.drugcode.trim()
        : data.drugCode
        ? data.drugCode.trim()
        : '',
    };

    let getDataprint: any = await this.http.postNodejs(
      'prinsticker',
      data_send
    );

    if (getDataprint.connect) {
      if (getDataprint.response) {
        let namePatient = getDataprint.response.intruction[0]
          ? getDataprint.response.intruction[0].name_patient
          : '';
        let lamed = getDataprint.response.intruction[0]
          ? getDataprint.response.intruction[0]
          : [];

        // let freetext1 = [];
        // let freetextany = '';

        // if (lamed.freetext1) {
        //   freetext1 = lamed.freetext1 ? lamed.freetext1.split(',') : [];

        //   if (freetext1.length) {
        //     let index = lamed.freetext1.indexOf(',');

        //     if (index > 0) {
        //       freetextany = lamed.freetext1.substring(
        //         index + 1,
        //         lamed.freetext1.length
        //       );
        //       console.log(freetextany);
        //     }
        //   }
        // }

        // let freetext2 = lamed.freetext2 ? lamed.freetext2.split(',') : '';
        let freetext1 = lamed.freetext1.split(',');
        let free_under = freetext1.slice(1);
        lamed.freetext2 =
          lamed.freetext2.charAt(0) === ','
            ? lamed.freetext2.substring(1)
            : lamed.freetext2;
        let freetext2 = lamed.freetext2.split(',');
        let freetext_lang = lamed.freetext0 ? lamed.freetext0.trim() : '';
        let nameHn = namePatient + '   HN ' + numHN.trim();

        if (lamed.freetext0) {
          if (lamed.freetext0.trim() == 'เม็ด') {
            if (lamed.dosage) {
              if (lamed.dosage.trim() == '0') {
                lamed.dosage = '';
                freetext_lang = '';
              } else if (lamed.dosage.trim() == '0.5') {
                lamed.dosage = 'ครึ่ง';
              } else if (
                lamed.dosage.trim() == '0.25' ||
                lamed.dosage.trim() == '1/4'
              ) {
                lamed.dosage = 'หนึ่งส่วนสี่';
              } else if (
                lamed.dosage.trim() == '0.75' ||
                lamed.dosage.trim() == '3/4'
              ) {
                lamed.dosage = 'สามส่วนสี่';
              } else if (lamed.dosage.trim() == '1.5') {
                lamed.dosage = 'หนึ่งเม็ดครึ่ง';
                freetext_lang = '';
              } else if (lamed.dosage.trim() == '2.5') {
                lamed.dosage = 'สองเม็ดครึ่ง';
                freetext_lang = '';
              } else if (lamed.dosage.trim() == '3.5') {
                lamed.dosage = 'สามเม็ดครึ่ง';
                freetext_lang = '';
              }
            } else {
              lamed.dosage = '';
            }
          } else {
            if (lamed.dosage) {
              if (lamed.dosage.trim() == '0') {
                lamed.dosage = '';
              }
            } else {
              lamed.dosage = '';
            }
          }
        } else {
          lamed.dosage = lamed.dosage
            ? lamed.dosage.trim() == '0'
              ? ''
              : lamed.dosage.trim()
            : '';
        }
        let lamedName = lamed.lamedName ? lamed.lamedName.trim() : '';
        let textProbrem = `${lamedName} ${lamed.dosage.trim()} ${freetext_lang} ${
          freetext1[0] ? freetext1[0] : ''
        }`;

        let nameDrug = data.drugName
          ? data.drugName.trim()
          : data.drugname
          ? data.drugname.trim()
          : '';
        let drugCode = data.drugcode
          ? data.drugcode.trim()
          : data.drugCode
          ? data.drugCode.trim()
          : '';

        if (drugCode === 'SOFOS8') {
          nameDrug = nameDrug.substring(0, 36);
          nameDrug = nameDrug + '...';
        }

        let date = '';
        if (data.datecut) {
          date = data.datecut;
        } else if (data.createdDT) {
          date = moment(data.createdDT)
            .add(543, 'year')
            .format('DD/MM/YYYY HH:mm:ss');
        } else {
          date = moment(new Date())
            .add(543, 'year')
            .format('DD/MM/YYYY HH:mm:ss');
        }

        var docDefinition = {
          // pageSize: { width: 325, height: 350 },
          pageSize: { width: 238, height: 255 },
          // pageMargins: [5, 50, 5, 100] as any,
          pageMargins: [0, 0, 7, 88] as any,
          header: {} as any,

          content: [
            {
              text: 'ค้างจ่ายยา',
              alignment: 'center',
              decoration: 'underline',
              fontSize: 16,
              bold: true,
            },
            {
              text: nameHn,
              noWrap: true,
              fontSize: 16,
              bold: true,
            },
            {
              canvas: [
                { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 },
              ],
            },
            {
              columns: [
                {
                  width: 150,
                  text: nameDrug,
                  bold: true,
                  fontSize: data.checkLength ? 13 : 14,
                  noWrap: true,
                },
                {
                  width: '*',
                  text: `#${
                    data.balanceamount +
                    ' ' +
                    (data.unit
                      ? data.unit.trim()
                      : data.miniUnit
                      ? data.miniUnit.trim()
                      : '')
                  }`,
                  alignment: 'right',
                },
              ],
              fontSize: 14,
              bold: true,
              // margin: [0, 5, 0, 0],
            },
            {
              text: lamed.itemidentify ? lamed.itemidentify.trim() : ``,

              fontSize: 13,
            },
            {
              text: textProbrem,
              bold: true,
              fontSize: textProbrem.length > 57 ? 14 : 15,
              noWrap: true,
              alignment: 'center',
            },
            {
              text: free_under ? free_under.join(', ') : '',
              bold: true,
              fontSize: 15,
              alignment: 'center',
            },
            // free_under
            //   ? free_under.map(function (item: any) {
            //       return {
            //         text: item.trim(),
            //         alignment: 'center',
            //         bold: true,
            //         fontSize: 15,
            //       };
            //     })
            //   : '',
            freetext2
              ? lamed.invCode.trim() === 'MIRTA' ||
                lamed.invCode.trim() === 'ALEND'
                ? {
                    text: lamed.freetext2.trim(),
                    alignment: 'center',
                    fontSize: 13,
                    bold: true,
                  }
                : freetext2.map(function (item: any) {
                    return {
                      text: item.trim(),
                      alignment: 'center',
                      fontSize: item.trim().length >= 80 ? 12 : 13,
                      bold: true,
                    };
                  })
              : '',
          ] as any,

          footer: [
            {
              canvas: [
                { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 },
              ],
            },
            {
              text: `รับยาที่ ${
                getDataprint.response.datasite[0].site_name
                  ? getDataprint.response.datasite[0].site_name.trim()
                  : ''
              }`,

              fontSize: 14,
              bold: true,
            },
            {
              text: `โทร ${
                getDataprint.response.datasite[0].site_tel
                  ? getDataprint.response.datasite[0].site_tel
                  : ''
              }`,

              fontSize: 14,
              bold: true,
            },
            {
              text: `เภสัชกร ${data.name || data.phar_name}`,
              bold: true,
              fontSize: 12,
            },
            {
              text: `วันที่ค้างยา ${date} น.`,

              fontSize: 12,
            },
          ] as any,
          defaultStyle: {
            font: 'THSarabunNew',
          },
        };
        // pdfMake.createPdf(docDefinition).open();
        // return false;
        const pdfDocGenerator = await pdfMake.createPdf(docDefinition);
        return pdfDocGenerator;
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อ getSiteTel!', '', 'error');
        return false;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      return false;
    }
  }

  sendprint(val: any) {
    val.phar_name = val.phar2_name[0]
      ? val.phar2_name[val.phar2_name.length - 1]
      : val.phar_name;
    val.datecut = moment(new Date())
      .add(543, 'year')
      .format('DD/MM/YYYY HH:mm:ss');
    this.printPDF(val).then((dataPDF: any) => {
      if (dataPDF) {
        dataPDF.getBase64(async (buffer: any) => {
          let getData: any = await this.http.Printjs('convertbuffer', {
            data: buffer,
            name: `${this.dataP.patientNO}.pdf`,
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
      }
    });
  }

  public async startChange() {
    this.getData();
  }
  nameExcel4 = '';
  dataSource4: any = null;
  displayedColumns4: any = null;
  @ViewChild('input4') input4!: ElementRef;
  @ViewChild('MatSort4') sort4!: MatSort;
  @ViewChild('MatPaginator4') paginator4!: MatPaginator;
  public reportDispend = async () => {
    this.displayedColumns4 = [
      'pharmacist',
      'departmentcode',
      'drugname',
      'amount',
      'createDT',
    ];
    let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
    let formData = new FormData();
    formData.append('start', datestart);
    formData.append('end', dateend);
    formData.append('floor', this.select);

    let getData: any = await this.http.post('getReportdispenddrug', formData);
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataSource4 = new MatTableDataSource(getData.response.result);
        this.dataSource4.sort = this.sort4;
        this.dataSource4.paginator = this.paginator4;
        this.nameExcel2 = `รายงานตัดจ่ายยา ${datestart}_${dateend}`;
        setTimeout(() => {
          this.input4.nativeElement.focus();
        }, 100);
      } else {
        this.dataSource4 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  public applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
  }

  nameExcel5 = '';
  dataSource5: any = null;
  displayedColumns5: any = null;
  @ViewChild('input5') input5!: ElementRef;
  @ViewChild('MatSort5') sort5!: MatSort;
  @ViewChild('MatPaginator5') paginator5!: MatPaginator;
  choicecheckmed = '1';
  public reportCheckmed = async () => {
    this.dataSource5 = null;
    this.displayedColumns5 = [];
    if (this.choicecheckmed == '1') {
      // this.displayedColumns5 = [
      //   'userCheck',
      //   'name',
      //   'countuserCheck',
      //   'countdrugCode',
      //   'time',
      // ];
      this.displayedColumns5 = [
        'Action',
        'hn',
        'location',
        'position_text',
        'type_text',
        'med_wrong_name',
        'med_wrong_text',
        'med_good_name',
        'med_good_text',
        'interceptor_name',
        'offender_name',
        'note',
        'createDT',
      ];

      let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
      let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
      let formData = {
        datestart: datestart,
        dateend: dateend,
        choice: this.choicecheckmed,
      };

      let getData: any = await this.http.postNodejs('reportcheckmed', formData);
      let dataDrug = getData.response.datadrugcheck;

      if (getData.connect) {
        if (dataDrug.length) {
          // let sum = dataDrug.reduce(function (a: any, b: any) {
          //   return a + +new Date('1970T' + b.time + 'Z');
          // }, 0);
          // dataDrug[dataDrug.length] = {
          //   userChec: '',
          //   name: 'รวม',
          //   countuserCheck: dataDrug.reduce((accumulator: any, object: any) => {
          //     return accumulator + object.countuserCheck;
          //   }, 0),
          //   countdrugCode: dataDrug.reduce((accumulator: any, object: any) => {
          //     return accumulator + object.countdrugCode;
          //   }, 0),
          //   time: new Date(sum / dataDrug.length + 500).toJSON().slice(11, 19),
          // };
          this.dataSource5 = new MatTableDataSource(dataDrug);
          this.dataSource5.sort = this.sort5;
          this.dataSource5.paginator = this.paginator5;
          this.nameExcel5 = `รายงาน MED-Error ${datestart}_${dateend}`;
          // this.nameExcel5 = `รายงานเจ้าหน้าที่เช็คยา ${datestart}_${dateend}`;
          setTimeout(() => {
            this.input5.nativeElement.focus();
          }, 100);
        } else {
          this.dataSource5 = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else {
      this.displayedColumns5 = [
        'hn',
        'userCheck',
        'timestamp',
        'checkComplete',
        'time',
        'item',
      ];
      let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
      let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
      let formData = {
        datestart: datestart,
        dateend: dateend,
        choice: this.choicecheckmed,
      };

      let getData: any = await this.http.postNodejs('reportcheckmed', formData);

      if (getData.connect) {
        if (getData.response.datadrugcheck.length) {
          this.dataSource5 = new MatTableDataSource(
            getData.response.datadrugcheck
          );
          this.dataSource5.sort = this.sort5;
          this.dataSource5.paginator = this.paginator5;
          this.nameExcel5 = `รายงานเวลาเช็คยา ${datestart}_${dateend}`;
          setTimeout(() => {
            this.input5.nativeElement.focus();
          }, 100);
        } else {
          this.dataSource5 = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  };

  public applyFilter5(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource5.filter = filterValue.trim().toLowerCase();
  }
}
