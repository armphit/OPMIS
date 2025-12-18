import { map } from 'rxjs/operators';
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
import { FormGroup, FormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Http2Service } from 'src/app/services/http2.service';

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
  public campaignOne = new FormGroup({
    picker: new FormControl(new Date()),
  });
  select: string = '';
  checked: boolean = false;

  constructor(
    private http: HttpService,
    public lightbox: Lightbox,
    public gallery: Gallery,
    private dateAdapter: DateAdapter<Date>,
    private sseService: Http2Service
  ) {
    this.getIP();
    this.dateAdapter.setLocale('en-GB');

    // this.test();
  }
  checkprint: boolean = true;
  test() {
    // this.getData('1055663');
  }
  messages: any[] = [];
  ngOnInit(): void {
    this.sseService
      .getServerSentEvent('http://localhost:5000/events')
      .subscribe({
        next: (data) => this.getdataButton(data),
        error: (err) => console.error('SSE Error:', err),
      });
    // interval(10000).subscribe(() => {
    //   this.getDrugL();
    // });
  }

  // ngOnInit() {
  //   const socket = new WebSocket('ws://localhost:8080');

  //   socket.onmessage = (event) => {
  //     console.log('Received from Node.js:', event.data);
  //     this.message = event.data;
  //   };

  //   socket.onerror = (error) => {
  //     console.error('WebSocket Error:', error);
  //   };

  //   socket.onclose = () => {
  //     console.log('WebSocket Disconnected');
  //   };
  // }

  getHN(hn: any) {
    this.getData(hn, null);
  }
  ip: any = null;
  dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  getLed: any = '';
  async getIP() {
    // const response = await fetch('./assets/data.json');
    // this.ip = await response.json();
    // this.ip = this.ip.data.ip;
    // console.log();
    let formData = new FormData();
    this.dataUser.ip = '192.168.185.174';
    formData.append('ip', this.dataUser.ip);

    let getData: any = await this.http.post('getprintIP', formData);

    if (getData.connect) {
      formData.append('num', '1');

      if (getData.response.rowCount) {
        this.checked = true;
        this.getLed = getData.response.result[0].led;
        console.log(this.getLed);
      } else {
        this.checked = false;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  patient_contract: any = null;
  Dataqandcheck: any = null;
  patient_drug: any = [];
  data_filter: any = [];
  panelOpenState = true;

  drug_xmed: any = [];
  mathRandom: any = '?lastmod=' + Math.random();
  async getData(hn: any, check: any) {
    if (check) {
      let win: any = window;
      win.$('#drugModal').modal('hide');
    }
    this.countcheck = 0;
    let formData = new FormData();
    formData.append('hn', hn.trim());
    // formData.append(
    //   'date',
    //   moment(this.campaignOne.value.picker).add(543, 'year').format('YYYYMMDD')
    // );

    // let getData: any = await this.http.post('patient_contract', formData);

    // if (getData.connect) {
    //   if (getData.response.rowCount > 0) {
    // let getData2: any = await this.http.post('Datacheckdrug', formData);
    // this.patient_contract = getData.response.result[0];
    // if (getData2.connect) {
    //   if (getData2.response.rowCount > 0) {
    let data_send: any = {
      hn: hn.trim(),
      date: moment(this.campaignOne.value.picker)
        .add(543, 'year')
        .format('YYYYMMDD'),
      dateEN: moment(this.campaignOne.value.picker).format('YYYY-MM-DD'),
      user: this.dataUser.user,
      ipmain: this.dataUser.ip
        ? '200.200.200.' + this.dataUser.ip.split('.')[3]
        : '',
      site: this.select,
      check: check,
    };

    let getData3: any = await this.http.postNodejs('checkpatient', data_send);

    if (getData3.connect) {
      if (getData3.response.datadrugpatient.length > 0) {
        this.patient_contract = getData3.response.datadrugpatient[0];
        this.patient_drug = getData3.response.datadrugpatient;
        if (check) {
          this.patient_drug = getData3.response.datadrugpatient.filter(
            (val: any) => val.device.includes('M2')
          );
        } else {
          this.patient_drug = getData3.response.datadrugpatient;
        }

        this.Dataqandcheck = getData3.response.datadrugpatient[0].check;

        if (getData3.response.datadrugpatient[0].check) {
          this.showAllergic(getData3.response.datadrugpatient[0].CID);
        }
        this.drug_xmed = getData3.response.patientDrug;

        this.patient_drug = this.patient_drug.filter(
          (val: any) => val.departmentcode.trim() == this.select
        );
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
          if (item.checkstamp && !item.checkqty) {
            return true;
          } else {
            return false;
          }
        }).length;

        this.sumcheck = this.patient_drug
          .filter(function (item: any) {
            if (item.checkstamp && !item.checkqty) {
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
        this.data_filter = this.patient_drug.filter(
          (val: any) =>
            (val.checkDrug && !val.checkstamp) || (!val.qty && !val.checkstamp)
        );

        if (this.getLed && this.getLed.includes('LED')) {
          const simplifyLED = (text: string): string => {
            if (!text) return '';
            const match = text.match(/^(LED\d+)/i);
            return match ? match[1] : text;
          };
          let getNumled = this.patient_drug
            .filter((x: any) => simplifyLED(x.device) == this.getLed)
            .map((a: any) => {
              return {
                hn: a.hn,
                drugCode: a.drugCode ? a.drugCode.trim() : a.drugCode,
                qty: a.qty,
                deviceCheck: a.deviceCheck,
              };
            });

          if (getNumled.length) {
            data_send.led = getNumled.length ? getNumled : '';
            let getData4: any = await this.http.PrintjsLocalhost(
              'createFile',
              data_send
            );

            if (getData4.connect) {
              if (!getData4.response.success) {
                Swal.fire('ไม่สามารถ Create File ได้!', '', 'error');
              }
            } else {
              // Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
          }

          // if (
          //   this.patient_drug.filter((item: any) => item.device == this.getLed)
          //     .length
          // ) {
          //   this.patient_drug = this.patient_drug.filter(
          //     (item: any) => item.device == this.getLed
          //   );
          // }
        }

        this.dataSource = new MatTableDataSource(this.patient_drug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        Swal.fire('ไม่มีรายการยาจากชั้นนี้!', '', 'error');
      }
    } else {
      Swal.fire('patient_drugไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    //   } else {
    //     // this.data_drug = null;
    //     Swal.fire('ไม่สามารถเชื่อม dataQ ได้!', '', 'error');
    //   }
    // } else {
    //   Swal.fire('dataQไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    // }
    //   } else {
    //     Swal.fire('ไม่สามารถเชื่อม patient_contract ได้!', '', 'error');
    //   }
    // } else {
    //   Swal.fire(
    //     'patient_contractไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!',
    //     '',
    //     'error'
    //   );
    // }
  }
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public selectSite() {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 100);
  }

  async getDrug(val: any) {
    let value: any = [];
    let formData = new FormData();
    formData.append('barcode', val);
    let getBarcode: any = null;

    getBarcode = await this.http.post('drugBarcode2', formData);

    // getBarcode = await this.http.postNodejs('cutqty', { barcode: val });

    this.patient_drug.filter((item: any) => item.device === val.trim());
    if (getBarcode.connect) {
      if (getBarcode.response[0].rowCount > 0 && !value.length) {
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
      } else if (getBarcode.response[1].rowCount && !value.length) {
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
      } else if (getBarcode.response[2].rowCount > 0 && !value.length) {
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

        if (!value.length) {
          value = this.patient_drug.filter(
            (item: any) =>
              item.drugCode.trim() ===
              getBarcode.response[2].result[0].drugCode.trim()
          );

          if (value.length) {
            value[0].HisPackageRatio = getBarcode.response[2].result[0].pack;
          }
        }
      } else if (val.includes(';') && !value.length) {
        let textSpilt = val.split(';');

        value = this.patient_drug.filter(
          (item: any) => item.drugCode.trim() === textSpilt[0].trim()
        );

        let formData = new FormData();
        formData.append('code', textSpilt[0].trim());
        let getBot: any = null;
        if (value.length) {
          getBot = await this.http.post('getDrubot', formData);
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
        } else {
          formData.append('pack', textSpilt[1].trim());
          getBot = await this.http.post('getFixqr', formData);

          if (getBot.connect) {
            if (getBot.response.rowCount > 0) {
              value = this.patient_drug.filter(
                (item: any) =>
                  item.drugCode.trim() ===
                  getBot.response.result[0].drugCode.trim()
              );
              if (value.length) {
                value[0].HisPackageRatio = 1;
              }
            }
          } else {
            Swal.fire('getBotไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
          }
        }
      } else {
        if (
          this.patient_drug.filter(
            (item: any) => item.drugCode.trim() === val.trim() && item.checkqty
          ).length
        ) {
          value = this.patient_drug.filter(
            (item: any) => item.drugCode.trim() === val.trim() && item.checkqty
          );
          if (value.length) {
            value[0].HisPackageRatio = value[0].qty + 1;
            value[0].checkqrcode = 'Y';
            // value[0].HisPackageRatio = textSpilt[1];
          }
        } else {
          let setdrug = this.patient_drug.filter((item: any) => item.device);

          if (
            setdrug.filter(
              (item: any) => item.device.includes(val.trim()) && item.checkqty
            ).length
          ) {
            value = setdrug.filter(
              (item: any) => item.device.includes(val.trim()) && item.checkqty
            );

            if (value.length) {
              value[0].HisPackageRatio = value[0].qty + 1;
              value[0].checkqrcode = 'Y';
              // value[0].HisPackageRatio = textSpilt[1];
            }
          }
        }
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    value = value ? value[0] : null;

    if (value) {
      value.dataCheck = 1;

      if (value.HisPackageRatio) {
        if (Number(value.HisPackageRatio) <= value.checkqty) {
          if (value.checkqty) {
            let currentqty =
              Number(value.checkqty) - Number(value.HisPackageRatio);
            value.currentqty = currentqty;
            value.ip = this.dataUser.ip
              ? '200.200.200.' + this.dataUser.ip.split('.')[3]
              : '';
            value.device = val.device;
            if (currentqty || !this.checkprint) {
              await this.updateCheckmed(value);
            } else {
              if (value.qty_cut === 0) {
                value.cur_qty = value.qty_real;
                this.printPDF(value).then((dataPDF: any) => {
                  if (dataPDF) {
                    dataPDF.getBase64(async (buffer: any) => {
                      !this.checked
                        ? await this.http.Printjs162('convertbuffer', {
                            data: buffer,
                            name: value.hn + ' ' + value.drugCode + '.pdf',
                            ip: this.dataUser.print_ip,

                            printName: this.dataUser.print_name,
                            hn: value.hn + ' ' + value.drugName,
                          })
                        : await this.http.PrintjsLocalhost('convertbuffer', {
                            data: buffer,
                            name:
                              value.hn + ' ' + value.drugCode + '_drugcut.pdf',
                            ip: this.dataUser.print_ip,
                            // ip: '192.168.184.163',
                            printName: this.dataUser.print_name,
                            hn: value.hn + ' ' + value.drugName,
                          });
                      let formData: any = new FormData();
                      formData.append('drugcode', value.drugCode);
                      formData.append('drugname', value.drugName);
                      formData.append('phar', this.dataUser.user);
                      formData.append('hn', value.hn);
                      formData.append('cutamount', value.qty_cut);
                      formData.append('realamount', value.qty_real);
                      formData.append(
                        'balanceamount',
                        value.qty_real - value.qty_cut
                      );
                      formData.append('departmentcode', this.select);
                      formData.append(
                        'date',
                        moment(value.lastmodified).format('YYYY-MM-DD HH:mm:ss')
                      );
                      await this.http.post('insertCutDispendDrug', formData);
                      formData = null;
                      await this.updateCheckmed(value);
                      // if (getData.connect) {
                      //   if (getData.response.rowCount > 0) {
                      //     Swal.fire({
                      //       icon: 'success',
                      //       title: `ตัดจ่ายยา ${data.drugName}\n เสร็จสิ้น`,
                      //       showConfirmButton: false,
                      //       timer: 2000,
                      //     });
                      //     this.getData();
                      //   } else {
                      //     Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
                      //   }
                      // } else {
                      //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
                      // }
                    });
                  }
                });
              } else {
                this.sendPDF(value).then((dataPDF: any) => {
                  if (dataPDF) {
                    dataPDF.getBase64(async (buffer: any) => {
                      let pdf: any = !this.checked
                        ? await this.http.Printjs162('convertbuffer', {
                            data: buffer,
                            name: value.hn + ' ' + value.drugCode + '.pdf',
                            ip: this.dataUser.print_ip,

                            printName: this.dataUser.print_name,
                            hn: value.hn + ' ' + value.drugName,
                          })
                        : await this.http.PrintjsLocalhost('convertbuffer', {
                            data: buffer,
                            name: value.hn + ' ' + value.drugCode + '.pdf',
                            ip: this.dataUser.print_ip,

                            printName: this.dataUser.print_name,
                            hn: value.hn + ' ' + value.drugName,
                          });
                      if (value.cur_qty && value.qty_cut) {
                        if (value.qty_real > value.qty_cut) {
                          this.printPDF(value).then((dataPDF: any) => {
                            if (dataPDF) {
                              dataPDF.getBase64(async (buffer: any) => {
                                !this.checked
                                  ? await this.http.Printjs162(
                                      'convertbuffer',
                                      {
                                        data: buffer,
                                        name:
                                          value.hn +
                                          ' ' +
                                          value.drugCode +
                                          '.pdf',
                                        ip: this.dataUser.print_ip,

                                        printName: this.dataUser.print_name,
                                        hn: value.hn + ' ' + value.drugName,
                                      }
                                    )
                                  : await this.http.PrintjsLocalhost(
                                      'convertbuffer',
                                      {
                                        data: buffer,
                                        name:
                                          value.hn +
                                          ' ' +
                                          value.drugCode +
                                          '_drugcut.pdf',
                                        ip: this.dataUser.print_ip,
                                        // ip: '192.168.184.163',
                                        printName: this.dataUser.print_name,
                                        hn: value.hn + ' ' + value.drugName,
                                      }
                                    );
                                let formData: any = new FormData();
                                formData.append('drugcode', value.drugCode);
                                formData.append('drugname', value.drugName);
                                formData.append('phar', this.dataUser.user);
                                formData.append('hn', value.hn);
                                formData.append('cutamount', value.qty_cut);
                                formData.append('realamount', value.qty_real);
                                formData.append(
                                  'balanceamount',
                                  value.qty_real - value.qty_cut
                                );
                                formData.append('departmentcode', this.select);
                                formData.append(
                                  'date',
                                  moment(value.lastmodified).format(
                                    'YYYY-MM-DD HH:mm:ss'
                                  )
                                );
                                await this.http.post(
                                  'insertCutDispendDrug',
                                  formData
                                );
                                formData = null;
                                // if (getData.connect) {
                                //   if (getData.response.rowCount > 0) {
                                //     Swal.fire({
                                //       icon: 'success',
                                //       title: `ตัดจ่ายยา ${data.drugName}\n เสร็จสิ้น`,
                                //       showConfirmButton: false,
                                //       timer: 2000,
                                //     });
                                //     this.getData();
                                //   } else {
                                //     Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');
                                //   }
                                // } else {
                                //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
                                // }
                              });
                            }
                          });
                        }
                      }
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
            }
          } else {
            Swal.fire('รายการยาซ้ำ!', '', 'error');
          }
        } else {
          if (value.barCode == val.trim()) {
            Swal.fire('แพ็คยาเยอะกว่าจำนวนยาคงเหลือ!', '', 'error');
          } else {
            if (value.checkqty) {
              Swal.fire({
                imageUrl: value.pathImage
                  ? value.typeNum.indexOf('pack') != -1
                    ? this.http.imgPath +
                      value.pathImage[value.typeNum.indexOf('pack')] +
                      this.mathRandom
                    : value.pathImage[value.pathImage.length - 1]
                    ? this.http.imgPath +
                      value.pathImage[value.pathImage.length - 1] +
                      this.mathRandom
                    : ''
                  : '',
                imageWidth: 150,
                imageHeight: 150,
                title: `<strong style="font-size:18px">จำนวน ${
                  value.drugName
                } คงเหลือ ${value.checkqty} ${
                  value.unitCode ? value.unitCode.trim() : ''
                }</strong>`,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                allowEnterKey: false,
                position: 'top',
              }).then(async (result) => {
                if (result.isConfirmed) {
                  // if (this.dataUser.ip == 'test') {
                  //   let formData = new FormData();
                  //   formData.append('device', value.device);
                  //   formData.append('drugCode', value.drugCode);
                  //   let sendled: any = await this.http.post('update_led', formData);
                  // }
                  value.ip = this.dataUser.ip
                    ? '200.200.200.' + this.dataUser.ip.split('.')[3]
                    : '';
                  if (this.checkprint) {
                    if (value.qty_cut === 0) {
                      value.cur_qty = value.qty_real;
                      this.printPDF(value).then((dataPDF: any) => {
                        if (dataPDF) {
                          dataPDF.getBase64(async (buffer: any) => {
                            !this.checked
                              ? await this.http.Printjs162('convertbuffer', {
                                  data: buffer,
                                  name:
                                    value.hn + ' ' + value.drugCode + '.pdf',
                                  ip: this.dataUser.print_ip,

                                  printName: this.dataUser.print_name,
                                  hn: value.hn + ' ' + value.drugName,
                                })
                              : await this.http.PrintjsLocalhost(
                                  'convertbuffer',
                                  {
                                    data: buffer,
                                    name:
                                      value.hn +
                                      ' ' +
                                      value.drugCode +
                                      '_drugcut.pdf',
                                    ip: this.dataUser.print_ip,
                                    // ip: '192.168.184.163',
                                    printName: this.dataUser.print_name,
                                    hn: value.hn + ' ' + value.drugName,
                                  }
                                );
                            let formData: any = new FormData();
                            formData.append('drugcode', value.drugCode);
                            formData.append('drugname', value.drugName);
                            formData.append('phar', this.dataUser.user);
                            formData.append('hn', value.hn);
                            formData.append('cutamount', value.qty_cut);
                            formData.append('realamount', value.qty_real);
                            formData.append(
                              'balanceamount',
                              value.qty_real - value.qty_cut
                            );
                            formData.append('departmentcode', this.select);
                            formData.append(
                              'date',
                              moment(value.lastmodified).format(
                                'YYYY-MM-DD HH:mm:ss'
                              )
                            );
                            await this.http.post(
                              'insertCutDispendDrug',
                              formData
                            );
                            formData = null;
                            value.currentqty = 0;
                            value.HisPackageRatio = value.checkqty;

                            await this.updateCheckmed(value);
                          });
                        }
                      });
                    } else {
                      this.sendPDF(value).then((dataPDF: any) => {
                        if (dataPDF) {
                          dataPDF.getBase64(async (buffer: any) => {
                            let getData: any = !this.checked
                              ? await this.http.Printjs162('convertbuffer', {
                                  data: buffer,
                                  name:
                                    value.hn + ' ' + value.drugCode + '.pdf',
                                  ip: this.dataUser.print_ip,

                                  printName: this.dataUser.print_name,
                                  hn: value.hn + ' ' + value.drugName,
                                })
                              : await this.http.PrintjsLocalhost(
                                  'convertbuffer',
                                  {
                                    data: buffer,
                                    name:
                                      value.hn + ' ' + value.drugCode + '.pdf',
                                    ip: this.dataUser.print_ip,
                                    // ip: '192.168.184.163',
                                    printName: this.dataUser.print_name,
                                    hn: value.hn + ' ' + value.drugName,
                                  }
                                );

                            if (value.cur_qty && value.qty_cut) {
                              if (value.qty_real > value.qty_cut) {
                                this.printPDF(value).then((dataPDF: any) => {
                                  if (dataPDF) {
                                    dataPDF.getBase64(async (buffer: any) => {
                                      !this.checked
                                        ? await this.http.Printjs162(
                                            'convertbuffer',
                                            {
                                              data: buffer,
                                              name:
                                                value.hn +
                                                ' ' +
                                                value.drugCode +
                                                '.pdf',
                                              ip: this.dataUser.print_ip,

                                              printName:
                                                this.dataUser.print_name,
                                              hn:
                                                value.hn + ' ' + value.drugName,
                                            }
                                          )
                                        : await this.http.PrintjsLocalhost(
                                            'convertbuffer',
                                            {
                                              data: buffer,
                                              name:
                                                value.hn +
                                                ' ' +
                                                value.drugCode +
                                                '_drugcut.pdf',
                                              ip: this.dataUser.print_ip,
                                              // ip: '192.168.184.163',
                                              printName:
                                                this.dataUser.print_name,
                                              hn:
                                                value.hn + ' ' + value.drugName,
                                            }
                                          );
                                      let formData: any = new FormData();
                                      formData.append(
                                        'drugcode',
                                        value.drugCode
                                      );
                                      formData.append(
                                        'drugname',
                                        value.drugName
                                      );
                                      formData.append(
                                        'phar',
                                        this.dataUser.user
                                      );
                                      formData.append('hn', value.hn);
                                      formData.append(
                                        'cutamount',
                                        value.qty_cut
                                      );
                                      formData.append(
                                        'realamount',
                                        value.qty_real
                                      );
                                      formData.append(
                                        'balanceamount',
                                        value.qty_real - value.qty_cut
                                      );
                                      formData.append(
                                        'departmentcode',
                                        this.select
                                      );
                                      formData.append(
                                        'date',
                                        moment(value.lastmodified).format(
                                          'YYYY-MM-DD HH:mm:ss'
                                        )
                                      );
                                      await this.http.post(
                                        'insertCutDispendDrug',
                                        formData
                                      );
                                      formData = null;
                                    });
                                  }
                                });
                              }
                            }

                            if (getData.connect) {
                              if (getData.response.connect === 'success') {
                                value.currentqty = 0;
                                value.HisPackageRatio = value.checkqty;

                                await this.updateCheckmed(value);
                              } else {
                                Swal.fire(
                                  'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
                                  '',
                                  'error'
                                );
                              }
                            } else {
                              Swal.fire(
                                'ไม่สามารถสร้างไฟล์ PDF ได้!',
                                '',
                                'error'
                              );
                            }
                          });
                        }
                      });
                    }
                  } else {
                    value.currentqty = 0;
                    value.HisPackageRatio = value.checkqty;

                    await this.updateCheckmed(value);
                  }
                }
              });
            } else {
              Swal.fire('รายการยาซ้ำ!', '', 'error');
            }
          }

          // if (evt) {
          //   evt.stopPropagation();
          // }
          // Swal.fire('แพ็คยาเยอะกว่าจำนวนยาคงเหลือ!', '', 'error');
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
      ip: value.ip,
      drugCode: value.drugCode,
      device: value.device,
      site: this.select,
      checkAccept: value.dataCheck,
      hn: value.hn,
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
          if (item.checkstamp && !item.checkqty) {
            return true;
          } else {
            return false;
          }
        }).length;
        this.sumcheck = this.patient_drug
          .filter(function (item: any) {
            if (item.checkstamp && !item.checkqty) {
              return true;
            } else {
              return false;
            }
          })
          .every((v: any) => {
            return v.checkqty == 0;
          });
        this.data_filter = this.patient_drug.filter(
          (val: any) =>
            (val.checkDrug && !val.checkstamp) || (!val.qty && !val.checkstamp)
        );
        if (this.getLed && this.getLed.includes('LED')) {
          // if (
          //   this.patient_drug.filter((item: any) => item.device == this.getLed)
          //     .length
          // ) {
          //   this.patient_drug = this.patient_drug.filter(
          //     (item: any) => item.device == this.getLed
          //   );
          // }
        }

        this.dataSource = new MatTableDataSource(this.patient_drug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        let showtext =
          value.currentqty != 0
            ? ` ${value.drugName} คงเหลือ ${value.currentqty}`
            : `เช็คยา ${value.drugName} สำเร็จ`;
        Swal.fire({
          imageUrl: value.pathImage
            ? value.typeNum.indexOf('pack') != -1
              ? this.http.imgPath +
                value.pathImage[value.typeNum.indexOf('pack')] +
                this.mathRandom
              : value.pathImage[value.pathImage.length - 1]
              ? this.http.imgPath +
                value.pathImage[value.pathImage.length - 1] +
                this.mathRandom
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
        if (this.sumcheck && this.countcheck === this.patient_drug.length) {
          setTimeout(() => {
            this.swiper.nativeElement.focus();
          }, 1800);
        } else {
          setTimeout(() => {
            this.drugbar.nativeElement.focus();
          }, 100);
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อม updateCheckmed ได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  async sendPDF(data: any) {
    let namePatient = '';
    namePatient = data.patientname + '   HN ' + data.hn;

    let nameDrug = data.drugName.trim();
    if (data.drugCode.trim() === 'SOFOS8') {
      nameDrug = nameDrug.substring(0, 36);
      nameDrug = nameDrug + '...';
    }

    let freetext1 = data.freetext1.split(',');
    let free_under = freetext1.slice(1);
    data.freetext2 =
      data.freetext2.charAt(0) === ','
        ? data.freetext2.substring(1)
        : data.freetext2;
    let freetext2 = data.freetext2.split(',');

    let right = data.righttext1.includes(' ')
      ? data.righttext1.replace(' ', ' - ')
      : data.righttext1;
    let lang = /[\u0E00-\u0E7F]/;
    let lamed = '';
    let freetext_lang = '';
    if (!lang.test(data.patientname)) {
      lamed = data.lamedEng ? data.lamedEng.trim() : '';
      freetext_lang = data.freetext1Eng ? data.freetext1Eng.trim() : '';
    } else {
      lamed = data.lamedName ? data.lamedName.trim() : '';
      freetext_lang = data.freetext0 ? data.freetext0.trim() : '';
      if (data.freetext0.trim() == 'เม็ด') {
        if (data.dosage) {
          if (data.dosage.trim() == '0') {
            data.dosage = '';
            freetext_lang = '';
          } else if (data.dosage.trim() == '0.5') {
            data.dosage = 'ครึ่ง';
          } else if (
            data.dosage.trim() == '0.25' ||
            data.dosage.trim() == '1/4'
          ) {
            data.dosage = 'หนึ่งส่วนสี่';
          } else if (
            data.dosage.trim() == '0.75' ||
            data.dosage.trim() == '3/4'
          ) {
            data.dosage = 'สามส่วนสี่';
          } else if (data.dosage.trim() == '1.5') {
            data.dosage = 'หนึ่งเม็ดครึ่ง';
            freetext_lang = '';
          } else if (data.dosage.trim() == '2.5') {
            data.dosage = 'สองเม็ดครึ่ง';
            freetext_lang = '';
          } else if (data.dosage.trim() == '3.5') {
            data.dosage = 'สามเม็ดครึ่ง';
            freetext_lang = '';
          } else if (data.dosage.trim() == '1.25') {
            data.dosage = '1 เม็ด หนึ่งส่วนสี่';
            freetext_lang = '';
          }
        } else {
          data.dosage = '';
        }
      } else {
        data.dosage = data.dosage
          ? data.dosage.trim() == '0'
            ? ''
            : data.dosage.trim()
          : '';
      }
    }
    let textProbrem = `${lamed} ${data.dosage.trim()} ${freetext_lang} ${
      freetext1[0] ? freetext1[0] : ''
    }`;
    let fix =
      this.dataUser.print_ip == '192.168.124.94'
        ? [0, 10, 10, 70]
        : [0, 37, 7, 42];
    // let fix = [0, 0, 10, 70];
    // let fix = [0, 37, 7, 35];
    var docDefinition = {
      pageSize: { width: 238, height: 255 },
      pageMargins: fix as any,
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
          noWrap: true,
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
              width: 183,
              text: nameDrug,
              bold: true,
              fontSize: data.checkLength ? 13 : 14,
              noWrap: true,
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
          bold: true,
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
          ? freetext2.map(function (item: any) {
              return {
                text: item.trim(),
                alignment: 'center',
                fontSize: 12,
                bold: true,
              };
            })
          : // ? data.drugCode.trim() === 'MIRTA' || data.drugCode.trim() === 'ALEND'
            //   ? {
            //       text: data.freetext2.trim(),
            //       alignment: 'center',
            //       fontSize: 13,
            //       bold: true,
            //     }
            //   : freetext2.map(function (item: any) {
            //       return {
            //         text: item.trim(),
            //         alignment: 'center',
            //         fontSize: item.trim().length >= 80 ? 12 : 13,
            //         bold: true,
            //       };
            //     })
            '',
      ] as any,

      footer: [
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 },
          ],
        },
        {
          columns: data.checkIndication
            ? [
                {
                  width: '*',
                  text: `ชื่อสามัญ : ${data.drugNameTh.trim()} \nข้อบ่งใช้ : ${
                    data.indication
                  }`,
                  fontSize: 12,
                  bold: true,
                },
                // ,
                // ...(data.qrCode
                //   ? [
                //       {
                //         width: '*',
                //         qr: `${data.qrCode}`,
                //         fit: '45',
                //         margin: [0, 5, 0, 0],
                //       },
                //     ]
                //   : []),
              ]
            : [
                {
                  width: 195,
                  text: `ชื่อสามัญ : ${data.drugNameTh.trim()} \nข้อบ่งใช้ : ${
                    data.indication
                  }`,
                  fontSize: 12,
                  bold: true,
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
    // pdfMake.createPdf(docDefinition).getBlob((blob) => {
    //   const url = URL.createObjectURL(blob);
    //   window.open(url, '_blank'); // ต้องอยู่ใน click event
    // });
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
  async getArrImg(val: any, evt: any) {
    this.items = val.pathImage.map(
      (item: any) =>
        new ImageItem({
          src: this.http.imgPath + item + this.mathRandom,
          thumb: this.http.imgPath + item + this.mathRandom,
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

    if (evt) {
      evt.stopPropagation();
    }
  }

  currentSection = 'section1';

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  sendServer(data: any, evt: any) {
    if (this.checkprint) {
      if (data.qty_cut === 0) {
        data.cur_qty = data.qty_real;
        this.printPDF(data).then((dataPDF: any) => {
          if (dataPDF) {
            dataPDF.getBase64(async (buffer: any) => {
              !this.checked
                ? await this.http.Printjs162('convertbuffer', {
                    data: buffer,
                    name: data.hn + ' ' + data.drugCode + '.pdf',
                    ip: this.dataUser.print_ip,

                    printName: this.dataUser.print_name,
                    hn: data.hn + ' ' + data.drugName,
                  })
                : await this.http.PrintjsLocalhost('convertbuffer', {
                    data: buffer,
                    name: data.hn + ' ' + data.drugCode + '_drugcut.pdf',
                    ip: this.dataUser.print_ip,
                    // ip: '192.168.184.163',
                    printName: this.dataUser.print_name,
                    hn: data.hn + ' ' + data.drugName,
                  });
            });
          }
        });
      } else {
        this.sendPDF(data).then((dataPDF: any) => {
          if (dataPDF) {
            dataPDF.getBase64(async (buffer: any) => {
              let getData: any = !this.checked
                ? await this.http.Printjs162('convertbuffer', {
                    data: buffer,
                    name: data.hn + ' ' + data.drugCode + '.pdf',
                    ip: this.dataUser.print_ip,
                    // ip: '192.168.184.163',
                    printName: this.dataUser.print_name,
                    hn: data.hn + ' ' + data.drugName,
                  })
                : await this.http.PrintjsLocalhost('convertbuffer', {
                    data: buffer,
                    name: data.hn + ' ' + data.drugCode + '.pdf',
                    ip: this.dataUser.print_ip,
                    // ip: '192.168.184.163',
                    printName: this.dataUser.print_name,
                    hn: data.hn + ' ' + data.drugName,
                  });

              if (data.cur_qty && data.qty_cut) {
                if (data.qty_real > data.qty_cut) {
                  this.printPDF(data).then((dataPDF: any) => {
                    if (dataPDF) {
                      dataPDF.getBase64(async (buffer: any) => {
                        !this.checked
                          ? await this.http.Printjs162('convertbuffer', {
                              data: buffer,
                              name: data.hn + ' ' + data.drugCode + '.pdf',
                              ip: this.dataUser.print_ip,

                              printName: this.dataUser.print_name,
                              hn: data.hn + ' ' + data.drugName,
                            })
                          : await this.http.PrintjsLocalhost('convertbuffer', {
                              data: buffer,
                              name:
                                data.hn + ' ' + data.drugCode + '_drugcut.pdf',
                              ip: this.dataUser.print_ip,
                              // ip: '192.168.184.163',
                              printName: this.dataUser.print_name,
                              hn: data.hn + ' ' + data.drugName,
                            });
                      });
                    }
                  });
                }
              }

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
    if (evt) {
      evt.stopPropagation();
    }
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
  clickrow: boolean = false;
  sendAccept(data: any, evt: any) {
    if (this.clickrow || !data.checkAccept) {
      data.dataCheck = 2;
      Swal.fire({
        // title: `จำนวน ${data.drugName} คงเหลือ ${data.checkqty} ${
        //   data.unitCode ? data.unitCode.trim() : ''
        // }`,
        imageUrl: data.pathImage
          ? data.typeNum.indexOf('pack') != -1
            ? this.http.imgPath +
              data.pathImage[data.typeNum.indexOf('pack')] +
              this.mathRandom
            : data.pathImage[data.pathImage.length - 1]
            ? this.http.imgPath +
              data.pathImage[data.pathImage.length - 1] +
              this.mathRandom
            : ''
          : '',
        imageWidth: 150,
        imageHeight: 150,
        title: `<strong style="font-size:18px">จำนวน ${data.drugName} คงเหลือ ${
          data.checkqty
        } ${data.unitCode ? data.unitCode.trim() : ''}</strong>`,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        position: 'top',
      }).then(async (result) => {
        if (result.isConfirmed) {
          // if (this.dataUser.ip == 'test') {
          //   let formData = new FormData();
          //   formData.append('device', data.device);
          //   formData.append('drugCode', data.drugCode);
          //   let sendled: any = await this.http.post('update_led', formData);
          // }
          data.ip = this.dataUser.ip
            ? '200.200.200.' + this.dataUser.ip.split('.')[3]
            : '';
          if (this.checkprint) {
            if (data.qty_cut === 0) {
              data.cur_qty = data.qty_real;
              this.printPDF(data).then(async (dataPDF: any) => {
                if (dataPDF) {
                  dataPDF.getBase64(async (buffer: any) => {
                    !this.checked
                      ? await this.http.Printjs162('convertbuffer', {
                          data: buffer,
                          name: data.hn + ' ' + data.drugCode + '.pdf',
                          ip: this.dataUser.print_ip,

                          printName: this.dataUser.print_name,
                          hn: data.hn + ' ' + data.drugName,
                        })
                      : await this.http.PrintjsLocalhost('convertbuffer', {
                          data: buffer,
                          name: data.hn + ' ' + data.drugCode + '_drugcut.pdf',
                          ip: this.dataUser.print_ip,
                          // ip: '192.168.184.163',
                          printName: this.dataUser.print_name,
                          hn: data.hn + ' ' + data.drugName,
                        });
                    let formData: any = new FormData();
                    formData.append('drugcode', data.drugCode);
                    formData.append('drugname', data.drugName);
                    formData.append('phar', this.dataUser.user);
                    formData.append('hn', data.hn);
                    formData.append('cutamount', data.qty_cut);
                    formData.append('realamount', data.qty_real);
                    formData.append(
                      'balanceamount',
                      data.qty_real - data.qty_cut
                    );
                    formData.append('departmentcode', this.select);
                    formData.append(
                      'date',
                      moment(data.lastmodified).format('YYYY-MM-DD HH:mm:ss')
                    );
                    await this.http.post('insertCutDispendDrug', formData);
                    formData = null;
                  });
                }
                data.currentqty = 0;
                data.HisPackageRatio = data.checkqty;

                await this.updateCheckmed(data);
              });
            } else {
              this.sendPDF(data).then((dataPDF: any) => {
                if (dataPDF) {
                  dataPDF.getBase64(async (buffer: any) => {
                    let getData: any = !this.checked
                      ? await this.http.Printjs162('convertbuffer', {
                          data: buffer,
                          name: data.hn + ' ' + data.drugCode + '.pdf',
                          ip: this.dataUser.print_ip,

                          printName: this.dataUser.print_name,
                          hn: data.hn + ' ' + data.drugName,
                        })
                      : await this.http.PrintjsLocalhost('convertbuffer', {
                          data: buffer,
                          name: data.hn + ' ' + data.drugCode + '.pdf',
                          ip: this.dataUser.print_ip,
                          // ip: '192.168.184.163',
                          printName: this.dataUser.print_name,
                          hn: data.hn + ' ' + data.drugName,
                        });

                    if (data.cur_qty && data.qty_cut) {
                      if (data.qty_real > data.qty_cut) {
                        this.printPDF(data).then((dataPDF: any) => {
                          if (dataPDF) {
                            dataPDF.getBase64(async (buffer: any) => {
                              !this.checked
                                ? await this.http.Printjs162('convertbuffer', {
                                    data: buffer,
                                    name:
                                      data.hn + ' ' + data.drugCode + '.pdf',
                                    ip: this.dataUser.print_ip,

                                    printName: this.dataUser.print_name,
                                    hn: data.hn + ' ' + data.drugName,
                                  })
                                : await this.http.PrintjsLocalhost(
                                    'convertbuffer',
                                    {
                                      data: buffer,
                                      name:
                                        data.hn +
                                        ' ' +
                                        data.drugCode +
                                        '_drugcut.pdf',
                                      ip: this.dataUser.print_ip,
                                      // ip: '192.168.184.163',
                                      printName: this.dataUser.print_name,
                                      hn: data.hn + ' ' + data.drugName,
                                    }
                                  );
                              let formData: any = new FormData();
                              formData.append('drugcode', data.drugCode);
                              formData.append('drugname', data.drugName);
                              formData.append('phar', this.dataUser.user);
                              formData.append('hn', data.hn);
                              formData.append('cutamount', data.qty_cut);
                              formData.append('realamount', data.qty_real);
                              formData.append(
                                'balanceamount',
                                data.qty_real - data.qty_cut
                              );
                              formData.append('departmentcode', this.select);
                              formData.append(
                                'date',
                                moment(data.lastmodified).format(
                                  'YYYY-MM-DD HH:mm:ss'
                                )
                              );
                              await this.http.post(
                                'insertCutDispendDrug',
                                formData
                              );
                              formData = null;
                            });
                          }
                        });
                      }
                    }

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
            }
          } else {
            data.currentqty = 0;
            data.HisPackageRatio = data.checkqty;

            await this.updateCheckmed(data);
          }
        }
      });
      if (evt) {
        evt.stopPropagation();
      }
    }
  }

  async changeBarcode(e: any) {
    const { value: result } = await Swal.fire({
      title: 'Input Barcode ',
      html: `<input id="swal-input1"  value="${
        e.barCode ? e.barCode : ''
      }"   class="swal2-input"/>`,

      showConfirmButton: true,
      focusConfirm: false,
      inputAttributes: {
        required: 'true',
      },

      preConfirm: () => {
        const val1 = (
          document.getElementById('swal-input1') as HTMLInputElement
        ).value;

        if (val1) {
          return (document.getElementById('swal-input1') as HTMLInputElement)
            .value;
        } else {
          // Swal.showValidationMessage('Invalid Barcode');
          return 'null';
        }
      },
    });

    if (result) {
      let formData = new FormData();
      formData.append('drugCode', e.drugCode);
      formData.append('barCode', result === 'null' ? '' : result);
      let getData: any = await this.http.post('updateBarcode', formData);
      if (getData.connect) {
        if (getData.response.result) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
          });
          await this.getData(String(e.hn), null);
        } else {
          console.log(getData);
          Swal.fire('ไม่สามารถ Update ข้อมูลได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  }

  async dataFix(data: any) {
    if (this.checkprint) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to print?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
      }).then(async (result) => {
        if (result.isConfirmed) {
          let sendVal = [];
          data.sort((a: any, b: any) => {
            return a.seq - b.seq;
          });

          for (let index = 0; index < data.length; index++) {
            sendVal[index] = {
              user: this.dataUser.user,
              date: moment(this.campaignOne.value.picker).format('YYYY-MM-DD'),
              hn: data[index].hn,
              drugCode: data[index].drugCode.trim(),
              led: this.dataUser.ip,
              check: 1,
              select: this.select,
            };
          }

          let getData: any = !this.checked
            ? await this.http.Printjs162('dataCheckmed', sendVal)
            : await this.http.PrintjsLocalhost('dataCheckmed', sendVal);

          if (getData.connect) {
            if (getData.response.length) {
              this.patient_drug = getData.response;

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
                if (item.checkstamp && !item.checkqty) {
                  return true;
                } else {
                  return false;
                }
              }).length;
              this.sumcheck = this.patient_drug
                .filter(function (item: any) {
                  if (item.checkstamp && !item.checkqty) {
                    return true;
                  } else {
                    return false;
                  }
                })
                .every((v: any) => {
                  return v.checkqty == 0;
                });
              this.data_filter = this.patient_drug.filter(
                (val: any) =>
                  (val.checkDrug && !val.checkstamp) ||
                  (!val.qty && !val.checkstamp)
              );

              this.dataSource = new MatTableDataSource(this.patient_drug);
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'บันทึกข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              console.log(getData);
              Swal.fire('ไม่สามารถสร้างไฟล์ PDF ได้!', '', 'error');
            }
          } else {
            Swal.fire(
              'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Printer ได้!',
              '',
              'error'
            );
          }
        }
      });
    }
  }
  getRecord(val: any) {
    if (val.checkqty) {
      this.sendAccept(val, null);
    } else {
      if (!val.checkstamp) {
        this.sendAccept(val, null);
      } else {
        this.sendServer(val, null);
      }
    }
  }
  drugL: any = [];
  async getDrugL() {
    if (this.ip === this.dataUser.ip) {
      let getData: any = await this.http.post('getdrugL');
      if (getData.connect) {
        if (getData.response.result) {
          this.drugL = getData.response.result;
        } else {
          this.drugL = null;
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  }
  async manageDrugL() {
    this.getDrugL();
    let win: any = window;
    win.$('#drugModal').modal('show');
  }
  async printPDF(data: any) {
    let numHN = data.patientNO ? data.patientNO : String(data.hn);

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

    let lamed = data;

    let freetext1 = lamed.freetext1 ? lamed.freetext1.split(',') : '';
    let free_under = freetext1.slice(1);
    lamed.freetext2 =
      lamed.freetext2.charAt(0) === ','
        ? lamed.freetext2.substring(1)
        : lamed.freetext2;
    let freetext2 = lamed.freetext2.split(',');
    let freetext_lang = lamed.freetext0 ? lamed.freetext0.trim() : '';
    let nameHn = data.patientname + '   HN ' + numHN.trim();

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
          } else if (lamed.dosage.trim() == '1.25') {
            lamed.dosage = '1 เม็ด หนึ่งส่วนสี่';
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
      date = moment(new Date()).add(543, 'year').format('DD/MM/YYYY HH:mm:ss');
    }

    var docDefinition = {
      // pageSize: { width: 325, height: 350 },
      pageSize: { width: 238, height: 255 },
      // pageMargins: [5, 50, 5, 100] as any,
      pageMargins: [0, 37, 7, 50] as any,
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
                data.cur_qty +
                ' ' +
                (data.unit
                  ? data.unit.trim()
                  : data.miniUnit
                  ? data.miniUnit.trim()
                  : data.unitCode
                  ? data.unitCode.trim()
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
          ? lamed.drugCode.trim() === 'MIRTA' ||
            lamed.drugCode.trim() === 'ALEND' ||
            data.drugCode.trim() === 'INSUG2'
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

          fontSize: 12,
          bold: true,
        },
        {
          text: `โทร ${
            getDataprint.response.datasite[0].site_tel
              ? getDataprint.response.datasite[0].site_tel
              : ''
          }`,

          fontSize: 12,
          bold: true,
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
  }
  async getdataButton(data: any) {
    const safeTrim = (val: any) => (typeof val === 'string' ? val.trim() : '');

    const found =
      this.patient_drug.find(
        (item: any) => safeTrim(item.drugCode) === safeTrim(data.drugCode)
      ) || false;

    if (found.drugCode) {
      this.getDrug(`${data.drugCode};${data.qty}`);
    } else {
      Swal.fire('ไม่พบรายการยานี้ในรายการ!', '', 'error');
    }
    //
  }
}
