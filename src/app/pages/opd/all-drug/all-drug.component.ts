import { Component, OnInit, ViewChild } from '@angular/core';
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

export interface PeriodicElement {
  drugCode: string;
  drugName: string;
  deviceName: string;
  positionID: string;
  LOT_NO: string[];
  EXP_Date: string[];
  qty: string[];
  img: string;
  action: string;
}

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
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    public router: Router,
    private imageCompress: NgxImageCompressService
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngOnInit(): void {}

  dataA: any = null;
  public rowspan: any = null;
  public getData = async () => {
    if (this.dataUser == 'admin') {
      this.displayedColumns = [
        'drugCode',
        'drugName',
        'miniUnit',
        'deviceName',
        'positionID',
        'LOT_NO',
        'EXP_Date',
        'qty',
        'img',
        'action',
      ];
    } else {
      this.displayedColumns = [
        'drugCode',
        'drugName',
        'miniUnit',
        'deviceName',
        'positionID',
        'LOT_NO',
        'EXP_Date',
        'qty',
        'img',
      ];
    }

    this.nameExcel = 'All_Drug_OPD';
    let getData: any = await this.http.get('getAlldrug');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getDrugOnHand: any = await this.http.get('getDrugOnHand');

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

        this.dataA = getData.response.result.map(function (emp: {
          drugCode: any;
        }) {
          return {
            ...emp,
            ...(result.find(
              (item: { drugCode: any }) => item.drugCode === emp.drugCode
            ) ?? { LOT_NO: [''], EXP_Date: [''], qty: [''] }),
          };
        });

        this.dataA.forEach((element: any) => {
          if (element.EXP_Date.length > 1) {
            element.EXP_Date.sort((a: any, b: any) =>
              a < b ? 1 : a > b ? -1 : 0
            );
          }
        });

        this.dataDrug = this.dataA;
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
  imageSrc: any = null;
  public uploadImage(event: any) {
    if (event.target.files) {
      if (event.target.files[0].type.includes('image')) {
        this.upload_img = event.target.files[0];
        this.img_name = this.upload_img.name;
        var splitted = this.upload_img.type.split('/');
        this.upload_img_name = splitted[1];

        let reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (event: any) => {
          this.imageSrc = event.target.result;
        };
      } else {
        Swal.fire('', 'โปรดเลือกรูปภาพ', 'error');
      }
    }
  }
  public closeImg() {
    // this.upload_img = null;
    // this.upload_img_name = null;
    this.imageSrc = null;
    this.drug_code = null;
    // this.img_name = null;
    this.fileToReturn = null;
    this.imgResultAfterCompress = '';
    // this.showCropper = false;
    // this.croppedImage = '';
    // this.imageChangedEvent = '';
  }

  public drug_code: any = null;
  public edit = async (code: any) => {
    this.imgResultAfterCompress = '';
    this.drug_code = code;
    let formData = new FormData();
    formData.append('code', this.drug_code);

    let getData: any = await this.http.post('getPathImg', formData);
    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.imageSrc =
          this.http.imgPath + getData.response.result[0].pathImage;
      } else {
        this.imageSrc = null;
      }
    } else {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  public sendImage = async () => {
    if (this.fileToReturn) {
      let file: File = this.fileToReturn;
      let formData = new FormData();
      formData.append('code', this.drug_code);
      formData.append('upload', file, file.name);
      // formData.append('upload', this.upload_img);
      // formData.append('img_name', this.upload_img_name);
      let getData: any = await this.http.post('addImgDrug', formData);
      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          let win: any = window;
          win.$('#myModal').modal('hide');
          Swal.fire('อัปโหลดรูปภาพเสร็จสิ้น', '', 'success');
          this.upload_img = null;
          this.upload_img_name = null;
          this.imageSrc = null;
          this.drug_code = null;
          this.img_name = null;
          this.fileToReturn = null;
          this.imgResultAfterCompress = '';
          // this.showCropper = false;
          // this.croppedImage = '';
          // this.imageChangedEvent = '';
          this.getData();
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

  // imageChangedEvent: any = '';
  // croppedImage: any = '';
  // canvasRotation = 0;
  // rotation = 0;
  // scale = 1;
  // showCropper = false;
  // containWithinAspectRatio = false;
  // transform: ImageTransform = {};

  // fileChangeEvent(event: any): void {
  //   if (event.target.files) {
  //     if (event.target.files[0].type.includes('image')) {
  //       // this.imageChangedEvent = event;
  //       this.upload_img = event.target.files[0];
  //       this.img_name = event.target.files[0].name;
  //       let reader = new FileReader();
  //       reader.readAsDataURL(event.target.files[0]);
  //       reader.onload = (event: any) => {
  //         this.imageSrc = event.target.result;
  //       };
  //     } else {
  //       Swal.fire('', 'โปรดเลือกรูปภาพ', 'error');
  //     }
  //   }
  // }

  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  imgResultAfterResize: DataUrl = '';
  imgResultUpload: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];

  compressFile() {
    this.imageSrc = null;
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompress = image;
      // console.warn('Size in bytes was:', this.imageCompress.byteCount(image));

      this.imageCompress
        .compressFile(image, orientation, 50, 50)
        .then((result) => {
          // console.log(result);
          this.imgResultAfterCompress = result;
          // console.warn(
          //   'Size in bytes is now:',
          //   this.imageCompress.byteCount(result)
          // );

          this.fileToReturn = this.base64ToFile(result, 'test');
          return this.fileToReturn;
        });
    });
  }

  // imageCropped(event: ImageCroppedEvent) {
  //   this.croppedImage = event.base64;
  //   console.log(event, base64ToFile(event.base64!));
  // }

  // imageLoaded() {
  //   this.showCropper = true;
  // }

  // cropperReady(sourceImageDimensions: Dimensions) {
  //   console.log('Cropper ready', sourceImageDimensions);
  // }

  // loadImageFailed() {
  //   console.log('Load failed');
  // }

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

  fileToReturn: any = null;
  // imageCropped(event: ImageCroppedEvent) {
  //   if (event) {
  //     this.croppedImage = event.base64;
  //     console.log(this.croppedImage);
  //     this.fileToReturn = this.base64ToFile(
  //       event.base64,
  //       this.imageChangedEvent.target.files[0].name
  //     );
  //     return this.fileToReturn;
  //   } else {
  //     this.fileToReturn = null;
  //   }
  // }

  public exportAsExcelFile() {
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.nameExcel + '.xlsx');
  }

  async valuechange() {
    let getData: any = await this.http.get('getAlldrug');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
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

        this.dataA = result.map(function (emp: { drugCode: any }) {
          return {
            ...emp,
            ...(getData.response.result.find(
              (item: { drugCode: any }) => item.drugCode === emp.drugCode
            ) ?? {}),
          };
        });

        this.dataDrug = this.dataA;
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

  clearValue() {
    this.campaignOne = this.formBuilder.group({
      start: [''],
      end: [''],
    });

    this.getData();
  }
}
