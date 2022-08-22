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

  // public inputGroup: any = null;
  // public queue: string = '';
  // public nameT: string = '';
  // public brithdayT: string = '';
  // public hnT: string = '';
  // public ageT: string = '';
  // public moph_patient: any = null;
  @Input() max: any;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  public dataDrug = new Array();
  // @ViewChild('swiper') swiper!: ElementRef;
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
    // setTimeout(() => {
    //   this.swiper.nativeElement.focus();
    // }, 0);
  }

  ngOnInit(): void {}

  public getData = async () => {
    this.displayedColumns = [
      'patientNO',
      'QN',
      'patientName',
      'createDT',
      'drugcode',
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
          };
        });

        var finalVal = getData.response.result.map(function (emp: {
          patientNO: any;
        }) {
          return {
            ...emp,
            ...(result.find(
              (item: { hn: any }) => item.hn === emp.patientNO
            ) ?? { drugcode: [], drugname: [] }),
          };
        });

        this.dataSource = new MatTableDataSource(finalVal);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataSource = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    // }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dataP: any = null;
  datatime: any = null;
  public clickdrugAllergy(data: any) {
    this.datatime = data.timestamp;

    this.dataP = data;
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
  }

  close() {
    setTimeout(() => {
      this.dataP = null;
      this.dataDrug = [];
    }, 500);
  }
  async confirm() {
    const { value: formValues } = await Swal.fire({
      title: 'Confirm',
      html: `<div class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text">User</span>
        </div>
        <input type="text" class="form-control" id="user" aria-describedby="basic-addon3">
      </div>
      <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">Password</span>
      </div>
      <input type="text" class="form-control" id="pass" aria-describedby="basic-addon3">
    </div>`,
      focusConfirm: false,
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      // preConfirm: () => {
      //   if (
      //     (<HTMLInputElement>document.getElementById('user')).value == 'opd' &&
      //     (<HTMLInputElement>document.getElementById('pass')).value == '1234'
      //   ) {
      //     return true;
      //   } else {
      //     return false;
      //     Swal.fire('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!', '', 'error');
      //   }
      //   // Prevent confirmed
      // },

      preConfirm: async () => {
        let in1 = (<HTMLInputElement>document.getElementById('user')).value;
        let in2 = (<HTMLInputElement>document.getElementById('pass')).value;

        if (in1 == 'opd' && in2 == '1234') {
          let formData = new FormData();
          formData.append('queue', this.dataP.QN);
          formData.append('hn', this.dataP.hn);

          let getData: any = await this.http.post('add_moph_confirm', formData);
          if (getData.connect) {
            if (getData.response.rowCount > 0) {
              let win: any = window;
              win.$('#drugAllergy').modal('hide');
              Swal.fire('การยืนยันเสร็จสิ้น', '', 'success');
              this.dataDrug = [];
              this.dataP = null;
            } else {
              Swal.fire('การยืนยันข้อมูลไม่สำเร็จ', '', 'error');
            }
          } else {
            Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
          }
        } else {
          Swal.fire('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!', '', 'error');
          // return false
        }
        // return [
        //   document.getElementById('swal-input1').value,
        //   document.getElementById('swal-input2').value
        // ]
      },
    });
  }
  // public startChange2(event: any) {
  //   this.getData();
  // }
  // public sendit(data: any) {
  //   this.dataPharmacist = null;
  //   this.nameT = '';
  //   this.brithdayT = '';
  //   this.hnT = '';
  //   this.ageT = '';
  //   this.moph_patient = null;
  //   this.queue = '';
  //   this.hnPatient = null;
  //   this.hnPatient = data.trim();
  //   this.getData();
  // }
  // public imageData: any = null;
  // items!: GalleryItem[];
  // async getArrImg(val: any) {
  //   let formData = new FormData();

  //   formData.append('drugCode', val.drugCode);
  //   let getDrug: any = await this.http.post('drugImg', formData);

  //   this.imageData = getDrug.response.result;

  //   this.items = this.imageData.map(
  //     (item: any) =>
  //       new ImageItem({
  //         src: this.http.imgPath + item.pathImage,
  //         thumb: this.http.imgPath + item.pathImage,
  //       })
  //   );

  //   /** Lightbox Example */

  //   // Get a lightbox gallery ref
  //   const lightboxRef = this.gallery.ref('lightbox');

  //   // Add custom gallery config to the lightbox (optional)
  //   lightboxRef.setConfig({
  //     // imageSize: ImageSize.Cover,
  //     thumbPosition: ThumbnailsPosition.Top,
  //   });

  //   // Load items into the lightbox gallery ref
  //   lightboxRef.load(this.items);
  // }
}
