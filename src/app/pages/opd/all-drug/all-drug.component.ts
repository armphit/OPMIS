import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  DataUrl,
  NgxImageCompressService,
  UploadResponse,
} from 'ngx-image-compress';
import * as moment from 'moment';
import {
  Gallery,
  GalleryItem,
  ImageItem,
  ThumbnailsPosition,
} from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';

@Component({
  selector: 'app-all-drug',
  templateUrl: './all-drug.component.html',
  styleUrls: ['./all-drug.component.scss'],
})
export class AllDrugComponent implements OnInit {
  public Date = new Date();
  public dataDrug: any = null;
  public campaignOne = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  public startDate: any = null;
  public endDate: any = null;

  public nameExcel: any = null;
  public dataSource: any = null;

  public displayedColumns: string[] = [];

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}')
    .role;

  items!: GalleryItem[];
  mathRandom: any = '?lastmod=' + Math.random();
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    public router: Router,
    private imageCompress: NgxImageCompressService,
    public gallery: Gallery,
    public lightbox: Lightbox
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngOnInit(): void {}

  public rowspan: any = null;

  public getData = async () => {
    // if (this.dataUser == 'admin') {
    //   this.displayedColumns = [
    //     'drugCode',
    //     'drugName',
    //     'miniUnit',
    //     'deviceName',
    //     'positionID',
    //     'barCode',
    //     'LOT_NO',
    //     'EXP_Date',
    //     'qty',
    //     'img',
    //   ];
    // } else {
    //   this.displayedColumns = [
    //     'drugCode',
    //     'drugName',
    //     'miniUnit',
    //     'deviceName',
    //     'positionID',
    //     'barCode',
    //     'LOT_NO',
    //     'EXP_Date',
    //     'qty',
    //     'img',
    //   ];
    // }

    this.displayedColumns = [
      'drugCode',
      'drugName',
      'miniUnit',
      'deviceName',
      'positionID',
      'barCode',
      // 'LOT_NO',
      // 'EXP_Date',
      // 'qty',
      'img',
      'qty_cut',
    ];
    this.nameExcel = 'All_Drug_OPD';
    let getData: any = await this.http.get('getAlldrug');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        // let getDrugOnHand: any = await this.http.get('getDrugOnHand');

        // const result = Array.from(
        //   new Set(
        //     getDrugOnHand.response.result.map(
        //       (s: { drugCode: any }) => s.drugCode
        //     )
        //   )
        // ).map((lab) => {
        //   return {
        //     drugCode: lab,
        //     LOT_NO: getDrugOnHand.response.result
        //       .filter((s: { drugCode: any }) => s.drugCode === lab)
        //       .map((edition: { LOT_NO: any }) => edition.LOT_NO),
        //     EXP_Date: getDrugOnHand.response.result
        //       .filter((s: { drugCode: any }) => s.drugCode === lab)
        //       .map((edition: { EXP_Date: any }) => edition.EXP_Date),
        //     qty: getDrugOnHand.response.result
        //       .filter((s: { drugCode: any }) => s.drugCode === lab)
        //       .map((edition: { amount: any }) => edition.amount),
        //   };
        // });

        // this.dataDrug = getData.response.result.map(function (emp: {
        //   drugCode: any;
        // }) {
        //   return {
        //     ...emp,
        //     ...(result.find(
        //       (item: { drugCode: any }) => item.drugCode === emp.drugCode
        //     ) ?? { LOT_NO: [''], EXP_Date: [''], qty: [''] }),
        //   };
        // });

        // this.dataDrug.forEach((element: any) => {
        //   if (element.EXP_Date.length > 1) {
        //     element.EXP_Date.sort((a: any, b: any) =>
        //       a < b ? 1 : a > b ? -1 : 0
        //     );
        //   }
        // });

        this.dataDrug = getData.response.result;
        this.dataDrug.map((item: any) => {
          if (item.pathImg) {
            item.pathImg = item.pathImg.split(',');
            return item;
          }
        });

        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public upload_img: any = null;
  public upload_img_name: any = null;
  public img_name: any = null;

  public closeImg() {
    this.drug_code = null;
    this.arrFile = [];
    this.imgResultMultiple = [];

    this.imgResultAfterCompress = '';
  }

  public drug_code: any = null;
  public dataCut: any = {
    data: null,
  };
  public formValues: any = null;
  async submitInput(num: any) {
    let user = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
    let formData = new FormData();
    formData.append('code', this.dataCut.drugCode);
    formData.append('user', user.user);
    formData.append('userName', user.name);
    formData.append('qty', this.formValues);

    if (num == 2) {
      if (this.formValues >= 0) {
        if (this.formValues) {
          formData.append('num', '2');

          let getData: any = await this.http.post('drugCut', formData);

          if (getData.connect) {
            if (getData.response.rowCount) {
              formData.append('status', 'เพิ่ม');
              let getData2: any = await this.http.post(
                'adddrugcutLog',
                formData
              );

              if (getData2.connect) {
                if (getData2.response.result) {
                  await this.getData();
                  this.dataSource.filter = this.input.nativeElement.value
                    .trim()
                    .toLowerCase();
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'บันทึกข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  let win: any = window;
                  win.$('#usercut').modal('hide');
                } else {
                  Swal.fire('ไม่สามารถ Update ข้อมูลได้!', '', 'error');
                }
              } else {
                Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
              }
            } else {
              console.log(getData);
              Swal.fire('ไม่สามารถ Update ข้อมูลได้!', '', 'error');
            }
          } else {
            Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
          }
        } else {
          Swal.fire('Invalid number!', '', 'error');
        }
      } else {
        Swal.fire('Invalid number!', '', 'error');
      }
    } else {
      if (this.dataCut.qty_cut) {
        formData.append('num', '3');
        let getData: any = await this.http.post('drugCut', formData);

        if (getData.connect) {
          if (getData.response.result && getData.response.isQuery) {
            formData.append('status', 'ลบ');
            let getData2: any = await this.http.post('adddrugcutLog', formData);

            if (getData2.connect) {
              if (getData2.response.result) {
                await this.getData();
                this.dataSource.filter = this.input.nativeElement.value
                  .trim()
                  .toLowerCase();
                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'ลบข้อมูลสำเร็จ',
                  showConfirmButton: false,
                  timer: 1500,
                });
                let win: any = window;
                win.$('#usercut').modal('hide');
              } else {
                Swal.fire('ไม่สามารถ Update ข้อมูลได้!', '', 'error');
              }
            } else {
              Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
          } else {
            console.log(getData);
            Swal.fire('ไม่สามารถ Update ข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'ไม่มีข้อมูล',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  }
  public edit = async (val: any) => {
    this.dataCut.data = null;
    this.dataCut = val;
    this.formValues = val.qty_cut;
    let formData = new FormData();

    formData.append('code', val.drugCode);
    let getData: any = await this.http.post('getuserCut', formData);

    if (getData.connect) {
      this.dataCut.data = getData.response.result.length
        ? getData.response.result
        : null;
    } else {
      this.dataCut.data = null;
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    let win: any = window;
    win.$('#usercut').modal('show');
  };

  public sendImage = async () => {
    if (this.arrFile) {
      let formData = new FormData();
      formData.append('code', this.drug_code);

      this.arrFile.forEach((item: any) => {
        formData.append('upload[]', item);
      });
      let getData: any = await this.http.post('addImgDrug', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.getData();
          let win: any = window;
          win.$('#myModal').modal('hide');
          Swal.fire('อัปโหลดรูปภาพเสร็จสิ้น', '', 'success');
          this.upload_img = null;
          this.upload_img_name = null;

          this.drug_code = null;
          this.img_name = null;
          this.arrFile = [];
          this.imgResultMultiple = [];
          this.imgResultAfterCompress = '';
        } else {
          console.log(getData);
          Swal.fire('อัปโหลดรูปภาพไม่สำเร็จ', '', 'error');
        }
      } else {
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    } else {
      Swal.fire('', 'โปรดเลือกรูปภาพ', 'error');
    }
  };

  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];
  test: UploadResponse[] = [];
  imgResultAfterResize: any = '';
  public arrFile: any = [];
  public async uploadMultipleFiles() {
    const multipleOrientedFiles =
      await this.imageCompress.uploadMultipleFiles();

    this.imgResultMultiple = multipleOrientedFiles;

    let imgResize = [];
    for (let index = 0; index < this.imgResultMultiple.length; index++) {
      imgResize[index] = await this.imageCompress.compressFile(
        this.imgResultMultiple[index].image,
        this.imgResultMultiple[index].orientation,
        50,
        50
      );
    }

    imgResize.forEach((element: any, index: any) => {
      this.arrFile.push(
        this.base64ToFile(
          element,
          this.drug_code +
            '_' +
            moment(new Date()).format('DDMMYYYYHHmmss') +
            '_' +
            (index + 1)
        )
      );
    });
  }

  base64ToFile(data: any, filename: any) {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  public exportAsExcelFile() {
    let element = document.getElementById('excel-table');

    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.nameExcel + '.xlsx');
  }

  async valuechange() {
    let getData: any = await this.http.get('getAlldrug');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getPathImg: any = await this.http.get('getPathImg');
        const start = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
        const end = moment(this.campaignOne.value.end).format('YYYY-MM-DD');
        this.nameExcel = `All_Drug_OPD_With_EXP (${start} - ${end})`;
        let formData = new FormData();

        formData.append('date1', start);
        formData.append('date2', end);
        let getDrugOnHand: any = await this.http.post(
          'DrugOnHandWithDate',
          formData
        );
        const result = Array.from(
          new Set(
            getDrugOnHand.response.result.map(
              (s: { drugCode: any }) => s.drugCode
            )
          )
        ).map((lab) => {
          return {
            drugCode: lab,
            LOT_NO: getDrugOnHand.response.result
              .filter((s: { drugCode: any }) => s.drugCode === lab)
              .map((edition: { LOT_NO: any }) => edition.LOT_NO),
            EXP_Date: getDrugOnHand.response.result
              .filter((s: { drugCode: any }) => s.drugCode === lab)
              .map((edition: { EXP_Date: any }) => edition.EXP_Date),
            qty: getDrugOnHand.response.result
              .filter((s: { drugCode: any }) => s.drugCode === lab)
              .map((edition: { amount: any }) => edition.amount),
          };
        });

        this.dataDrug = result.map(function (emp: { drugCode: any }) {
          return {
            ...emp,
            ...(getData.response.result.find(
              (item: { drugCode: any }) => item.drugCode === emp.drugCode
            ) ?? {}),
            ...(getPathImg.response.result.find(
              (item: { drugCode: any }) => item.drugCode === emp.drugCode
            ) ?? { pathImg: '' }),
          };
        });

        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public imageData: any = null;

  async getArrImg(val: any) {
    this.items = val.map(
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
  }

  clearValue() {
    this.campaignOne = this.formBuilder.group({
      start: [''],
      end: [''],
    });

    this.getData();
  }

  deleteImg(val: any) {
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
        formData.append('code', val);

        let getData: any = await this.http.post('deleteImg', formData);

        if (getData.connect) {
          if (getData.response.result) {
            this.campaignOne = this.formBuilder.group({
              start: [''],
              end: [''],
            });

            let win: any = window;
            win.$('#myModal').modal('hide');
            this.getData();
            Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
          } else {
            console.log(getData);
            Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }
  imgMultipleDrugCode: UploadResponse[] = [];
  public async uploadDrugCode() {
    const multipleOrientedFiles =
      await this.imageCompress.uploadMultipleFiles();

    this.imgMultipleDrugCode = multipleOrientedFiles;

    let imgResize = [];
    for (let index of this.imgMultipleDrugCode) {
      let spt = index.fileName.split('_');

      imgResize.push({
        img: await this.imageCompress.compressFile(
          index.image,
          index.orientation,
          100,
          50
        ),
        filename: index.fileName.substring(
          0,
          index.fileName.indexOf(
            `${index.fileName.includes('jpg') ? '.jpg' : '.jpeg'}`
          )
        ),
        name: spt.length ? spt[0] : '',
        type: spt.length
          ? spt[1].substring(
              0,
              spt[1].indexOf(`${spt[1].includes('jpg') ? '.jpg' : '.jpeg'}`)
            )
          : '',
      });
    }
    let arrFile: any = [];

    imgResize.forEach((element: any, index: any) => {
      arrFile.push({
        ...element,
        img: this.base64ToFile(element.img, element.filename),
      });
    });
    this.sendImageWithdrugCode(arrFile);
  }
  public sendImageWithdrugCode = async (arrFile: any) => {
    if (arrFile) {
      let formData = new FormData();
      // arrFile.forEach((item: any, index: any) => {
      //   formData.append('upload[]', item);
      //   formData.append('type[]', arrtype[index]);
      // });
      arrFile.forEach((item: any) => {
        formData.append('upload[]', item.img);
        formData.append('code[]', item.name);
        formData.append('type[]', item.type);
      });
      // formData.forEach((value, key) => {
      //   console.log(`${key}:`, value);
      // });
      let getData: any = await this.http.post('addImgWithDrugCode', formData);

      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.getData();
          Swal.fire('อัปโหลดรูปภาพเสร็จสิ้น', '', 'success');
          this.imgMultipleDrugCode = [];
        } else {
          Swal.fire('อัปโหลดรูปภาพไม่สำเร็จ', '', 'error');
        }
      } else {
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    } else {
      Swal.fire('', 'โปรดเลือกรูปภาพ', 'error');
    }
  };

  @ViewChild('input') input!: ElementRef;
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
          await this.getData();
          this.dataSource.filter = this.input.nativeElement.value
            .trim()
            .toLowerCase();
        } else {
          console.log(getData);
          Swal.fire('ไม่สามารถ Update ข้อมูลได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  }
}
