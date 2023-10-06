import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-report-phar',
  templateUrl: './report-phar.component.html',
  styleUrls: ['./report-phar.component.scss'],
})
export class ReportPharComponent implements OnInit {
  public campaignOne = new FormGroup({
    start: new FormControl(new Date(new Date())),
    end: new FormControl(new Date(new Date())),
  });
  public starttime = '08:00';
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  public endtime = '16:00';
  public dataDrug: any = null;
  public dataSource: any = null;
  public displayedColumns: string[] = [
    'checker_id',
    'checker_name',

    'order',
    'item',
  ];

  public displayedColumns2: string[] = ['staff', 'staffName', 'item'];

  public displayedColumns3: string[] = [
    'dispenser_id',
    'dispenser_name',

    'order',
    'item',
  ];
  public displayedColumns4: string[] = [
    'patientNO',
    'QN',
    'patientName',
    'checker_id',
    'checker_name',
    'check_time',
    'dispenser_id',
    'dispenser_name',
    'dispens_time',
    'createDT_Q',
  ];

  select = '';

  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatSort3') sort3!: MatSort;
  @ViewChild('MatSort4') sort4!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatPaginator3') paginator3!: MatPaginator;
  @ViewChild('MatPaginator4') paginator4!: MatPaginator;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private https: HttpClient
  ) {
    this.dateAdapter.setLocale('en-GB');
    if (this.dataUser.role === 'officer') {
      this.numTab = 4;
    }
    this.getData();

    // this.getData2();
  }

  ngOnInit(): void {}
  public nameExcel = '';
  public getData = async () => {
    this.dataDrug = null;
    const start = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    const end = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
    let getData: any = null;
    let formData = new FormData();

    formData.append('time1', this.starttime + ':00');
    formData.append('time2', this.endtime + ':00');
    formData.append('date1', start);
    formData.append('date2', end);
    formData.append('site', this.select);
    // formData.forEach((value, key) => {
    //   console.log(key + '=' + value);
    // });
    if (this.numTab == 2) {
      getData = await this.http.post('onusPhar', formData);
      let getData2: any = await this.http.post('getUserall', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result.map((e: any) => {
            let temp = getData2.response.result.find(
              (element: any) => element.staff === e.staff
            );

            if (temp) {
              if (temp.staffName) {
                e.staffName = temp.staffName;
              }
            }

            return e;
          });

          // this.dataDrug= getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.nameExcel = `ภาระงานผู้ช่วยเภสัชประจำตู้ ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 0) {
      getData = await this.http.post('checkerPhar_copy', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort2;
          this.dataSource.paginator = this.paginator2;
          this.nameExcel = `ภาระงานเภสัชตรวจยา(${this.select}) ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 1) {
      getData = await this.http.post('dispenserPhar_copy', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort3;
          this.dataSource.paginator = this.paginator3;
          this.nameExcel = `ภาระงานเภสัชจ่ายยา(${this.select}) ${start} ${this.starttime}:00 - ${end} ${this.endtime}:00`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 3) {
      getData = await this.http.post('reportPharCheckandDispend', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.dataDrug = getData.response.result;
          this.dataSource = new MatTableDataSource(this.dataDrug);
          this.dataSource.sort = this.sort4;
          this.dataSource.paginator = this.paginator4;
          this.nameExcel = `รายงานเภสัชเช็คยาและจ่ายยา`;
        } else {
          this.dataDrug = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    } else if (this.numTab == 4) {
      this.reportCheckmed();
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  valuechange() {
    this.getData();
  }

  clearValue() {
    // new Date(new Date().setDate(new Date().getDate() - 1)),
    this.campaignOne = this.formBuilder.group({
      start: [new Date(new Date()), Validators.required],
      end: [new Date(new Date()), Validators.required],
    });
    this.starttime = '08:00';
    this.endtime = '16:00';
    this.getData();
  }

  numTab = 0;
  public getTab(num: any) {
    this.numTab = num;

    this.getData();
  }

  changeFloor() {
    this.getData();
  }
  nameExcel5 = '';
  dataSource5: any = null;
  displayedColumns5: any = null;
  @ViewChild('input5') input5!: ElementRef;
  @ViewChild('MatSort5') sort5!: MatSort;
  @ViewChild('MatPaginator5') paginator5!: MatPaginator;
  choicecheckmed = '1';
  avgTime: any = '';
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
      if (
        this.dataUser.user === 'admin' ||
        this.dataUser.user.toLowerCase() === 'p07' ||
        this.dataUser.user.toLowerCase() === 'p54' ||
        this.dataUser.user.toLowerCase() === 'test'
      ) {
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
          'hnDT',
        ];
      } else {
        this.displayedColumns5 = [
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
          'hnDT',
        ];
      }

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
  userList: any = null;
  drugList: any = null;
  public manageErrormed = async (val: any, text: any) => {
    this.medError.reset();

    val.date = moment(val.hnDT).format('YYYY-MM-DD');
    let getData3: any = await this.http.postNodejs('getCompiler', {
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

          let dataUser: any = await this.http.postNodejs('positionError', {
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

          if (val.position_text === 'จ่าย') {
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
    await this.getDataposition();
    await this.getDatatype();

    let fineTy = this.typeE.find((ty: any) => ty === val.type_text) ?? 'other';
    this.medError.patchValue({
      med: val.med,
      hn: val.hn,
      location: val.location,
      position: finePo,
      position_text: finePo === 'other' ? val.position_text : '',
      type: fineTy,
      type_text: fineTy === 'other' ? val.type_text : '',
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
    });
    if (text === 'edit') {
      finePo === 'other'
        ? (this.setText.textposition = true)
        : (this.setText.textposition = false);
      fineTy === 'other'
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
          this.submitInput();
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
    id: new FormControl(''),
    check: new FormControl(''),
    userLogin: new FormControl(''),
  });
  dataUsercheck: any = null;
  positionE: string[] = ['key', 'จัด', 'check', 'จ่าย', 'other'];
  typeE: string[] = [
    'จำนวน',
    'วิธีใช้',
    'ความแรง',
    'รูปแแบบ',
    'ชนิด',
    'ชื่อผู้ป่วย',
    'ไม่ปฎิบัติ',
    'ไม่มี Order',
    'ผิดโครงการ',
    'other',
  ];
  async reportError(val: any) {
    let dataUser: any = await this.http.postNodejs('positionError', {
      ...val.dataP,
      ...val.item,
      site: this.select,
    });

    let positionError = {
      key: '',
      check: '',
      dispend: '',
    };
    if (dataUser.connect) {
      positionError = {
        key: dataUser.response.key,
        check: dataUser.response.check,
        dispend: dataUser.response.dispend,
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
    await this.getDataposition();
    await this.getDatatype();
    let win: any = window;
    win.$('#check_error').modal('show');
  }
  public async submitInput() {
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

    if (this.medError.value.id) {
    }
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
        Swal.fire('ไม่มีข้อมูล!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    //   }
    // });
  }
  getDatatype() {
    if (this.medError.value.type === 'other') {
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
      });
      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort: val.user.toLowerCase().charAt(0) == 'c' ? 1 : 2,
        };
      });
      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
    } else if (this.medError.value.position === 'จัด') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.userName,
        position_text: this.medError.value.position,
      });

      this.userList = this.userList.map((val: any) => {
        return {
          ...val,
          valSort: val.user.toLowerCase().charAt(0) == 'o' ? 1 : 2,
        };
      });
      this.userList.sort((a: any, b: any) => a.valSort - b.valSort);
    } else if (this.medError.value.position === 'check') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.check,
        position_text: this.medError.value.position,
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
    } else if (this.medError.value.position === 'จ่าย') {
      this.setText.textposition = false;
      this.medError.patchValue({
        offender: this.dataUsercheck.dispend,
        position_text: this.medError.value.position,
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
    } else {
      this.setText.textposition = true;
      this.medError.patchValue({
        offender: '',
        position_text: '',
      });
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
  public endChange(event: any) {
    this.reportCheckmed();
  }
}
