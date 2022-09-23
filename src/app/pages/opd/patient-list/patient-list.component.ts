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
import { log } from 'console';
import * as moment from 'moment';
import { Gallery } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';
import { interval, Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit, AfterViewInit {
  public Date = new Date();
  public dataPharmacist: any = null;
  public campaignTwo = new FormGroup({
    picker1: new FormControl(new Date(), [Validators.required]),
  });
  public startDate: any = null;
  public endDate: any = null;
  public hnPatient: any = null;
  public dataSource: any = null;
  public displayedColumns: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

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
      this.filterValues.patientNO = patientNO;
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
    this.displayedColumns = [
      'patientNO',
      'QN',
      'patientName',
      'createDT',
      'druglist',
      // 'check',
      'timestamp',
    ];

    let getData: any = await this.http.get('listPatientQ');
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getmoph_patient: any = await this.http.get('list_moph_patient');

        const result = Array.from(
          new Set(
            getmoph_patient.response.result.map((s: { cid: any }) => s.cid)
          )
        ).map((lab) => {
          return {
            cid: lab,
            drugcode: getmoph_patient.response.result
              .filter((s: { cid: any }) => s.cid === lab)
              .map((edition: { drugcode: any }) => edition.drugcode),
            drugname: getmoph_patient.response.result
              .filter((s: { cid: any }) => s.cid === lab)
              .map((edition: { drugname: any }) => edition.drugname),
            hospcode: getmoph_patient.response.result
              .filter((s: { cid: any }) => s.cid === lab)
              .map((edition: { hospcode: any }) => edition.hospcode),
            daterecord: getmoph_patient.response.result
              .filter((s: { cid: any }) => s.cid === lab)
              .map((edition: { daterecord: any }) => edition.daterecord),
          };
        });

        var finalVal = getData.response.result.map(function (emp: {
          cid: any;
        }) {
          return {
            ...emp,
            ...(result.find((item: { cid: any }) => item.cid === emp.cid) ?? {
              drugcode: [],
              drugname: [],
              hospcode: [],
              daterecord: [],
            }),
          };
        });

        // var finalVal = Array.from(
        //   new Set(getData.response.result.map((s: any) => s))
        // ).map((lab: any) => {
        //   return {
        //     cid: lab.cid,
        //     patientNO: lab.patientNO,
        //     QN: lab.QN,
        //     patientName: lab.patientName,
        //     createDT: lab.createDT,
        //     timestamp: lab.timestamp,
        //     check: lab.check,
        //     drugcode: getData.response.result
        //       .filter((s: { cid: any }) => s.cid === lab.cid)
        //       .map((edition: { drugcode: any }) => edition.drugcode),
        //     drugname: getData.response.result
        //       .filter((s: { cid: any }) => s.cid === lab.cid)
        //       .map((edition: { drugname: any }) => edition.drugname),
        //   };
        // });

        this.dataSource = new MatTableDataSource(finalVal);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.createFilter();
      } else {
        this.dataSource = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
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

  drugPatient: any = null;
  test: any = false;
  namePhar = '';
  listDrug = async (val: any) => {
    this.hncut = null;
    this.dataP = null;
    this.dataDrug = [];
    this.datatime = null;
    this.checkdrug = null;

    this.datatime = val.timestamp;
    this.checkdrug = val.check;

    this.dataP = val;

    if (this.dataP) {
      for (let index = 0; index < this.dataP.drugcode.length; index++) {
        this.dataDrug[index] = {
          drugcode: this.dataP.drugcode[index],
          drugname: this.dataP.drugname[index],
          hospcode: this.dataP.hospcode[index],
          daterecord: this.dataP.daterecord[index],
        };
      }
    } else {
      this.dataDrug = [];
    }

    let formData = new FormData();
    formData.append('hn', val.patientNO);
    formData.append(
      'date',
      moment(new Date()).add(543, 'year').format('YYYYMMDD')
    );
    formData.append('queue', val.QN);
    let getData: any = await this.http.post('getdrugHomc', formData);
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
      html: '<input id="swal-input1" type="number" min="1" class="swal2-input">',
      focusConfirm: false,
      allowEnterKey: true,
      preConfirm: () => {
        if ((<HTMLInputElement>document.getElementById('swal-input1')).value) {
          if (
            Number(
              (<HTMLInputElement>document.getElementById('swal-input1')).value
            ) <= Number(val.qty)
          ) {
            return [
              (<HTMLInputElement>document.getElementById('swal-input1')).value,
            ];
          } else {
            Swal.showValidationMessage('Invalid number');
            return undefined;
          }
        } else {
          Swal.showValidationMessage('Please input number');
          return undefined;
        }
      },
    });

    if (formValues) {
      let balanceamount = Number(val.qty) - Number(formValues[0]);
      let formData = new FormData();
      formData.append('drugcode', val.drugCode);
      formData.append('drugname', val.drugName);
      formData.append('phar', this.dataUser.user);
      formData.append('hn', this.dataP.patientNO);
      formData.append('cutamount', formValues[0]);
      formData.append('realamount', val.qty);
      formData.append('balanceamount', String(balanceamount));

      let getData: any = await this.http.post('insertCutDispendDrug', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          Swal.fire({
            icon: 'success',
            title: `ตัดจ่ายยา ${val.drugName}\n เสร็จสิ้น`,
            showConfirmButton: false,
            timer: 1500,
          });
          this.getData();
        } else {
          Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
      // this.dataDrug = [];
      // this.dataP = null;
      // this.nameFilter.setValue('');
      // this.idFilter.setValue('');
      // this.setFocus();
    }
  }

  drugcut: any = null;
  hncut: any = null;

  async drugCut(data: any) {
    this.hncut = null;
    this.dataP = null;
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
            amount: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { amount: any }) => edition.amount),
            phar2: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { phar2: any }) => edition.phar2),
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
          delete element['amount'];
          delete element['phar2'];
          delete element['datetime'];
        });

        this.drugcut = dataOwe.map(function (emp: { id: any }) {
          return {
            ...emp,
            ...(result.find((item: { id: any }) => item.id === emp.id) ?? {
              amount: [],
              phar2: [],
              datetime: [],
            }),
          };
        });
        console.log(this.drugcut);
      } else {
        this.drugcut = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  async dispendDrug(data: any) {
    const { value: formValues } = await Swal.fire({
      title: 'จำนวนตัดจ่าย',
      html: '<input id="swal-input1" type="number" min="1" class="swal2-input">',
      focusConfirm: false,
      allowEnterKey: true,
      preConfirm: () => {
        if ((<HTMLInputElement>document.getElementById('swal-input1')).value) {
          if (
            Number(data.balanceamount) -
              Number(
                (<HTMLInputElement>document.getElementById('swal-input1')).value
              ) >=
            0
          ) {
            return [
              (<HTMLInputElement>document.getElementById('swal-input1')).value,
            ];
          } else {
            Swal.showValidationMessage('Invalid number');
            return undefined;
          }
        } else {
          Swal.showValidationMessage('Please input number');
          return undefined;
        }
      },
    });

    if (formValues) {
      let amountB = Number(data.balanceamount) - Number(formValues[0]);

      let formData = new FormData();
      formData.append('cdd_id', data.id);
      formData.append('phar', this.dataUser.user);
      formData.append('balanceamount', String(amountB));
      formData.append('amount', String(formValues[0]));

      let getData: any = await this.http.post('insertCutDispendOwe', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          let getData2: any = await this.http.post(
            'updateCutDispendDrug',
            formData
          );

          if (getData2.connect) {
            if (getData2.response.rowCount > 0) {
              if (amountB === 0) {
                this.getData();
                let win: any = window;
                win.$('#modal_owe').modal('hide');
              } else {
                this.drugCut({ patientNO: this.hncut });
              }

              Swal.fire({
                icon: 'success',
                title:
                  amountB === 0
                    ? `ตัดจ่ายยา ${data.drugname}\n เสร็จสิ้น`
                    : `ตัดจ่ายยา ${data.drugname}\n คงเหลือ ${amountB}`,
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
}
