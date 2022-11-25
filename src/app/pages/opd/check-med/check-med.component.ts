import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  Gallery,
  GalleryItem,
  ImageItem,
  ThumbnailsPosition,
} from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';
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
  selector: 'app-check-med',
  templateUrl: './check-med.component.html',
  styleUrls: ['./check-med.component.scss'],
})
export class CheckMedComponent implements OnInit {
  data_contract: any = null;
  data_drug: any = null;
  @ViewChild('swiper') swiper!: ElementRef;
  @ViewChild('drugbar') drugbar!: ElementRef;
  displayedColumns: string[] = [
    'drugCode',
    'drugName',
    'amount',
    'takeUnit',
    'createdDT',
    'img',
  ];
  dataSource: any = null;
  selectedRowIndex: any;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private http: HttpService,
    public lightbox: Lightbox,
    public gallery: Gallery
  ) {}

  ngOnInit(): void {}
  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 100);
  }
  getHN(hn: any) {
    this.getData(hn);
  }

  patient_contract: any = null;
  Dataqandcheck: any = null;
  patient_drug: any = [];
  panelOpenState = true;
  async getData(hn: any) {
    let formData = new FormData();
    formData.append('hn', hn.trim());

    let getData: any = await this.http.post('patient_contract', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getData2: any = await this.http.post('Datacheckdrug', formData);

        if (getData2.connect) {
          if (getData2.response.rowCount > 0) {
            let getData3: any = await this.http.post('patient_drug', formData);

            if (getData3.connect) {
              if (getData3.response.rowCount > 0) {
                this.patient_drug = getData3.response.result;
                this.patient_contract = getData.response.result[0];
                this.Dataqandcheck = getData2.response.result[0];

                setTimeout(() => {
                  this.drugbar.nativeElement.focus();
                }, 100);
                this.dataSource = new MatTableDataSource(this.patient_drug);
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
              } else {
                Swal.fire('ไม่สามารถเชื่อม patient_drug ได้!', '', 'error');
              }
            } else {
              Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
          } else {
            // this.data_drug = null;
            Swal.fire('ไม่สามารถเชื่อม dataQ ได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อม patient_contract ได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async getDrug(val: any) {
    let founddrug = this.patient_drug.find(
      (element: any) =>
        element.orderitemcode.toLowerCase() === val.trim().toLowerCase()
    );
    let formData = new FormData();
    formData.append('hn', founddrug.hn);
    formData.append('seq', founddrug.seq);
    formData.append('orderitemcode', founddrug.orderitemcode);
    formData.append('lastmodified', founddrug.lastmodified);

    let getData: any = await this.http.post('updateCheckmed', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getData3: any = await this.http.post('patient_drug', formData);

        if (getData3.connect) {
          if (getData3.response.rowCount > 0) {
            this.patient_drug = getData3.response.result;

            setTimeout(() => {
              this.drugbar.nativeElement.focus();
            }, 100);
            this.dataSource = new MatTableDataSource(this.patient_drug);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          } else {
            Swal.fire('ไม่สามารถเชื่อม patient_drug ได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อม updateCheckmed ได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    // const { value: formValues } = await Swal.fire({
    //   title: 'จำนวนยา',
    //   html: '<input id="swal-input1" type="number" min="1" class="swal2-input">',
    //   focusConfirm: false,
    //   allowEnterKey: true,
    //   preConfirm: () => {
    //     if ((<HTMLInputElement>document.getElementById('swal-input1')).value) {
    //       if (
    //         Number(
    //           (<HTMLInputElement>document.getElementById('swal-input1')).value
    //         ) > 0
    //       ) {
    //         return [
    //           (<HTMLInputElement>document.getElementById('swal-input1')).value,
    //         ];
    //       } else {
    //         Swal.showValidationMessage('Invalid number');
    //         return undefined;
    //       }
    //     } else {
    //       Swal.showValidationMessage('Please input number');
    //       return undefined;
    //     }
    //   },
    // });
    // if (formValues) {
    //   if (founddrug) {
    //     if (formValues[0] < founddrug.amount) {
    //       Swal.fire('จำนวนยาไม่ครบ!', '', 'error');
    //     } else if (formValues[0] > founddrug.amount) {
    //       Swal.fire('จำนวนยาเกิน!', '', 'error');
    //     } else {
    //       let getData = await this.testPDF(founddrug);
    //     }
    //   } else {
    //     Swal.fire('ไม่มียานี้ในรายการ!', '', 'error');
    //   }
    // }
  }

  testPDF(data: any) {
    let namePatient = this.Dataqandcheck.patientName;

    if (namePatient.length > 25) {
      namePatient = namePatient.substring(0, 25);
      namePatient = namePatient + '...';
    }
    let nameDrug = data.drugName;

    if (nameDrug.length > 57) {
      nameDrug = nameDrug.substring(0, 54);
      nameDrug = nameDrug + '...';
    }

    var docDefinition = {
      pageSize: { width: 238, height: 255 },
      pageMargins: [0, 36, 10, 32] as any,
      header: {} as any,

      content: [
        {
          columns: [
            {
              width: 160,
              text: namePatient,
            },
            {
              width: '*',
              text: this.patient_contract.hn,
              alignment: 'right',
            },
          ],
          fontSize: 18,
          bold: true,
        },
        {
          text: 'สิทธิ : บัตรทอง / ED / ปกติ',
          fontSize: 18,
          bold: true,
        },
        {
          columns: [
            {
              width: 170,
              text: 'วันที่ 08/11/2022',
            },
            {
              width: '*',
              text: 'รายการ (18/18)',

              alignment: 'right',
            },
          ],
          fontSize: 14,
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 },
          ],
        },
        {
          columns: [
            {
              width: 180,
              text: nameDrug,
            },
            {
              width: '*',
              text: '#' + data.amount + ' ' + data.takeUnit,
              alignment: 'right',
            },
          ],
          bold: true,
          fontSize: 16,
        },

        {
          text: 'รับประทาน' + 'วันละ 1 ครั้ง ,ก่อนอาหารเช้า ',
          bold: true,
          margin: [10, 0],
          fontSize: 14,
          alignment: 'center',
        },
        {
          text: 'เม็ดกลมสีชมพู,ยาป้องกันหลอดเลือดอุดตัน,',
          margin: [10, 0],
          fontSize: 14,
          alignment: 'center',
        },
        {
          text: 'รับประทานหลังอาหารทันทีแล้วดื่มน้ำตามมากๆ, หลีกเลื่ยงการหักแบ่ง บด เคี้ยวหรือทำให้เม็ดยาแตก',
          margin: [10, 0],
          fontSize: 14,
          alignment: 'center',
        },
      ] as any,

      footer: [
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 },
          ],
        },
        {
          columns: [
            {
              width: 210,
              text: 'ชื่อสามัญ : \n' + 'ข้อบ่งใช้ : ',
              fontSize: 12,
            },

            { width: '*', qr: 'test', fit: '41', margin: [0, 5, 0, 0] },
          ],
        },
      ] as any,

      defaultStyle: {
        font: 'THSarabunNew',
      },
    };
    // const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    // pdfDocGenerator.getBase64(async (buffer) => {
    //   let getData: any = await this.http.testPrintjs('convertbuffer', {
    //     data: buffer,
    //     name: 'testpdf' + '.pdf',
    //   });
    //   if (getData.connect) {
    //     if (getData.response.connect === 'success') {
    //       Swal.fire('ส่งข้อมูลสำเร็จ', '', 'success');
    //       return true;
    //     } else {
    //       Swal.fire('ไม่สามารถ Printer ได้!', '', 'error');
    //       return false;
    //     }
    //   } else {
    //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!', '', 'error');
    //     return false;
    //   }
    // });
    pdfMake.createPdf(docDefinition).open();
  }

  data_allergic: any = null;
  showAllergic = async (data: any) => {
    let formData = new FormData();
    formData.append('cid', data);

    let getData3: any = await this.http.post('drug_allergic', formData);

    if (getData3.connect) {
      if (getData3.response.rowCount > 0) {
        this.data_allergic = getData3.response.result;

        let win: any = window;
        win.$('#exampleModal').modal('show');
      } else {
        this.data_drug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

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

  currentSection = 'section1';

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }
}
