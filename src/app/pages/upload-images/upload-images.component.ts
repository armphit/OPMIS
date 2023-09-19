import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { GalleryItem, Gallery } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';

import {
  DataUrl,
  NgxImageCompressService,
  UploadResponse,
} from 'ngx-image-compress';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.scss'],
})
export class UploadImagesComponent implements OnInit {
  dataDrug: any = null;
  nameExcel: any = null;
  dataSource: any = null;
  displayedColumns: string[] = [];
  items!: GalleryItem[];
  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];
  test: UploadResponse[] = [];
  imgResultAfterResize: any = null;
  imgboxUpload: any = null;
  imgpackUpload: any = null;
  imgtabUpload: any = null;
  arrFile: any = [];
  upload_img: any = null;
  upload_img_name: any = null;
  img_name: any = null;
  mathRandom: any = '?lastmod=' + Math.random();
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private router: Router,
    private imageCompress: NgxImageCompressService,
    private gallery: Gallery,
    private lightbox: Lightbox
  ) {
    this.getData();
  }

  ngOnInit(): void {}
  public getData = async () => {
    this.displayedColumns = ['drugCode', 'drugName', 'miniUnit', 'action'];
    this.nameExcel = 'All_Drug';
    let getData: any = await this.http.get('getAlldrug');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;

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
  // public async uploadMultipleFiles() {
  //   const multipleOrientedFiles =
  //     await this.imageCompress.uploadMultipleFiles();

  //   this.imgResultMultiple = multipleOrientedFiles;

  //   let imgResize = [];
  //   for (let index = 0; index < this.imgResultMultiple.length; index++) {
  //     imgResize[index] = await this.imageCompress.compressFile(
  //       this.imgResultMultiple[index].image,
  //       this.imgResultMultiple[index].orientation,
  //       50,
  //       50
  //     );
  //   }
  //   console.log(imgResize);

  //   imgResize.forEach((element: any, index: any) => {
  //     this.arrFile.push(
  //       this.base64ToFile(
  //         element,
  //         this.drug_code +
  //           '_' +
  //           moment(new Date()).format('DDMMYYYYHHmmss') +
  //           '_' +
  //           (index + 1)
  //       )
  //     );
  //   });
  // }

  uploadFile() {
    return this.imageCompress
      .uploadFile()
      .then(({ image, orientation }: UploadResponse) => {
        this.imageCompress
          .compressFile(image, orientation, 100, 50)
          .then((result: DataUrl) => {
            this.imgboxUpload = result;
          });
      });
  }

  uploadFile2() {
    return this.imageCompress
      .uploadFile()
      .then(({ image, orientation }: UploadResponse) => {
        this.imageCompress
          .compressFile(image, orientation, 100, 50)
          .then((result: DataUrl) => {
            this.imgpackUpload = result;
          });
      });
  }

  uploadFile3() {
    return this.imageCompress
      .uploadFile()
      .then(({ image, orientation }: UploadResponse) => {
        this.imageCompress
          .compressFile(image, orientation, 100, 50)
          .then((result: DataUrl) => {
            this.imgtabUpload = result;
          });
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

  public closeImg() {
    this.drug = null;
    // this.drug_name = null;
    this.arrFile = [];
    this.imgResultMultiple = [];
    this.imgboxUpload = null;
    this.imgpackUpload = null;
    this.imgtabUpload = null;
    this.imgResultAfterCompress = '';
  }

  public drug: any = null;
  barcode = new FormControl('');
  public edit = async (val: any) => {
    this.barcode.setValue(val.barCode);
    this.imgResultAfterResize = null;
    this.imgResultAfterCompress = '';
    this.imgboxUpload = null;
    this.imgpackUpload = null;
    this.imgtabUpload = null;
    this.checkbox = null;
    this.checkpack = null;
    this.checktab = null;
    this.drug = val;

    this.getImgcenter();
  };

  checkbox: any = null;
  checkpack: any = null;
  checktab: any = null;

  public getImgcenter = async () => {
    let formData = new FormData();
    formData.append('code', this.drug.drugCode);

    let getData: any = await this.http.post('getImgcenter', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.checkbox = getData.response.result.find(
          (element: any) => element.typeNum == 'box'
        );
        this.checkbox = this.checkbox
          ? 'http://192.168.185.160:88/api' + this.checkbox.pathImage
          : null;

        this.checkpack = getData.response.result.find(
          (element: any) => element.typeNum == 'pack'
        );
        this.checkpack = this.checkpack
          ? 'http://192.168.185.160:88/api' + this.checkpack.pathImage
          : null;

        this.checktab = getData.response.result.find(
          (element: any) => element.typeNum == 'tab'
        );
        this.checktab = this.checktab
          ? 'http://192.168.185.160:88/api' + this.checktab.pathImage
          : null;
      } else {
        this.checkbox = null;
        this.checkpack = null;
        this.checktab = null;
      }
    } else {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };
  public sendImage = async () => {
    let arrFile = [];
    let arrtype: any = [];

    this.imgboxUpload
      ? arrFile.push(
          this.base64ToFile(this.imgboxUpload, this.drug.drugCode + '_box')
        ) && arrtype.push('box')
      : '';

    this.imgpackUpload
      ? arrFile.push(
          this.base64ToFile(this.imgpackUpload, this.drug.drugCode + '_pack')
        ) && arrtype.push('pack')
      : '';

    this.imgtabUpload
      ? arrFile.push(
          this.base64ToFile(this.imgtabUpload, this.drug.drugCode + '_tab')
        ) && arrtype.push('tab')
      : '';

    if (arrFile.length) {
      let formData = new FormData();
      formData.append('code', this.drug.drugCode);

      arrFile.forEach((item: any, index: any) => {
        formData.append('upload[]', item);
        formData.append('type[]', arrtype[index]);
      });

      let getData: any = await this.http.post('addImgDrugcenter', formData);
      formData.append('drugCode', this.drug.drugCode);
      formData.append('barCode', this.barcode.value);
      let getData2: any = await this.http.post('updateBarcode', formData);
      if (getData.connect) {
        if (getData.response.rowCount > 0) {
          this.getData();
          let win: any = window;
          win.$('#myModal').modal('hide');
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'อัปโหลดรูปภาพเสร็จสิ้น',
            showConfirmButton: false,
            timer: 1500,
          });

          this.upload_img = null;
          this.upload_img_name = null;

          this.drug = null;
          // this.drug_name = null;
          this.img_name = null;
          this.imgboxUpload = null;
          this.imgpackUpload = null;
          this.imgtabUpload = null;
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
      Swal.fire('โปรดอัพโหลดรูปภาพ!', '', 'error');
    }
  };

  deleteImg(path: any, type: any) {
    let s = path.indexOf('api') + 3;
    let result_path = '.' + path.substring(s, path.length);

    Swal.fire({
      title: 'ต้องการลบรูปนี้หรื่อไม่?',

      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('code', this.drug.drugCode);
        formData.append('path', result_path);
        formData.append('type', type);
        let getData: any = await this.http.post('deleteImgcenter', formData);

        if (getData.connect) {
          if (getData.response.result) {
            this.edit(this.drug);
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ',
              showConfirmButton: false,
              timer: 1500,
            });
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
}
