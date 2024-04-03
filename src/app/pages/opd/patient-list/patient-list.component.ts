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
    this.getType();

    // fetch('./assets/data.json')
    //   .then((res) => res.json())
    //   .then((jsonData) => {});
    // // this.getDrug();
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
  queuePChanged(e: any) {
    this.getData();
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
        formData.append('queuep', 'N');
        if (this.select == 'W18') {
          getData = await this.http.post('listPatientQpost', formData);
          dataPatient = getData.response.result;
        } else {
          let data_send = {
            date1: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
            date2: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
          };
          getData = await this.http.postNodejsTest('queueP', data_send);
          dataPatient = getData.response.gethospitalQ;
        }
      } else {
        formData.append('floor', this.select);
        formData.append(
          'date',
          moment(this.campaignOne.value.start)
            .add(543, 'year')
            .format('YYYYMMDD')
        );
        formData.append(
          'date2',
          moment(this.campaignOne.value.end).add(543, 'year').format('YYYYMMDD')
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
            ) ?? { check: '', timestamp: null }),
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
  // checkW: any = null;
  userList: any = null;
  drugList: any = null;
  dataDrug2: any = [];
  listDrug = async (val: any) => {
    let formData = new FormData();
    this.hncut = null;
    this.dataP = {};
    this.dataDrug = [];
    this.datatime = null;
    this.checkdrug = null;

    this.datatime = val.timestamp;
    this.checkdrug = val.check;
    // this.checkW =
    //   this.select === 'W9' ? false : this.select === 'W19' ? false : true;
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
      formData.append('hn', val.patientNO);
      let drug_allergic: any = await this.http.post(
        'drug_allergic_fix',
        formData
      );

      if (drug_allergic.connect) {
        if (drug_allergic.response[1].rowCount > 0) {
          this.dataDrug = drug_allergic.response[1].result;
        } else {
          this.dataDrug = [];
        }
        if (drug_allergic.response[0].rowCount > 0) {
          this.dataDrug2 = drug_allergic.response[0].result;
        } else {
          this.dataDrug2 = [];
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

    let getData3: any = await this.http.postNodejsTest('getCompiler', {
      hn: val.patientNO,
      date: moment(val.createdDT).format('YYYY-MM-DD'),
      queue: val.QN ? val.QN : this.select,
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
                        : this.select == 'W8'
                        ? { userCheck: emp.userCheck }
                        : '')),
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

              for (let index = 0; index < mergeData.length; index++) {
                if (mergeData[index].userCheck) {
                  if (mergeData[index].userCheck.includes(',')) {
                    let fixUser = mergeData[index].userCheck.split(',');
                    let op = fixUser.map((e: any) => {
                      let temp = this.userList.find((v: any) => v.user === e);

                      return temp;
                    });
                    let dataJoin = {
                      name: Array.prototype.map
                        .call(op, function (item) {
                          return item.name;
                        })
                        .join(','),
                      nameCheck: Array.prototype.map
                        .call(op, function (item) {
                          return item.nameCheck;
                        })
                        .join(','),
                      user: Array.prototype.map
                        .call(op, function (item) {
                          return item.user;
                        })
                        .join(','),
                      userName: Array.prototype.map
                        .call(op, function (item) {
                          return item.userName;
                        })
                        .join(','),
                    };
                    mergeData[index] = { ...mergeData[index], ...dataJoin };
                  }
                }
              }
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
    this.medError.reset();

    val.date = moment(val.hnDT).format('YYYY-MM-DD');
    let getData3: any = await this.http.postNodejsTest('getCompiler', {
      hn: val.hn,
      date: moment(val.createdDT).format('YYYY-MM-DD'),
    });
    if (getData3.connect) {
      if (getData3.response.get_compiler) {
        if (getData3.response.user.length) {
          this.userList = getData3.response.user.map((elm: any) => ({
            user: elm.user,
            name: elm.name,
            nameCheck: elm.name,
            userName: elm.user + ' ' + elm.name,
          }));

          if (getData3.response.drug.length) {
            this.drugList = getData3.response.drug;
          } else {
            this.drugList = null;
          }

          val.createdDT = val.hnDT;
          val.patientNO = val.hn;
          val.drugCode = val.med;

          let dataUser: any = await this.http.postNodejsTest('positionError', {
            ...val,
            site: val.location,
          });
          let check: any = '';
          let dis: any = '';
          if (val.position_text === 'check') {
            check = this.userList.find(
              (data: any) => data.user == val.offender_id
            );
            if (check) {
              check = check.userName;
            }
          }

          if (val.position_text === 'DE') {
            dis = this.userList.find(
              (data: any) => data.user == val.offender_id
            );
            if (dis) {
              dis = dis.userName;
            }
          }

          this.dataUsercheck = {
            key: dataUser.response.key,
            check: check,
            dispend: dis,
            pe: dataUser.response.pe,
            userName: val.position_text === 'จัด' ? val.offender_id : '',
          };
        } else {
          this.userList = null;
        }
      }
    }

    let med_wrong =
      this.drugList.find(
        (data: any) => data.code.trim() === val.med_wrong.trim()
      ) ?? null;
    let med_good =
      this.drugList.find(
        (data: any) => data.code.trim() === val.med_good.trim()
      ) ?? null;
    let offender =
      this.userList.find((user: any) => user.user === val.offender_id) ?? null;
    let interceptor =
      this.userList.find((user: any) => user.user === val.interceptor_id) ??
      null;
    let finePo =
      this.positionE.find((po: any) => po === val.position_text) ?? 'other';

    let fineTy = this.typeE.find(
      (ty: any) => ty.name_type === val.type_text
    ) ?? { id_type: 'n10', name_type: 'other' };
    await this.getDataposition();
    // await this.getDatatype();
    this.medError.patchValue({
      med: val.med,
      hn: val.hn,
      location: val.location,
      position: finePo,
      position_text: val.position_text,
      type: fineTy.id_type,
      type_text: val.type_text,
      medWrong: med_wrong ? med_wrong.name : '',
      medWrong_text: val.med_wrong_text,
      medGood: med_good ? med_good.name : '',
      medGood_text: val.med_good_text,
      interceptor: interceptor ? interceptor.userName : val.interceptor_name,
      offender: offender ? offender.userName : val.offender_name,
      note: val.note,
      id: val.id,
      check: text,
      userLogin: this.dataUser.user,
      level: val.level,
      occurrence: val.occurrence,
      source: val.source,
      error_type: val.error_type,
      site: val.site,
    });

    if (text === 'edit') {
      finePo === 'other'
        ? (this.setText.textposition = true)
        : (this.setText.textposition = false);
      fineTy.name_type === 'other'
        ? (this.setText.texttype = true)
        : (this.setText.texttype = false);

      let win: any = window;
      win.$('#check_error').modal('show');
    } else {
      Swal.fire({
        title: 'คุณต้องการที่จะลบข้อมูลหรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitInput('');
        }
      });
    }
  };

  // dataSelect: any = null;
  dataGood: any;
  dataWrong: any;
  dataAllergic: any;
  dataInterceptor: any;
  dataOffender: any;
  @ViewChild('inputgood') inputgood!: ElementRef<HTMLInputElement>;
  @ViewChild('inputwrong') inputwrong!: ElementRef<HTMLInputElement>;
  @ViewChild('inputallergic') inputallergic!: ElementRef<HTMLInputElement>;
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
    id: new FormControl(''),
    check: new FormControl(''),
    userLogin: new FormControl(''),
    level: new FormControl(''),
    occurrence: new FormControl(''),
    source: new FormControl(''),
    error_type: new FormControl(''),
    site: new FormControl(''),
    type_pre: new FormControl(''),
    medcode_err: new FormControl(''),
  });
  dataUsercheck: any = null;
  positionE: string[] = ['PE', 'key', 'จัด', 'check', 'DE', 'other'];
  typeE: any = [];
  gettypeE: any = [];
  pe_de: any = {
    level: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    occurrence: ['รับรายงาน', 'เชิงรุก'],
    source: ['ในเวลา', 'นอกเวลา'],
    error_type: ['drug error', 'labelling error', 'issue error'],
    note: [
      'ไม่มียานี้ในบัญชีโรงพยาบาล',
      'อ่านชื่อยาไม่ชัดเจน',
      'วิธีใช้ไม่ชัดเจน',
      'กรุณาระบุจำนวนยา',
      'กรุณาระบุความแรงยา รพ.มีขนาด',
      'กรุณาระบุวิธีใช้ยา',
      'ขอใบเฉพาะกิจ / มูลค่ายาเกินหมื่น / กรณีสั่ง Alprazolam',
      'ขอใบ NED / DUE / จ2 / ยส.5 / เฉพาะราย',
    ],
    site: [
      'PCT ศัลย์',
      'PCT เด็ก',
      'PCT สูติฯ',
      'PCT ตา',
      'PCT ทันตกรรม',
      'PCT MED',
      'PCT Ortho',
      'PCT ENT',
      'PCT จิตเวช',
      'PCT กายภาพ',
      'PCT ER',
    ],
    type_pre: ['nonCPOE', 'CPOE'],
  };
  tel_site: string[] = [
    `ห้องยา ชั้น 1 โทร 32142-3`,
    `ชั้น 2 โทร 32200-1`,
    `ชั้น 3 โทร 32341-2`,
  ];
  async reportError(val: any) {
    this.checkpre = false;
    let dataUser: any = await this.http.postNodejsTest('positionError', {
      ...val.dataP,
      ...val.item,
      site: this.select,
    });

    let positionError = {
      key: '',
      check: '',
      dispend: '',
      pe: '',
    };
    if (dataUser.connect) {
      positionError = {
        key: dataUser.response.key,
        check: dataUser.response.check,
        dispend: dataUser.response.dispend,
        pe: dataUser.response.pe,
      };
    }

    this.dataUsercheck = { ...positionError, userName: val.item.userName };
    let dataDrug = this.drugList.find(
      (data: any) => data.code === val.item.drugCode.trim()
    );

    this.medError.reset();
    this.medError.patchValue({
      position: 'key',
    });
    await this.getDataposition();
    await this.getDatatype();

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
      type: 'n1',
      medWrong: dataDrug ? dataDrug.name : '',
      medGood: dataDrug ? dataDrug.name : '',
      interceptor: this.dataUser.user + ' ' + this.dataUser.name,
      offender: this.dataUsercheck ? this.dataUsercheck.key : '',
    });
    let win: any = window;
    win.$('#check_error').modal('show');
  }
  async getType() {
    let getData: any = await this.http.post('getType');
    if (getData.connect) {
      if (getData.response.result) {
        this.typeE = getData.response.result;
      }
    }
  }
  changeText(e: any) {
    this.medError.patchValue({
      note: e.value,
    });
  }
  checkpre: boolean = false;
  public async submitInput(data: any) {
    let old = this.medError.value;
    // Swal.fire({
    //   title: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
    //   showCancelButton: true,
    //   confirmButtonText: ' ตกลง',
    //   cancelButtonText: 'ยกเลิก',
    // }).then(async (result) => {
    //   /* Read more about isConfirmed, isDenied below */
    //   if (result.isConfirmed) {
    this.medError.value.position === 'other'
      ? this.medError.value.position_text
        ? this.medError.value.position_text
        : 'ไม่ระบุข้อความ'
      : this.medError.patchValue({
          position_text: this.medError.value.position,
        });

    this.medError.value.type === 'other' || this.medError.value.type === 'n10'
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
        name: this.medError.value.offender ? this.medError.value.offender : '',
        user: this.medError.value.offender ? this.medError.value.offender : '',
        userName: this.medError.value.offender
          ? this.medError.value.offender
          : '',
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
      level: this.medError.value.level ? this.medError.value.level : '',
      occurrence: this.medError.value.occurrence
        ? this.medError.value.occurrence
        : '',
      source: this.medError.value.source ? this.medError.value.source : '',
      error_type: this.medError.value.error_type
        ? this.medError.value.error_type
        : '',
      site: this.medError.value.site ? this.medError.value.site : '',
      type_pre: this.medError.value.type_pre
        ? this.medError.value.type_pre
        : '',
      med:
        this.medError.value.type == 'pe7' ||
        this.medError.value.type == 'pe8' ||
        this.medError.value.type == 'pe9'
          ? this.dataAllergic.length
            ? {
                code: this.dataAllergic[0].code,
                med_name: this.dataAllergic[0].name,
              }
            : this.medError.value.med
          : this.medError.value.med,
    });
    if (!this.medError.value.id) {
      if (this.medError.value.position == 'PE') {
        if (this.checkprint) {
          this.errPDF(this.medError.value).then((dataPDF: any) => {
            if (dataPDF) {
              if (data === 'Preview') {
                this.medError.patchValue({
                  medWrong: old.medWrong,
                  medWrong_text: old.medWrong_text,
                  medGood: old.medGood,
                  medGood_text: old.medGood_text,
                  interceptor: old.interceptor,
                  offender: old.offender,
                });

                this.checkpre = true;
                dataPDF.getDataUrl((dataUrl: any) => {
                  let targetElement: any =
                    document.querySelector('#iframeContainer');

                  targetElement.src = dataUrl;
                });
              } else {
                dataPDF.getBase64(async (buffer: any) => {
                  let getData: any = await this.http.Printjs('convertbuffer', {
                    data: buffer,
                    name: `${this.dataP.patientNO} ${this.medError.value.position_text} medError.pdf`,
                    ip: this.dataUser.print_ip,
                    printName: this.dataUser.print_name,
                    hn: this.dataP.patientNO,
                  });
                  if (getData.connect) {
                    if (getData.response.connect === 'success') {
                      this.insertErr();
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
            }
          });
        } else {
          this.insertErr();
        }
      } else {
        this.insertErr();
      }
    } else {
      this.insertErr();
    }
  }
  async insertErr() {
    let win: any = window;
    win.$('#check_error').modal('hide');
    let getData3: any = await this.http.postNodejs(
      this.medError.value.id ? 'manageError' : 'medError',
      this.medError.value
    );

    if (getData3.connect) {
      if (getData3.response.length) {
        Swal.fire({
          icon: 'success',
          title:
            this.medError.value.check === 'delete'
              ? 'ลบข้อมูลสำเร็จ'
              : 'บันทึกข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });

        this.medError.value.id
          ? ((this.input5.nativeElement.value = ''), this.reportCheckmed())
          : '';
      } else {
        Swal.fire('บันทึกข้อมูลไม่สำเร็จ!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  async errPDF(data: any) {
    let type = this.typeE.find((e: any) => e.id_type == data.type);
    var docDefinition = {
      // pageSize: { width: 325, height: 350 },
      pageSize: { width: 238, height: 255 },
      // pageMargins: [5, 50, 5, 100] as any,
      pageMargins: [0, 0, 7, 65] as any,
      // pageMargins: [0, 0, 7, 88] as any,
      header: {} as any,

      content: [
        {
          text: 'Message for you',
          alignment: 'center',

          fontSize: 18,
          bold: true,
        },
        {
          text: `Date ${moment(new Date())
            // .add(543, 'year')
            .format('DD/MM/YYYY')}`,
          alignment: 'right',

          fontSize: 14,
        },
        {
          text: `เรียนแพทย์ผู้ตรวจ`,
          fontSize: 14,
        },
        {
          text: `เนื่องจากยา ${data.med.med_name} ที่ท่านสั่งนั้น`,
          fontSize: 14,
        },
        type
          ? {
              text: `- ${type ? type.name_type : ''}`,

              fontSize: 14,
              margin: [5, 0, 0, 0],
            }
          : ``,
        {
          text: data.medGood_text
            ? data.medGood_text
            : `.............................................................................................`,
          fontSize: 14,
          margin: [5, 0, 0, 0],
        },
        {
          text: data.note
            ? `- อื่นๆ ${data.note}`
            : `- อื่นๆ ....................................................................................`,
          fontSize: 14,
          margin: [5, 0, 0, 0],
        },
      ] as any,

      footer: [
        {
          text: `ขอบคุณค่ะ ...${
            data.interceptor_name
              ? data.interceptor_name
              : data.interceptor
              ? data.interceptor.name
              : ''
          }... ${
            this.dataUser.user.toUpperCase().includes('C')
              ? 'เจ้าพนักงานเภสัชกรรม'
              : 'เภสัชกร'
          }`,
          alignment: 'center',

          fontSize: 14,
        },
        {
          text:
            this.select === 'W9'
              ? this.tel_site[0]
              : this.select === 'W8'
              ? this.tel_site[1]
              : this.select === 'W18'
              ? this.tel_site[2]
              : `ห้องยา ชั้น 1 โทร 32142-3 ชั้น 2 โทร 32200-1 ชั้น 3 โทร 32341-2`,
          alignment: 'center',

          fontSize: 12,
        },
      ] as any,
      defaultStyle: {
        font: 'THSarabunNew',
        bold: true,
      },
    };
    // pdfMake.createPdf(docDefinition).open();
    // return false;
    const pdfDocGenerator = await pdfMake.createPdf(docDefinition);
    return pdfDocGenerator;
  }
  async rePrint(val: any) {
    let data = { ...val };

    data.med = {
      med_name: data.med,
    };

    let t = this.typeE.find((e: any) => e.name_type == data.type_text) ?? null;
    let n: any = null;

    let getData: any = await this.http.serchDrug();

    if (getData.connect) {
      n = getData.response.data.find(
        (e: any) => e.orderitemcode.trim() == data.med.med_name
      );
    }

    data.type = t ? t.id_type : '';
    data.med = {
      med_name: n ? n.genericname.trim() : '',
    };

    Swal.fire({
      title: 'คุณต้องการพิมพ์ข้อมูลรายการนี้หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        this.errPDF(data).then((dataPDF: any) => {
          if (dataPDF) {
            dataPDF.getBase64(async (buffer: any) => {
              let getData: any = await this.http.Printjs('convertbuffer', {
                data: buffer,
                name: `${data.hn} ${data.position_text} medError.pdf`,
                ip: this.dataUser.print_ip,
                printName: this.dataUser.print_name,
                hn: this.dataP.patientNO,
              });
              if (getData.connect) {
                if (getData.response.connect === 'success') {
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'พิมพ์ข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                } else {
                  Swal.fire(
                    'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
                    '',
                    'error'
                  );
                }
              } else {
                Swal.fire('ไม่สามารถพิมพ์ข้อมูลรายการนี้ได้!', '', 'error');
              }
            });
          }
        });
      }
    });
  }
  getDatatype() {
    if (
      this.medError.value.type === 'other' ||
      this.medError.value.type === 'n10'
    ) {
      this.setText.texttype = true;

      this.medError.patchValue({
        type_text: '',
      });
    } else {
      this.setText.texttype = false;
      this.medError.patchValue({
        type_text: this.medError.value.type,
      });
    }
  }

  getDataposition() {
    if (this.medError.value.position === 'key') {
      this.setText.textposition = false;

      this.medError.patchValue({
        offender: this.dataUsercheck.key,
        position_text: this.medError.value.position,
        level: '',
        occurrence: '',
        source: '',
        error_type: '',

        site: '',
        type: 'n1',
        type_pre: '',
      });
      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort: val.user.toLowerCase().charAt(0) == 'c' ? 1 : 2,
        };
      });

      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
      this.gettypeE = this.typeE.filter((e: any) => e.id_type.includes('n'));
    } else if (this.medError.value.position === 'จัด') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.userName,
        position_text: this.medError.value.position,
        type: 'n1',
        level: '',
        occurrence: '',
        source: '',
        error_type: '',

        site: '',
        type_pre: '',
      });

      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort: val.user.toLowerCase().charAt(0) == 'o' ? 1 : 2,
        };
      });
      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
      this.gettypeE = this.typeE.filter((e: any) => e.id_type.includes('n'));
    } else if (this.medError.value.position === 'check') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.check,
        position_text: this.medError.value.position,
        type: 'n1',
        level: '',
        occurrence: '',
        source: '',
        error_type: '',

        site: '',
        type_pre: '',
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
      this.gettypeE = this.typeE.filter((e: any) => e.id_type.includes('n'));
    } else if (this.medError.value.position === 'DE') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.dispend,
        position_text: this.medError.value.position,
        type: 'de1',
        level: 'B',
        occurrence: 'รับรายงาน',
        source: 'ในเวลา',
        error_type: 'drug error',
        type_pre: '',
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
      this.gettypeE = this.typeE.filter((e: any) => e.id_type.includes('de'));
    } else if (this.medError.value.position === 'PE') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.pe,
        position_text: this.medError.value.position,
        type: '',
        level: 'B',
        occurrence: 'รับรายงาน',
        source: 'ในเวลา',
        error_type: 'drug error',
        site: 'PCT MED',
        type_pre: 'nonCPOE',
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
      this.gettypeE = this.typeE.filter((e: any) => e.id_type.includes('pe'));
    } else {
      this.setText.textposition = true;
      this.medError.patchValue({
        offender: '',
        position_text: '',
        type: '',
        level: '',
        occurrence: '',
        source: '',
        error_type: '',

        site: '',
        type_pre: '',
      });

      this.gettypeE = this.typeE;
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

  filter_allergic(): void {
    const filterValue = this.inputallergic.nativeElement.value.toLowerCase();

    this.dataAllergic = this.drugList.filter((o: any) =>
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
        formData.append('floor', this.select);
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
      'site',
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
    formData.append('time1', this.starttime + ':00');
    formData.append('time2', this.endtime + ':00');

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

  valuechange() {
    if (this.getTab == 1) {
      this.getMoph();
    } else {
      this.reportCheckmed();
    }
  }

  clearValue() {
    // new Date(new Date().setDate(new Date().getDate() - 1)),
    this.campaignOne = this.formBuilder.group({
      start: [new Date(new Date()), Validators.required],
      end: [new Date(new Date()), Validators.required],
    });
    this.starttime = '08:00';
    this.endtime = '16:00';
    if (this.getTab == 1) {
      this.getMoph();
    } else {
      this.reportCheckmed();
    }
  }

  nameExcel5 = '';
  dataSource5: any = null;
  displayedColumns5: any = null;
  @ViewChild('input5') input5!: ElementRef;
  @ViewChild('MatSort5') sort5!: MatSort;
  @ViewChild('MatPaginator5') paginator5!: MatPaginator;
  choicecheckmed = '1';
  avgTime: any = '';
  public starttime = '08:00';

  public endtime = '16:00';
  datareportCheckmed: any;
  datareportCheckmedFilter: any;
  filterType: any = '';
  numError: any = {};
  filter_type() {
    if (this.select) {
      this.datareportCheckmedFilter = this.datareportCheckmed.filter(
        (val: any) => val.location == this.select
      );
    } else {
      this.datareportCheckmedFilter = this.datareportCheckmed;
    }

    if (this.filterType == 'pe') {
      this.datareportCheckmedFilter = this.datareportCheckmedFilter.filter(
        (val: any) => val.position_text == 'PE'
      );
    } else if (this.filterType == 'de') {
      this.datareportCheckmedFilter = this.datareportCheckmedFilter.filter(
        (val: any) => val.position_text == 'DE'
      );
    } else if (this.filterType == 'predis') {
      this.datareportCheckmedFilter = this.datareportCheckmedFilter.filter(
        (val: any) => val.position_text != 'PE' && val.position_text != 'DE'
      );
    } else {
      this.datareportCheckmedFilter = this.datareportCheckmedFilter;
    }

    this.numError.all = this.datareportCheckmedFilter.length;
    this.numError.pe = this.datareportCheckmedFilter.filter(
      (val: any) => val.position_text == 'PE'
    ).length;
    this.numError.de = this.datareportCheckmedFilter.filter(
      (val: any) => val.position_text == 'DE'
    ).length;

    this.numError.predis = this.datareportCheckmedFilter.filter(
      (val: any) => val.position_text != 'PE' && val.position_text != 'DE'
    ).length;

    this.dataSource5 = new MatTableDataSource(this.datareportCheckmedFilter);
    this.dataSource5.sort = this.sort5;
    this.dataSource5.paginator = this.paginator5;

    setTimeout(() => {
      this.input5.nativeElement.focus();
    }, 100);
  }
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
      // if (
      //   this.dataUser.user === 'admin' ||
      //   this.dataUser.user.toLowerCase() === 'p07' ||
      //   this.dataUser.user.toLowerCase() === 'p54' ||
      //   this.dataUser.user.toLowerCase() === 'test' ||
      //   this.dataUser.user.toLowerCase() === 'p22'
      // ) {
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
        'level',
        'occurrence',
        'source',
        'error_type',
        'site',
        'type_pre',
        'note',
        'hnDT',
        'createDT',
      ];
      // } else {
      // this.displayedColumns5 = [
      //   'hn',
      //   'location',
      //   'position_text',
      //   'type_text',
      //   'med_wrong_name',
      //   'med_wrong_text',
      //   'med_good_name',
      //   'med_good_text',
      //   'interceptor_name',
      //   'offender_name',
      //   'level',
      //   'occurrence',
      //   'source',
      //   'error_type',
      //   'note',
      //   'site',
      //   'hnDT',
      // ];
      // }

      let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
      let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
      let formData = {
        datestart: datestart,
        dateend: dateend,
        choice: this.choicecheckmed,
        time1: this.starttime + ':00',
        time2: this.endtime + ':00',
      };

      let getData: any = await this.http.postNodejs('reportcheckmed', formData);
      let dataDrug = getData.response.datadrugcheck;

      if (getData.connect) {
        if (dataDrug.length) {
          this.datareportCheckmed = dataDrug;
          await this.filter_type();
          // this.dataSource5 = new MatTableDataSource(this.datareportCheckmed);
          // this.dataSource5.sort = this.sort5;
          // this.dataSource5.paginator = this.paginator5;
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
        'queue',
        'hn',
        'timestamp',
        'checkComplete',
        'time',
      ];
      let datestart = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
      let dateend = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
      let formData = {
        datestart: datestart,
        dateend: dateend,
        time1: this.starttime + ':00',
        time2: this.endtime + ':00',
        choice: this.choicecheckmed,
      };

      let getData: any = await this.http.postNodejs('reportcheckmed', formData);

      if (getData.connect) {
        if (getData.response.datadrugcheck.length) {
          this.dataSource5 = new MatTableDataSource(
            getData.response.datadrugcheck
          );
          this.avgTime = getData.response.average;
          this.dataSource5.sort = this.sort5;
          this.dataSource5.paginator = this.paginator5;
          this.nameExcel5 = `รายงานเวลาเช็คยา ${datestart} ${this.starttime}:00_${dateend} ${this.endtime}:00`;
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
