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
import {
  Gallery,
  GalleryItem,
  ImageItem,
  ThumbnailsPosition,
} from 'ng-gallery';
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
          new Set(getmoph_patient.response.result.map((s: { hn: any }) => s.hn))
        ).map((lab) => {
          return {
            hn: lab,
            drugcode: getmoph_patient.response.result
              .filter((s: { hn: any }) => s.hn === lab)
              .map((edition: { drugcode: any }) => edition.drugcode),
            drugname: getmoph_patient.response.result
              .filter((s: { hn: any }) => s.hn === lab)
              .map((edition: { drugname: any }) => edition.drugname),
            check: 'Y',
          };
        });

        var finalVal = getData.response.result.map(function (emp: {
          patientNO: any;
        }) {
          return {
            ...emp,
            ...(result.find(
              (item: { hn: any }) => item.hn === emp.patientNO
            ) ?? { drugcode: [], drugname: [], check: 'N' }),
          };
        });

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
        formData.append('hn', this.dataP.hn);
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
}
