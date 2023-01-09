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
import * as moment from 'moment';
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
  countcheck: any = null;
  @ViewChild('swiper') swiper!: ElementRef;
  @ViewChild('drugbar') drugbar!: ElementRef;
  displayedColumns: string[] = [
    'drugCode',
    'drugName',
    'default_qty',
    'current_qty',
    'unitCode',
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
  dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  drug_xmed: any = [];
  async getData(hn: any) {
    this.countcheck = 0;
    let formData = new FormData();
    formData.append('hn', hn.trim());
    formData.append(
      'date',
      moment(new Date()).add(543, 'year').format('YYYYMMDD')
    );

    let getData: any = await this.http.post('patient_contract', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getData2: any = await this.http.post('Datacheckdrug', formData);

        if (getData2.connect) {
          if (getData2.response.rowCount > 0) {
            let data_send = {
              hn: hn.trim(),
              date: moment(new Date()).add(543, 'year').format('YYYYMMDD'),
            };

            let getData3: any = await this.http.postNodejs(
              'checkpatient',
              data_send
            );

            if (getData3.connect) {
              if (getData3.response.datadrugpatient.length > 0) {
                this.patient_drug = getData3.response.datadrugpatient;
                this.patient_contract = getData.response.result[0];
                this.Dataqandcheck = getData2.response.result[0];
                this.drug_xmed = getData3.response.patientDrug;

                this.countcheck = this.patient_drug.filter(function (
                  item: any
                ) {
                  if (item.checkstamp) {
                    return true;
                  } else {
                    return false;
                  }
                }).length;

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
    let founddrug: any = null;
    let formData = new FormData();
    formData.append('barcode', val);
    let getBarcode: any = await this.http.post('drugBarcode', formData);
    if (getBarcode.connect) {
      if (getBarcode.response.rowCount > 0) {
        founddrug = this.patient_drug.filter(
          (element: any) =>
            element.drugCode.trim().toLowerCase() ===
            getBarcode.response.result[0].drugCode.trim().toLowerCase()
        );
      } else {
        founddrug = this.patient_drug.filter(
          (element: any) =>
            element.drugCode.trim().toLowerCase() === val.trim().toLowerCase()
        );
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    // founddrug = founddrug.map((emp: { drugCode: any }) => {
    //   return {
    //     ...emp,
    //     ...this.drug_xmed.find(
    //       (item: { drugCode: any }) =>
    //         item.drugCode.trim() === emp.drugCode.trim()
    //     ),
    //   };
    // });

    let value = founddrug.map((emp: { drugCode: any }) => ({
      ...emp,
      ...this.drug_xmed.find(
        (item: { drugCode: any }) =>
          item.drugCode.trim() === emp.drugCode.trim()
      ),
    }));
    value = value[0] ? value[0] : '';

    if (value.realDrugCode) {
      if (Number(value.HisPackageRatio) <= value.checkqty) {
        if (value.checkqty) {
          let qty = Number(value.qty) - Number(value.HisPackageRatio);
          let formData = new FormData();
          formData.append('hn', value.hn);
          formData.append('seq', value.seq);
          formData.append('orderitemcode', value.drugCode.trim());
          formData.append('lastmodified', value.lastmodified);
          formData.append('currentqty', String(qty));
          let getData: any = await this.http.post('updateCheckmed', formData);
          if (getData.connect) {
            if (getData.response.rowCount > 0) {
              let getData3: any = await this.http.post(
                'patient_drug',
                formData
              );
              if (getData3.connect) {
                if (getData3.response.rowCount > 0) {
                  this.patient_drug = getData3.response.result;
                  // this.countcheck = this.patient_drug.filter(function (
                  //   item: any
                  // ) {
                  //   if (item.checkstamp) {
                  //     return true;
                  //   } else {
                  //     return false;
                  //   }
                  // }).length;
                  setTimeout(() => {
                    this.drugbar.nativeElement.focus();
                  }, 100);
                  this.dataSource = new MatTableDataSource(this.patient_drug);
                  this.dataSource.sort = this.sort;
                  this.dataSource.paginator = this.paginator;
                  let showtext =
                    qty != 0
                      ? ` ${value.drugName} คงเหลือ ${qty}`
                      : `เช็คยา ${value.drugName} สำเร็จ`;
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: showtext,
                    showConfirmButton: false,
                    timer: 1500,
                  });
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

          // this.sendPDF(value).then((dataPDF: any) => {
          //   if (dataPDF) {
          //     dataPDF.getBase64(async (buffer: any) => {
          //       let pdf: any = await this.http.Printjs('convertbuffer', {
          //         data: buffer,
          //         name: 'testpdf' + '.pdf',
          //         ip: '192.168.184.46',
          //         printName: this.dataUser.print_name,
          //         hn: value.hn,
          //       });
          //       if (pdf.connect) {
          //         if (pdf.response.connect === 'success') {
          //           } else {
          //             Swal.fire(
          //               'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
          //               '',
          //               'error'
          //             );
          //           }
          //         } else {
          //           Swal.fire('ไม่สามารถสร้างไฟล์ PDF ได้!', '', 'error');
          //         }
          //       });
          // }
          //   });
        } else {
          Swal.fire('รายการยาซ้ำ!', '', 'error');
        }
      } else {
        Swal.fire('แพ็คยาเยอะกว่าจำนวนยาคงเหลือ!', '', 'error');
      }
    } else {
      Swal.fire('ไม่มีรายการยา!', '', 'error');
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
    //   if (value) {
    //     if (formValues[0] < value.amount) {
    //       Swal.fire('จำนวนยาไม่ครบ!', '', 'error');
    //     } else if (formValues[0] > value.amount) {
    //       Swal.fire('จำนวนยาเกิน!', '', 'error');
    //     } else {
    //       let getData = await this.sendPDF(value);
    //     }
    //   } else {
    //     Swal.fire('ไม่มียานี้ในรายการ!', '', 'error');
    //   }
    // }
  }
  // async updateCheckmed() {
  //   let founddrug: any = null;
  //   let formData = new FormData();
  //   formData.append('hn', founddrug.hn);
  //   formData.append('seq', founddrug.seq);
  //   formData.append('orderitemcode', founddrug.drugCode.trim());
  //   formData.append('lastmodified', founddrug.lastmodified);
  //   let getData: any = await this.http.post('updateCheckmed', formData);
  //   if (getData.connect) {
  //     if (getData.response.rowCount > 0) {
  //       let getData3: any = await this.http.post('patient_drug', formData);
  //       if (getData3.connect) {
  //         if (getData3.response.rowCount > 0) {
  //           this.patient_drug = getData3.response.result;
  //           this.countcheck = this.patient_drug.filter(function (item: any) {
  //             if (item.checkstamp) {
  //               return true;
  //             } else {
  //               return false;
  //             }
  //           }).length;
  //           setTimeout(() => {
  //             this.drugbar.nativeElement.focus();
  //           }, 100);
  //           this.dataSource = new MatTableDataSource(this.patient_drug);
  //           this.dataSource.sort = this.sort;
  //           this.dataSource.paginator = this.paginator;

  //           Swal.fire({
  //             position: 'center',
  //             icon: 'success',
  //             // title: `เช็คยา ${founddrug.drugName} สำเร็จ`,
  //             showConfirmButton: false,
  //             timer: 1500,
  //           });
  //         } else {
  //           Swal.fire('ไม่สามารถเชื่อม patient_drug ได้!', '', 'error');
  //         }
  //       } else {
  //         Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //       }
  //     } else {
  //       Swal.fire('ไม่สามารถเชื่อม updateCheckmed ได้!', '', 'error');
  //     }
  //   } else {
  //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //   }
  // }

  async sendPDF(data: any) {
    let namePatient = this.patient_contract.patientName;

    if (namePatient.length > 25) {
      namePatient = namePatient.substring(0, 25);
      namePatient = namePatient + '...';
    }
    let nameDrug = data.drugName.trim();

    if (nameDrug.length > 57) {
      nameDrug = nameDrug.substring(0, 54);
      nameDrug = nameDrug + '...';
    }

    let freetext1 = data.freetext1.split(',');

    let freetext2 = data.freetext2.split(',');
    let itemidentify =
      data.itemidentify.charAt(data.itemidentify.length - 1) == ','
        ? data.itemidentify.substring(0, data.itemidentify.length - 1)
        : data.itemidentify;
    let right = data.righttext1.includes(' ')
      ? data.righttext1.replace(' ', ' - ')
      : data.righttext1;
    let qrcode = data.qrCode ? `` : '';

    var docDefinition = {
      pageSize: { width: 238, height: 255 },
      pageMargins: [0, 0, 10, 70] as any,
      header: {} as any,

      content: [
        {
          columns: [
            {
              width: 150,
              text: namePatient,
            },
            {
              width: '*',
              text: 'HN ' + this.patient_contract.hn,
              alignment: 'right',
            },
          ],
          fontSize: 16,
          bold: true,
        },
        {
          text: `สิทธิ : ${right} / ${
            data.righttext2 ? data.righttext2.toUpperCase().trim() : ''
          } / ${
            data.righttext3
              ? data.righttext3.trim() === 'ป'
                ? 'ปกติ'
                : data.righttext3.trim()
              : ''
          }`,
          fontSize: 14,
          bold: true,
        },
        {
          columns: [
            {
              width: 150,
              text: moment(new Date())
                .add(543, 'year')
                .format('DD/MM/YYYY HH:mm:ss'),
            },
            {
              width: '*',
              text: `รายการ (${data.seq}/${data.rowNum})`,

              alignment: 'right',
            },
          ],
          fontSize: 12,
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 },
          ],
        },
        {
          columns: [
            {
              width: 170,
              text: nameDrug,
            },
            {
              width: '*',
              text: '#' + data.qty + ' ' + data.unitCode.trim(),
              alignment: 'right',
            },
          ],
          bold: true,
          fontSize: 16,
        },

        {
          text: ` `,
          bold: true,
          fontSize: 8,
          alignment: 'center',
        },
        {
          text: `${data.lamedName.trim()} ${data.dosage.trim()} ${data.freetext0.trim()} ${
            freetext1[0] ? freetext1[0] : ''
          }`,
          bold: true,
          fontSize: 16,
          alignment: 'center',
        },
        {
          text: freetext1[1] ? freetext1[1] : '',
          bold: true,
          fontSize: 16,
          alignment: 'center',
        },
        freetext2
          ? freetext2.map(function (item: any) {
              return { text: item.trim(), alignment: 'center', fontSize: 14 };
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
          columns: [
            {
              width: 200,
              text: `ชื่อสามัญ : ${data.drugNameTh.trim()} \nข้อบ่งใช้ : ${itemidentify}`,
              fontSize: 12,
            },
            ...(data.qrCode
              ? [
                  {
                    width: '*',
                    qr: `${data.qrCode}`,
                    fit: '45',
                    margin: [0, 5, 0, 0],
                  },
                ]
              : []),
          ],
        },
      ] as any,

      defaultStyle: {
        font: 'THSarabunNew',
      },
    };

    // const pdfDocGenerator = await pdfMake.createPdf(docDefinition);
    // return pdfDocGenerator;
    pdfMake.createPdf(docDefinition).open();
    return false;
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

  sendServer(data: any) {
    this.sendPDF(data).then((dataPDF: any) => {
      if (dataPDF) {
        dataPDF.getBase64(async (buffer: any) => {
          let getData: any = await this.http.Printjs('convertbuffer', {
            data: buffer,
            name: 'testpdf' + '.pdf',
            ip: '192.168.184.46',
            printName: this.dataUser.print_name,
            hn: data.hn,
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
}
