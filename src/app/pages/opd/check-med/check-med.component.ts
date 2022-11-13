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
    'location',
    'position',
    'createdDT',
    'img',
  ];
  dataSource: any = null;
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
            formData.append('qn', getData2.response.result[0].QN);
            let getData3: any = await this.http.post('patient_drug', formData);

            if (getData3.connect) {
              if (getData3.response.rowCount > 0) {
                let getPathImg: any = await this.http.get('getPathImg');
                if (getPathImg.connect) {
                  if (getPathImg.response.rowCount > 0) {
                    this.patient_drug = getData3.response.result.map(
                      function (emp: { drugCode: any }) {
                        return {
                          ...emp,
                          ...(getPathImg.response.result.find(
                            (item: { drugCode: any }) =>
                              item.drugCode === emp.drugCode
                          ) ?? { pathImg: '' }),
                        };
                      }
                    );

                    this.patient_contract = getData.response.result[0];
                    this.Dataqandcheck = getData2.response.result[0];
                    setTimeout(() => {
                      this.drugbar.nativeElement.focus();
                    }, 100);
                    this.dataSource = new MatTableDataSource(this.patient_drug);
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                  } else {
                    this.data_drug = null;
                  }
                } else {
                  Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
                }
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
      (element: any) => element.drugCode === val.trim()
    );

    const { value: formValues } = await Swal.fire({
      title: 'จำนวนยา',
      html: '<input id="swal-input1" type="number" min="1" class="swal2-input">',
      focusConfirm: false,
      allowEnterKey: true,
      preConfirm: () => {
        if ((<HTMLInputElement>document.getElementById('swal-input1')).value) {
          if (
            Number(
              (<HTMLInputElement>document.getElementById('swal-input1')).value
            ) > 0
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
      if (formValues[0] < founddrug.amount) {
        Swal.fire('จำนวนยาไม่ครบ!', '', 'error');
      } else if (formValues[0] > founddrug.amount) {
        Swal.fire('จำนวนยาเกิน!', '', 'error');
      } else {
        let getData = await this.testPDF(founddrug);
      }

      // let formData = new FormData();
      // formData.append('barcode', val);
      // let getData: any = await this.http.post('drugBarcode', formData);
      // if (getData.connect) {
      //   if (getData.response.rowCount > 0) {
      //     let data = getData.response.result[0];
      //     Swal.fire({
      //       icon: 'success',
      //       title: `ตรวจยา ${data.drugName}\n เสร็จสิ้น`,
      //       showConfirmButton: false,
      //       timer: 1500,
      //     });
      //   } else {
      //     Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
      //   }
      // } else {
      //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      // }
    }
  }

  testPDF(data: any) {
    var docDefinition = {
      // pageSize: { width: 325, height: 350 },
      pageSize: { width: 238, height: 255 },
      // pageMargins: [5, 50, 5, 100] as any,
      pageMargins: [0, 35, 2, 35] as any,
      header: {} as any,
      footer: [
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 },
          ] as any,
        },
        {
          columns: [
            {
              width: 180,
              text: 'ชื่อสามัญ : \n' + 'ข้อบ่งใช้ : ',
              fontSize: 12,
              margin: [20, 0],
            },

            {
              width: '*',
              qr: data.drugCode,
              fit: '40',
              margin: [0, 2, 0, 0],
            } as any,
          ],
        },
      ] as any,

      content: [
        {
          columns: [
            {
              width: 150,
              text: 'ชื่อ นาง พุทธชาติ ประพรม',
              bold: true,
              style: 'margin',
            },
            {
              width: '*',
              text: 'HN: 960023',
              bold: true,
              style: 'margin',
            },
          ],
        },
        {
          text: 'สิทธิ : บัตรทอง / ED / ปกติ',
          bold: true,
          style: 'margin',
        },
        {
          columns: [
            {
              width: 160,
              text: 'วันที่ 10/11/2022',
              fontSize: 14,
              style: 'margin',
            },
            {
              width: '*',
              text: 'รายการ (1/1)',
              fontSize: 14,
              style: 'margin',
            },
          ],
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 },
          ] as any,
        },
        {
          columns: [
            {
              width: 180,
              text: data.drugName,
              bold: true,
              style: 'margin',
            },
            {
              width: '*',
              text: '#' + data.amount + ' ' + data.takeUnit,
              bold: true,
              style: 'margin',
            },
          ],
        },
        {
          text: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ',
          fontSize: 14,
          alignment: 'center' as any,
        },
        {
          text: 'เวลา 20.00 น.',
          fontSize: 14,
          alignment: 'center' as any,
        },
        {
          text: 'รับประทานยาในเวลาเดียวกันของทุกวัน',
          fontSize: 14,
          alignment: 'center' as any,
        },
        {
          text: 'ควรดื่มน้ำอย่างน้อยวันละ 3ลิตร',
          fontSize: 14,
          alignment: 'center' as any,
        },
      ],
      styles: {
        margin: {
          margin: [2, 0, 0, 0],
        } as any,
      },

      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 16,
        bold: true,
      },
    };
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBase64(async (buffer) => {
      let getData: any = await this.http.testPrintjs('convertbuffer', {
        data: buffer,
        name: 'testpdf' + '.pdf',
      });
      if (getData.connect) {
        if (getData.response.connect === 'success') {
          Swal.fire('ส่งข้อมูลสำเร็จ', '', 'success');
          return true;
        } else {
          Swal.fire('ไม่สามารถ Printer ได้!', '', 'error');
          return false;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!', '', 'error');
        return false;
      }
    });
    // pdfMake.createPdf(docDefinition).open();
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
}
