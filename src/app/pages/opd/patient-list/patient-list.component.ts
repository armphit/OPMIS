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

  public numOrder: any = null;
  public dataSource: any = null;
  public displayedColumns: any = null;

  public inputGroup: any = null;
  public queue: string = '';
  public nameT: string = '';
  public brithdayT: string = '';
  public hnT: string = '';
  public ageT: string = '';
  public moph_patient: any = null;
  @Input() max: any;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  public dataDrug: any = null;
  @ViewChild('swiper') swiper!: ElementRef;
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    public gallery: Gallery,
    public lightbox: Lightbox
  ) {
    this.dateAdapter.setLocale('en-GB');

    // this.getData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 0);
  }

  ngOnInit(): void {}

  public getData = async () => {
    // if (this.hnPatient) {
    const start = moment(this.campaignTwo.value.picker1).format('YYYY-MM-DD');

    let formData = new FormData();

    formData.append('hn', this.hnPatient);
    formData.append('start', start);
    let getData: any = await this.http.post('getPatientDrug', formData);

    if (getData.connect) {
      this.displayedColumns = [
        // 'position',
        'drugCode',
        'drugName',
        'qty',
        'unit',
        'lastmodified',
        'pathImage',
      ];

      if (getData.response.rowCount > 0) {
        this.dataPharmacist = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataPharmacist);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.nameT = getData.response.result[0].patientname;
        let date = moment(getData.response.result[0].birthDate);
        this.brithdayT = date.locale('th').add(543, 'year').format('LL');
        this.hnT = getData.response.result[0].hn;
        this.ageT = getData.response.result[0].age;
        let getData2: any = await this.http.post('hn_moph_patient', formData);

        if (getData2.connect) {
          if (getData2.response.rowCount > 0) {
            this.moph_patient = getData2.response.result;
          } else {
            this.moph_patient = null;
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
        let getData3: any = await this.http.post('DataQ', formData);
        if (getData3.connect) {
          if (getData3.response.rowCount > 0) {
            this.queue = getData3.response.result[0].QN;
          } else {
            this.queue = '';
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        this.dataPharmacist = null;
        this.nameT = '';
        this.brithdayT = '';
        this.hnT = '';
        this.ageT = '';
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
  public startChange2(event: any) {
    this.getData();
  }
  public sendit(data: any) {
    this.dataPharmacist = null;
    this.nameT = '';
    this.brithdayT = '';
    this.hnT = '';
    this.ageT = '';
    this.moph_patient = null;
    this.queue = '';
    this.hnPatient = null;
    this.hnPatient = data.trim();
    this.getData();
  }
  public imageData: any = null;
  items!: GalleryItem[];
  async getArrImg(val: any) {
    let formData = new FormData();

    formData.append('drugCode', val.drugCode);
    let getDrug: any = await this.http.post('drugImg', formData);

    this.imageData = getDrug.response.result;

    this.items = this.imageData.map(
      (item: any) =>
        new ImageItem({
          src: this.http.imgPath + item.pathImage,
          thumb: this.http.imgPath + item.pathImage,
        })
    );

    /** Lightbox Example */

    // Get a lightbox gallery ref
    const lightboxRef = this.gallery.ref('lightbox');

    // Add custom gallery config to the lightbox (optional)
    lightboxRef.setConfig({
      // imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Top,
    });

    // Load items into the lightbox gallery ref
    lightboxRef.load(this.items);
  }
}
