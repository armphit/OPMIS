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
import * as CryptoJS from 'crypto-js';
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
    'action',
    'drugCode',
    'drugName',
    'default_qty',
    'current_qty',
    'unitCode',
    'img',
    'createdDT',
  ];
  dataSource: any = null;
  selectedRowIndex: any;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  checkprint: boolean = false;
  constructor(
    private http: HttpService,
    public lightbox: Lightbox,
    public gallery: Gallery
  ) {
    // this.test();
  }

  ngOnInit(): void {}
  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 100);
  }
  getHN(hn: any) {
    this.getData(hn);
  }
  test() {
    this.getData('368832');
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
              user: this.dataUser.user,
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

                this.patient_drug.forEach((v: any) => {
                  if (!v.checkstamp) {
                    v.isSort = 2;
                  } else if (v.checkstamp && v.checkqty) {
                    v.isSort = 1;
                  } else if (v.checkstamp && !v.checkqty) {
                    v.isSort = 3;
                  }
                });

                this.countcheck = this.patient_drug.filter(function (
                  item: any
                ) {
                  if (item.checkstamp || (!item.qty && !item.checkqty)) {
                    return true;
                  } else {
                    return false;
                  }
                }).length;

                this.sumcheck = this.patient_drug
                  .filter(function (item: any) {
                    if (item.checkstamp || (!item.qty && !item.checkqty)) {
                      return true;
                    } else {
                      return false;
                    }
                  })
                  .every((v: any) => {
                    return v.checkqty == 0;
                  });

                if (
                  this.sumcheck &&
                  this.countcheck === this.patient_drug.length
                ) {
                  setTimeout(() => {
                    this.swiper.nativeElement.focus();
                  }, 100);
                } else {
                  setTimeout(() => {
                    this.drugbar.nativeElement.focus();
                  }, 100);
                }

                this.dataSource = new MatTableDataSource(this.patient_drug);
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
              } else {
                Swal.fire('ไม่สามารถเชื่อม patient_drug ได้!', '', 'error');
              }
            } else {
              Swal.fire(
                'patient_drugไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!',
                '',
                'error'
              );
            }
          } else {
            // this.data_drug = null;
            Swal.fire('ไม่สามารถเชื่อม dataQ ได้!', '', 'error');
          }
        } else {
          Swal.fire('dataQไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อม patient_contract ได้!', '', 'error');
      }
    } else {
      Swal.fire(
        'patient_contractไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!',
        '',
        'error'
      );
    }
  }
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async getDrug(val: any) {
    // let founddrug: any = null;
    // let checkcode: any = '';
    let value: any = null;
    let formData = new FormData();
    formData.append('barcode', val);
    let getBarcode: any = null;

    getBarcode = await this.http.post('drugBarcode2', formData);

    if (getBarcode.connect) {
      if (getBarcode.response[0].rowCount > 0) {
        value = this.drug_xmed
          .filter((o1: any) => {
            return getBarcode.response[0].result.some(function (o2: any) {
              return o1.realDrugCode.trim() === o2.drugCode.trim(); // return the ones with equal id
            });
          })
          .map((emp: any) => ({
            ...emp,
            ...this.patient_drug.find(
              (item: any) =>
                item.drugCode.trim() === emp.drugCode.trim() &&
                item.checkqty != 0
            ),
          }));
      } else if (getBarcode.response[1].rowCount) {
        let data = getBarcode.response[1].result[0];
        value = await this.patient_drug
          .filter(
            (element: any) =>
              element.drugCode.trim().toLowerCase() ===
                data.drugCode.trim().toLowerCase() &&
              Number(element.hn) === Number(data.PatientNo) &&
              Number(element.qty) === Number(data.HisPackageRatio)
          )
          .map((emp: any) => ({
            ...emp,
            ...data,
          }));
        if (!value.length) {
          value = await this.patient_drug
            .filter(
              (element: any) =>
                element.drugCode.trim().toLowerCase() ===
                  data.drugCode.trim().toLowerCase() &&
                Number(element.hn) === Number(data.PatientNo)
            )
            .map((emp: any) => ({
              ...emp,
              ...data,
            }));
        }
      } else if (getBarcode.response[2].rowCount > 0) {
        value = this.drug_xmed
          .filter((o1: any) => {
            return getBarcode.response[2].result.some(function (o2: any) {
              return o1.realDrugCode.trim() === o2.drugCode.trim(); // return the ones with equal id
            });
          })
          .map((emp: any) => ({
            ...emp,
            ...this.patient_drug.find(
              (item: any) =>
                item.drugCode.trim() === emp.drugCode.trim() &&
                item.checkqty != 0
            ),
          }));
      } else {
        if (val.includes(';')) {
          let textSpilt = val.split(';');

          value = this.patient_drug.filter(
            (item: any) => item.drugCode.trim() === textSpilt[0].trim()
          );
          if (value.length) {
            let formData = new FormData();
            formData.append('code', textSpilt[0].trim());

            let getBot: any = await this.http.post('getDrubot', formData);
            if (getBot.connect) {
              if (getBot.response.rowCount > 0) {
                value[0].HisPackageRatio = 1;
              } else {
                value[0].HisPackageRatio = textSpilt[1];
              }
            } else {
              Swal.fire('getBotไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
            // value[0].HisPackageRatio = textSpilt[1];
          }
        }

        // const decryptedDataBase64 = CryptoJS.AES.decrypt(val, '****');
        // const decryptedDataBase64InUtf = decryptedDataBase64.toString(
        //   CryptoJS.enc.Utf8
        // );

        // if (decryptedDataBase64InUtf) {
        //   try {
        //     let dataQr = JSON.parse(decryptedDataBase64InUtf);

        //     value = this.patient_drug.filter(
        //       (item: any) => item.drugCode.trim() === dataQr.drug.trim()
        //     );
        //     if (value.length) {
        //       value[0].HisPackageRatio = dataQr.qty;
        //     }
        //   } catch (error) {
        //     console.log(error);
        //   }
        // }
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    value = value ? value[0] : null;

    if (value) {
      if (value.HisPackageRatio) {
        if (Number(value.HisPackageRatio) <= value.checkqty) {
          if (value.checkqty) {
            let currentqty =
              Number(value.checkqty) - Number(value.HisPackageRatio);
            value.currentqty = currentqty;

            if (currentqty || !this.checkprint) {
              await this.updateCheckmed(value);
            } else {
              this.sendPDF(value).then((dataPDF: any) => {
                if (dataPDF) {
                  dataPDF.getBase64(async (buffer: any) => {
                    let pdf: any = await this.http.Printjs('convertbuffer', {
                      data: buffer,
                      name: value.hn + ' ' + value.drugCode + '.pdf',
                      ip: this.dataUser.print_ip,

                      printName: this.dataUser.print_name,
                      hn: value.hn + ' ' + value.drugName,
                    });
                    if (pdf.connect) {
                      if (pdf.response.connect === 'success') {
                        await this.updateCheckmed(value);
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
          } else {
            Swal.fire('รายการยาซ้ำ!', '', 'error');
          }
        } else {
          Swal.fire('แพ็คยาเยอะกว่าจำนวนยาคงเหลือ!', '', 'error');
        }
      } else {
        Swal.fire('ไม่มีรายการยา Barcode!', '', 'error');
      }
    } else {
      Swal.fire('ไม่มีรายการยา!', '', 'error');
    }
  }
  sumcheck: any = null;
  async updateCheckmed(value: any) {
    let data_send = {
      id: value.id,
      currentqty: value.currentqty,
      user: this.dataUser.user,
      qty: value.HisPackageRatio,
      cmp_id: value.cmp_id,
    };

    let getData: any = await this.http.postNodejs('updatecheckmed', data_send);

    if (getData.connect) {
      if (getData.response.datadrugpatient) {
        this.patient_drug = getData.response.datadrugpatient;

        this.patient_drug.forEach((v: any) => {
          if (!v.checkstamp) {
            v.isSort = 2;
          } else if (v.checkstamp && v.checkqty) {
            v.isSort = 1;
          } else if (v.checkstamp && !v.checkqty) {
            v.isSort = 3;
          }
        });

        this.countcheck = this.patient_drug.filter(function (item: any) {
          if (item.checkstamp || (!item.qty && !item.checkqty)) {
            return true;
          } else {
            return false;
          }
        }).length;
        this.sumcheck = this.patient_drug
          .filter(function (item: any) {
            if (item.checkstamp || (!item.qty && !item.checkqty)) {
              return true;
            } else {
              return false;
            }
          })
          .every((v: any) => {
            return v.checkqty == 0;
          });
        if (this.sumcheck && this.countcheck === this.patient_drug.length) {
          setTimeout(() => {
            this.swiper.nativeElement.focus();
          }, 100);
        } else {
          setTimeout(() => {
            this.drugbar.nativeElement.focus();
          }, 100);
        }
        this.dataSource = new MatTableDataSource(this.patient_drug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        let showtext =
          value.currentqty != 0
            ? ` ${value.drugName} คงเหลือ ${value.currentqty}`
            : `เช็คยา ${value.drugName} สำเร็จ`;
        Swal.fire({
          imageUrl: value.pathImage.length
            ? value.typeNum.indexOf('pack') != -1
              ? this.http.imgPath +
                value.pathImage[value.typeNum.indexOf('pack')]
              : value.pathImage[value.pathImage.length - 1]
              ? this.http.imgPath + value.pathImage[value.pathImage.length - 1]
              : ''
            : '',
          imageWidth: 200,
          imageHeight: 200,
          position: 'center',
          icon: 'success',
          title: showtext,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire('ไม่สามารถเชื่อม updateCheckmed ได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  async sendPDF(data: any) {
    let namePatient = '';
    namePatient =
      this.patient_contract.patientName + '   HN ' + this.patient_contract.hn;

    if (namePatient.length >= 50) {
      namePatient = namePatient.substring(0, 47);
      namePatient = namePatient + '...';
    }
    let nameDrug = data.drugName.trim();

    if (nameDrug.length >= 36) {
      if (data.drugCode === 'LEVO25') {
        nameDrug = nameDrug.substring(0, 30);
        nameDrug = nameDrug + '...';
      } else {
        nameDrug = nameDrug.substring(0, 33);
        nameDrug = nameDrug + '...';
      }
    }
    let freetext1 = data.freetext1.split(',');
    let free_under = freetext1.slice(1);
    let freetext2 = data.freetext2.split(',');

    let right = data.righttext1.includes(' ')
      ? data.righttext1.replace(' ', ' - ')
      : data.righttext1;
    let lang = /[\u0E00-\u0E7F]/;
    let lamed = '';
    let freetext_lang = '';
    if (!lang.test(this.patient_contract.patientName)) {
      lamed = data.lamedEng ? data.lamedEng.trim() : '';
      freetext_lang = data.freetext1Eng ? data.freetext1Eng.trim() : '';
    } else {
      lamed = data.lamedName ? data.lamedName.trim() : '';
      freetext_lang = data.freetext0 ? data.freetext0.trim() : '';
      if (data.freetext0.trim() == 'เม็ด') {
        data.dosage = data.dosage
          ? data.dosage.trim() == '0'
            ? ''
            : data.dosage.trim() == '0.5'
            ? 'ครึ่ง'
            : data.dosage.trim() == '0.25'
            ? 'หนึ่งส่วนสี่'
            : data.dosage.trim() == '0.75'
            ? 'สามส่วนสี่'
            : data.dosage.trim() == '1.5'
            ? 'หนึ่งเม็ดครึ่ง'
            : data.dosage.trim() == '2.5'
            ? 'สองเม็ดครึ่ง'
            : data.dosage.trim() == '3.5'
            ? 'สามเม็ดครึ่ง'
            : data.dosage.trim()
          : '';
      } else {
        data.dosage = data.dosage
          ? data.dosage.trim() == '0'
            ? ''
            : data.dosage.trim()
          : '';
      }
    }

    var docDefinition = {
      pageSize: { width: 238, height: 255 },
      pageMargins: [0, 0, 7, 70] as any,
      header: {} as any,

      content: [
        {
          // columns: [
          //   {
          //     width: 150,
          //     text: namePatient,
          //   },
          //   {
          //     width: '*',
          //     text: 'HN ' + this.patient_contract.hn,
          //     alignment: 'right',
          //   },
          // ],
          text: namePatient,
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
              width: 183,
              text: nameDrug,
              bold: true,
              fontSize: 14,
            },
            {
              width: '*',
              text: '#' + data.qty + ' ' + data.unitCode.trim(),
              fontSize: 14,
              bold: true,
              alignment: 'right',
            },
          ],
        },
        {
          text: data.itemidentify ? data.itemidentify.trim() : `   `,

          fontSize: 13,
        },
        {
          text: `${lamed} ${data.dosage.trim()} ${freetext_lang} ${
            freetext1[0] ? freetext1[0] : ''
          }`,
          bold: true,
          fontSize: 15,
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
          ? freetext2.map(function (item: any) {
              return {
                text: item.trim(),
                alignment: 'center',
                fontSize: 13,
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
          columns: [
            {
              width: 195,
              text: `ชื่อสามัญ : ${data.drugNameTh.trim()} \nข้อบ่งใช้ : ${
                data.indication
              }`,
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

    const pdfDocGenerator = await pdfMake.createPdf(docDefinition);
    return pdfDocGenerator;
    // pdfMake.createPdf(docDefinition).open();
    // return false;
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
    this.items = val.pathImage.map(
      (item: any) =>
        new ImageItem({
          src: this.http.imgPath + item,
          thumb: this.http.imgPath + item,
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
            name: data.hn + ' ' + data.drugCode + '.pdf',
            ip: this.dataUser.print_ip,
            // ip: '192.168.184.163',
            printName: this.dataUser.print_name,
            hn: data.hn + ' ' + data.drugName,
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

  deletePatient(data: any) {
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
        // let formData = new FormData();
        // formData.append('hn', this.patient_contract.hn);

        let data_send = {
          cmp_id: data.cmp_id,
          user: this.dataUser.user,
        };
        let getData: any = await this.http.postNodejs(
          'deletecheckmed',
          data_send
        );

        if (getData.connect) {
          if (getData.response) {
            if (getData.response.dataDelete.affectedRows) {
              this.patient_drug = '';
              this.patient_contract = null;
              this.Dataqandcheck = null;
              this.drug_xmed = null;
              this.dataSource = null;
              this.countcheck = null;
              Swal.fire({
                icon: 'success',
                title: 'ลบข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500,
              });
              setTimeout(() => {
                this.swiper.nativeElement.focus();
              }, 100);
            } else {
              console.log(getData);
              Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
            }
          } else {
            console.log(getData);
            Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        setTimeout(() => {
          this.drugbar.nativeElement.focus();
        }, 100);
      }
    });
  }
  sendAccept(data: any) {
    Swal.fire({
      // title: `จำนวน ${data.drugName} คงเหลือ ${data.checkqty} ${
      //   data.unitCode ? data.unitCode.trim() : ''
      // }`,
      imageUrl: data.pathImage.length
        ? data.typeNum.indexOf('pack') != -1
          ? this.http.imgPath + data.pathImage[data.typeNum.indexOf('pack')]
          : data.pathImage[data.pathImage.length - 1]
          ? this.http.imgPath + data.pathImage[data.pathImage.length - 1]
          : ''
        : '',
      imageWidth: 200,
      imageHeight: 200,
      title: `<strong>จำนวน ${data.drugName} คงเหลือ ${data.checkqty} ${
        data.unitCode ? data.unitCode.trim() : ''
      }</strong>`,
      text: 'คุณแน่ใจที่จะยอมรับรายการยานี้หรือไม่ ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (this.checkprint) {
          this.sendPDF(data).then((dataPDF: any) => {
            if (dataPDF) {
              dataPDF.getBase64(async (buffer: any) => {
                let getData: any = await this.http.Printjs('convertbuffer', {
                  data: buffer,
                  name: data.hn + ' ' + data.drugCode + '.pdf',
                  ip: this.dataUser.print_ip,

                  printName: this.dataUser.print_name,
                  hn: data.hn + ' ' + data.drugName,
                });

                if (getData.connect) {
                  if (getData.response.connect === 'success') {
                    data.currentqty = 0;
                    data.HisPackageRatio = data.checkqty;
                    await this.updateCheckmed(data);
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
          data.currentqty = 0;
          data.HisPackageRatio = data.checkqty;
          await this.updateCheckmed(data);
        }
      }
    });
  }
}
