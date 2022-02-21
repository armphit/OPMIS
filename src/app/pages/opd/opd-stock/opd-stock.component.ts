import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

const _window: any = window;

@Component({
  selector: 'app-opd-stock',
  templateUrl: './opd-stock.component.html',
  styleUrls: ['./opd-stock.component.scss'],
})
export class OPDStockComponent implements OnInit {
  public listOPDstock: Array<any> = [];
  public dataSource1: any = null;
  public dataSource2: any = null;
  public dataSource3: any = null;
  public dataSource4: any = null;

  public displayedColumns1: string[] = [
    'INV_Code',
    'drugCode',
    'drugName',
    'amount',
  ];

  public displayedColumns2: string[] = [
    'INV_Code',
    'drugName',
    'REQU_QTY',
    'DISP_QTY',
    'STK_Event',
    'LOT_NO',
    'EXP_Date',
    'price',
    'value',
  ];

  public displayedColumns3: string[] = ['SUB_PO_NO', 'date', 'time'];

  public displayedColumns4: string[] = [
    'LOT_NO',
    'EXP_Date',
    'amount',
    'date',
    'time',
  ];

  public dataInput: string = '';
  public selectDrug: any = null;
  public formpDrug!: FormGroup;
  public time = new Date();
  public datestring =
    this.time.getDate() +
    '-' +
    (this.time.getMonth() + 1) +
    '-' +
    this.time.getFullYear();
  public drugMatching: Array<any> = [];
  public drugNotMatch: Array<any> = [];
  public dataExcel: Array<any> = [];
  public isExcelFile!: boolean;
  public excelName: any;
  public keys!: string[];
  public dataSheet = new Subject();
  public checkSPN!: boolean;
  public checkView!: boolean;
  public listSPN: Array<any> = [];
  public checkMatch!: boolean;
  public listINVcode: Array<any> = [];
  public listPositionDrug: Array<any> = [];
  public listStaff: Array<any> = [];
  public listSE: Array<any> = [];
  public listRefillSE: Array<any> = [];
  public drugReStock: Array<any> = [];
  public drugEL: Array<any> = [];
  public drugJV: Array<any> = [];
  public drugINJ: Array<any> = [];
  public drugR: Array<any> = [];
  public drugM: Array<any> = [];
  public drugN: Array<any> = [];
  public drugCD: Array<any> = [];
  public qty_check: any = null;
  public listStock: Array<any> = [];
  public listLot: Array<any> = [];
  public selectName!: string[];
  public listDrugDispenToday: Array<any> = [];
  public listStockToday: Array<any> = [];
  public keyDrug: any = null;

  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;
  @ViewChild('sort3') sort3!: MatSort;
  @ViewChild('sort4') sort4!: MatSort;

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;
  @ViewChild('paginator4') paginator4!: MatPaginator;

  @ViewChild('table1') table1!: ElementRef;
  @ViewChild('table2') table2!: ElementRef;
  @ViewChild('table3') table3!: ElementRef;

  @ViewChild('inputFile') inputFile!: ElementRef;

  constructor(
    private https: HttpService,
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.checkView = false;
  }

  ngOnInit(): void {
    this.getOPDstock();
    this.getINVcode();
    this.getSPN();
    // this.getStaff();
    // this.getRefillSE();
    this.formpDrug = this.formBuilder.group({
      INV_Code: ['', [Validators.required]],
      drugCode: ['', [Validators.required]],
      LOT_NO: ['', [Validators.required]],
      EXP_Date: ['', [Validators.required]],
      drugName: ['', [Validators.required]],
      amount: ['', [Validators.required]],
    });
    setTimeout(() => {
      // console.log(this.listStock[0]);
      this.ViewLot(this.listStock[0]);
    }, 500);
    // this.test();
  }

  // public test = async () => {
  //   this.listDrugDispenToday = [];
  //   this.listStockToday = [];
  //   this.http
  //     .get(`${environment.apiUrl}listStockToday`)
  //     .toPromise()
  //     .then((val) => {
  //       if (val['rowCount'] > 0) {
  //         this.listStockToday = val['result'];
  //         console.log(this.listStockToday);
  //       }
  //     })
  //     .catch((reason) => {
  //       console.log(reason);
  //       Swal.fire('error', 'ไม่สามารถเขื่อมต่อเชิฟเวอร์ได้', '');
  //     })
  //     .finally(() => {

  //     });
  //   this.http
  //     .get(`${environment.apiUrl}listDrugDispenToday`)
  //     .toPromise()
  //     .then((val) => {
  //       if (val['rowCount'] > 0) {
  //         this.listDrugDispenToday = val['result'];
  //         console.log(this.listDrugDispenToday);

  //       }
  //     })
  //     .catch((reason) => {
  //       console.log(reason);
  //       Swal.fire('error', 'ไม่สามารถเขื่อมต่อเชิฟเวอร์ได้', '');
  //     })
  //     .finally(() => {
  //       this.listDrugDispenToday.forEach((ei, i) => {
  //         let finish = false;
  //         console.log(this.listDrugDispenToday[i]['drugCode'] + ' ' + this.listDrugDispenToday[i]['realAmount'] + '--------------------------------------------')
  //         this.listStockToday.forEach((ej, j) => {
  //           if (finish == false) {
  //             if (this.listDrugDispenToday[i]['drugCode'] == this.listStockToday[j]['drugCode']) {
  //               console.log(this.listStockToday[j]['drugCode'] + ' LOT=' + this.listStockToday[j]['LOT_NO'] + ' ' + this.listStockToday[j]['amount']);
  //               if (parseInt(this.listDrugDispenToday[i]['realAmount']) <= parseInt(this.listStockToday[j]['amount'])) {
  //                 // console.log(this.listDrugDispenToday[i]['drugCode'] + ' '+this.listDrugDispenToday[i]['realAmount'] + ' <= '+this.listStockToday[j]['amount']);
  //                 this.listStockToday[j]['amount'] = parseInt(this.listStockToday[j]['amount']) - parseInt(this.listDrugDispenToday[i]['realAmount']);
  //                 finish = true;
  //               }
  //               else {
  //                 // console.log(this.listDrugDispenToday[i]['drugCode'] + ' '+this.listDrugDispenToday[i]['realAmount'] + ' > '+this.listStockToday[j]['amount']);
  //                 this.listDrugDispenToday[i]['realAmount'] = parseInt(this.listDrugDispenToday[i]['realAmount']) - parseInt(this.listStockToday[j]['amount']);
  //                 this.listStockToday[j]['amount'] = 0;
  //               }
  //               console.log(this.listStockToday[j]['drugCode'] + ' LOT=' + this.listStockToday[j]['LOT_NO'] + ' ' + this.listStockToday[j]['amount']);
  //             }
  //           }
  //         });
  //       });
  //     });
  // }

  public getOPDstock = async () => {
    this.listStock = [];
    this.dataSource1 = [];
    this.http
      .get(`${environment.apiUrl}listStock`)
      .toPromise()
      .then((val: any) => {
        if (val['rowCount'] > 0) {
          this.listStock = val['result'];
          this.dataSource1 = new MatTableDataSource(this.listStock);
          this.dataSource1.sort = this.sort1;
          this.dataSource1.paginator = this.paginator1;
          // console.log(this.listStock[0]);
          // this.ViewLot(this.listStock[0]);
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('error', 'ไม่สามารถเขื่อมต่อเชิฟเวอร์ได้');
      })
      .finally(() => {
        // console.log(this.listOPDstock);
      });
  };

  public getSPN = async () => {
    this.listSPN = [];
    this.http
      .get(`${environment.apiUrl}listSPN`)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.listSPN = val['result'];
          this.dataSource3 = new MatTableDataSource(this.listSPN);
          this.dataSource3.sort = this.sort3;
          this.dataSource3.paginator = this.paginator3;
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      })
      .finally(() => {
        // console.log(this.listSPN);
      });
  };

  public getINVcode = async () => {
    this.listINVcode = [];
    this.http
      .get(`${environment.apiUrl}invCode`)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.listINVcode = val['result'];
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      })
      .finally(() => {
        // console.log(this.listINVcode);
      });
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  public ViewLot = async (data: any) => {
    // console.log(data);
    this.selectName = data['drugName'];
    // console.log(this.selectName);
    this.listLot = [];
    let formData = new FormData();
    formData.append('INV_Code', data['INV_Code']);
    // formData.forEach((value, key) => {
    //   console.log(key + ' : ' + value);
    // });
    this.http
      .post(`${environment.apiUrl}viewLot`, formData)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.listLot = val['result'];
          // console.log(this.listLot);
          this.dataSource4 = new MatTableDataSource(this.listLot);
          this.dataSource4.sort = this.sort4;
          this.dataSource4.paginator = this.paginator4;
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
      })
      .finally(() => {
        // console.log(this.listLot);
      });
  };

  public ViewSPN = async (data: any) => {
    this.excelName = data.SUB_PO_NO;
    this.checkView = true;
    // console.log(data);
    this.dataExcel = [];
    let formData = new FormData();
    formData.append('SUB_PO_NO', data['SUB_PO_NO']);
    // formData.forEach((value, key) => {
    //   console.log(key + ' : ' + value);
    // });
    this.http
      .post(`${environment.apiUrl}viewSPN`, formData)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.dataExcel = val['result'];
          // console.log(this.dataExcel);
          this.dataSource2 = new MatTableDataSource(this.dataExcel);
          this.dataSource2.sort = this.sort2;
          this.dataSource2.paginator = this.paginator2;
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
      })
      .finally(() => {});
  };

  public formAmountUpdate = async (data: any) => {
    // console.log(data);
    this.formpDrug.patchValue({
      INV_Code: data['INV_Code'],
      drugCode: data['drugCode'],
      drugName: data['drugName'],
      LOT_NO: data['LOT_NO'],
      EXP_Date: data['EXP_Date'],
      amount: data['amount'],
    });
  };

  public updateAmount = async () => {
    // console.log(this.formpDrug.value);
    if (this.formpDrug.value.amount != null) {
      let formData = new FormData();
      formData.append('INV_Code', this.formpDrug.value.INV_Code);
      formData.append('LOT_NO', this.formpDrug.value.LOT_NO);
      formData.append('amount', this.formpDrug.value.amount);
      formData.forEach((value, key) => {
        console.log(key + ' : ' + value);
      });
      this.http
        .post(`${environment.apiUrl}updateAmountOPDstock`, formData)
        .toPromise()
        .then((val: any) => {
          Swal.fire('success', 'บันทึกข้อมูลสำเร็จ');
          this.getOPDstock();
          this.ViewLot(this.formpDrug.value);
          _window.$(`#reportModal`).modal('hide');
        })
        .catch((reason) => {
          console.log(reason);
          Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
        })
        .finally(() => {});
    }
  };

  readExcel(evt: any) {
    this.checkView = false;
    this.drugMatching = [];
    this.drugNotMatch = [];
    this.dataExcel = [];
    this.dataSource2 = [];
    let data: any;
    const target: DataTransfer = <DataTransfer>evt.target;
    this.isExcelFile = !!target.files[0].name.match(/(.xls|.xlsx)/);
    this.excelName = String(this.inputFile.nativeElement.value).split('_')[1];
    this.excelName = this.excelName.split('.')[0];
    console.log(this.excelName.length);
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
    if (this.isExcelFile) {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        data = XLSX.utils.sheet_to_json(ws);
        data.forEach((ei: any, i: any) => {
          let formData = {
            INV_Code: data[i]['รหัส'],
            drugName: data[i]['ชื่อสามัญ/ชื่อการค้า'],
            REQU_QTY: data[i]['จน.ขอ x pack'],
            DISP_QTY: data[i]['จน.จ่าย x pack'],
            STK_Event: data[i]['คงคลังปัจจุบัน'],
            LOT_NO: data[i]['Lot no.'],
            EXP_Date: data[i]['วันที่หมดอายุ'],
            price: data[i]['ราคา'],
            value: data[i]['มูลค่า'],
          };
          this.dataExcel.push(formData);
        });
        console.log(this.dataExcel);
        this.dataSource2 = new MatTableDataSource(this.dataExcel);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      };
      reader.readAsBinaryString(target.files[0]);
      reader.onloadend = (e) => {
        this.keys = Object.keys(data[0]);
        this.dataSheet.next(data);
      };
    } else {
      this.inputFile.nativeElement.value = '';
    }
  }

  public clear = async () => {
    this.dataExcel = [];
    this.checkView = false;
    this.drugMatching = [];
    this.drugNotMatch = [];
    this.dataExcel = [];
    this.dataSource2 = [];
    if (this.inputFile) {
      this.inputFile.nativeElement.value = '';
    }
  };

  public matching = async () => {
    this.checkSPN = false;
    this.drugMatching = [];
    this.drugNotMatch = [];
    this.drugReStock = [];
    this.drugEL = [];
    this.drugJV = [];
    this.drugINJ = [];
    this.drugR = [];
    this.drugM = [];
    this.drugN = [];
    this.drugCD = [];
    this.listSPN.forEach((ei, i) => {
      if (this.listSPN[i]['SUB_PO_NO'] == this.excelName) {
        // console.log('duplicate ' + this.listSPN[i]['SUB_PO_NO']);
        this.checkSPN = true;
      }
    });
    /*----------------------------------------------------------------------------------insert SUB_PO*/
    if (this.checkSPN == false) {
      let formData = new FormData();
      formData.append('SUB_PO_NO', this.excelName);
      this.http
        .post(`${environment.apiUrl}insertSPN`, formData)
        .toPromise()
        .then((val: any) => {
          console.log(val);
        })
        .catch((reason) => {
          console.log(reason);
          Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
        })
        .finally(() => {});
    }
    this.dataExcel.forEach((ei, i) => {
      let formData = new FormData();
      formData.append('SUB_PO_NO', this.excelName);
      formData.append('INV_Code', this.dataExcel[i]['INV_Code']);
      formData.append('drugName', this.dataExcel[i]['drugName']);
      let num = this.dataExcel[i]['REQU_QTY'];
      let x = parseInt(num.split(' ')[0]);
      let y = parseInt(num.split(' ')[2]);
      num = x * y;
      formData.append('REQU_QTY', num);
      num = this.dataExcel[i]['DISP_QTY'];
      x = parseInt(num.split(' ')[0]);
      y = parseInt(num.split(' ')[2]);
      num = x * y;
      formData.append('DISP_QTY', num);
      this.qty_check = num;
      num = this.dataExcel[i]['STK_Event'];
      x = parseInt(num.split(' ')[0]);
      y = parseInt(num.split(' ')[2]);
      num = x * y;
      formData.append('STK_Event', num);
      formData.append('LOT_NO', this.dataExcel[i]['LOT_NO']);
      formData.append('EXP_Date', this.dataExcel[i]['EXP_Date']);
      formData.append('price', this.dataExcel[i]['price']);
      formData.append('value', this.dataExcel[i]['value']);
      if (this.checkSPN == false && this.qty_check > 0) {
        /*----------------------------------------------------------------------------------insert requisitions*/
        this.http
          .post(`${environment.apiUrl}insertRQT`, formData)
          .toPromise()
          .then((val: any) => {
            console.log(val);
          })
          .catch((reason) => {
            console.log(reason);
            Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้ ');
          })
          .finally(() => {});
      }

      this.checkMatch = false;
      let checkName = '';
      if (this.dataExcel[i]['drugName'].length > 70) {
        checkName = this.dataExcel[i]['drugName'].substr(0, 70) + '..';
      } else {
        checkName = this.dataExcel[i]['drugName'];
      }
      this.listINVcode.forEach((ej, j) => {
        let num = this.dataExcel[i]['DISP_QTY'];
        let x = parseInt(num.split(' ')[0]);
        let y = parseInt(num.split(' ')[2]);
        let data = {
          invCode: this.listINVcode[j]['InvCode'],
          drugCode: this.listINVcode[j]['DrugCode'],
          drugName: checkName,
          qty: x * y,
          lot: this.dataExcel[i]['LOT_NO'],
          expDate: this.dataExcel[i]['EXP_Date'],
        };
        this.qty_check = data.qty;
        if (this.dataExcel[i]['INV_Code'] == this.listINVcode[j]['InvCode']) {
          formData.append('drugCode', this.listINVcode[j]['DrugCode']);
          if (data.qty > 0) {
            this.drugMatching.push(data);
            this.checkMatch = true;
          }
        }
      });
      if (this.checkMatch == false) {
        formData.append('drugCode', '');
        this.drugNotMatch.push(this.dataExcel[i]);
      }
      // formData.forEach((value, key) => {
      //   console.log(key + ' : ' + value);
      // });

      if (this.checkSPN == false && this.qty_check > 0) {
        /*----------------------------------------------------------------------------------update DictDrug*/
        this.http
          .post(`${environment.apiUrl}updateDictDrug`, formData)
          .toPromise()
          .then((val: any) => {
            console.log(val);
          })
          .catch((reason) => {
            console.log(reason);
            Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
          })
          .finally(() => {});
        /*----------------------------------------------------------------------------------update Inventory*/
        this.http
          .post(`${environment.apiUrl}updateInventory`, formData)
          .toPromise()
          .then((val: any) => {
            // console.log(val);
          })
          .catch((reason) => {
            console.log(reason);
            Swal.fire('error', 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
          })
          .finally(() => {});
      }
    });
    Swal.fire('success', 'นำเข้าข้อมูล ' + this.excelName + ' สำเร็จ');
    /*--------------------------------------------------------------------------------- Matching */
    // this.drugMatching.forEach((ei, i) => {
    //   let total_qty = this.drugMatching[i]['qty'];
    //   let dataInSE = {
    //     invCode: this.drugMatching[i]['invCode'],
    //     drugCode: this.drugMatching[i]['drugCode'],
    //     drugName: this.drugMatching[i]['drugName'],
    //     lot: this.drugMatching[i]['lot'],
    //     expDate: this.drugMatching[i]['expDate'],
    //     device: '',
    //     position: '',
    //     staffCode: '',
    //     staffName: '',
    //     index: 0,
    //   };
    //   /*--------------------------------------------------------------------------------- In SE */
    //   this.listRefillSE.forEach((ej, j) => {
    //     if (
    //       this.drugMatching[i]['drugCode'] == this.listRefillSE[j]['drugCode']
    //     ) {
    //       dataInSE['qty'] = this.listRefillSE[j]['qty'];
    //       dataInSE['device'] = 'SE-Med';
    //       if (this.drugMatching[i]['qty'] <= this.listRefillSE[j]['qty']) {
    //         total_qty = 0;
    //       } else {
    //         total_qty =
    //           this.drugMatching[i]['qty'] - this.listRefillSE[j]['qty'];
    //       }
    //       this.drugReStock.push(dataInSE);
    //     }
    //   });
    //   /*--------------------------------------------------------------------------------- Out SE */
    //   this.listStaff.forEach((ej, j) => {
    //     if (this.drugMatching[i]['drugCode'] == this.listStaff[j]['drugCode']) {
    //       let checkDevice = this.listStaff[j]['deviceCode'];
    //       let dataOutSE = {
    //         invCode: this.drugMatching[i]['invCode'],
    //         drugCode: this.drugMatching[i]['drugCode'],
    //         drugName: this.drugMatching[i]['drugName'],
    //         qty: total_qty,
    //         lot: this.drugMatching[i]['lot'],
    //         expDate: this.drugMatching[i]['expDate'],
    //         device: this.listStaff[j]['deviceCode'],
    //         position: this.listStaff[j]['positionID'],
    //         staffCode: this.listStaff[j]['staff'],
    //         staffName: this.listStaff[j]['staffName'],
    //         index: parseInt(this.listStaff[j]['index']),
    //       };
    //       if (total_qty != 0) {
    //         this.drugReStock.push(dataOutSE);
    //         /*--------------------------------------------------------------------------------- Check Out SE */
    //         if (checkDevice == 'CDMed1') {
    //           this.drugCD.push(dataOutSE);
    //         } else if (checkDevice == 'INJ') {
    //           this.drugINJ.push(dataOutSE);
    //         } else if (checkDevice == 'JV') {
    //           this.drugJV.push(dataOutSE);
    //         } else if (checkDevice.substring(0, 1) == 'M') {
    //           this.drugM.push(dataOutSE);
    //         } else if (checkDevice == 'N') {
    //           this.drugN.push(dataOutSE);
    //         } else if (checkDevice.substring(0, 1) == 'R') {
    //           this.drugR.push(dataOutSE);
    //         } else if (checkDevice.substring(0, 1) == 'H') {
    //           this.drugEL.push(dataOutSE);
    //         } else {
    //         }
    //         if (this.checkSPN == false) {
    //           // if (1 > 0) {
    //           if (checkDevice == 'CDMed1') {
    //             let formData = new FormData();
    //             formData.append('qty', total_qty);
    //             formData.append('id', this.listStaff[j]['drugID']);
    //             this.http
    //               .post(`${environment.apiUrl}opdSrockUpdateCD`, formData)
    //               .toPromise()
    //               .then((val: any) => {
    //                 // console.log(val);
    //               })
    //               .catch((reason) => {
    //                 console.log(reason);
    //                 Swal.fire(
    //                   'error',
    //                   'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้',
    //                   'โปรดติดต่อผู้ดูแลระบบ'
    //                 );
    //               })
    //               .finally(() => { });
    //           } else if (checkDevice == 'INJ') {
    //           } else if (checkDevice == 'JV') {
    //           } else if (checkDevice.substring(0, 1) == 'M') {
    //           } else if (checkDevice == 'N') {
    //           } else if (checkDevice.substring(0, 1) == 'R') {
    //           } else if (checkDevice.substring(0, 1) == 'H') {
    //             /*--------------------------------------------------------------------------------- Update EL */
    //             let formData = new FormData();
    //             formData.append('qty', total_qty);
    //             formData.append('id', this.listStaff[j]['drugID']);
    //             this.http
    //               .post(`${environment.apiUrl}opdSrockUpdateEL`, formData)
    //               .toPromise()
    //               .then((val: any) => {
    //                 // console.log(val);
    //               })
    //               .catch((reason) => {
    //                 console.log(reason);
    //                 Swal.fire(
    //                   'error',
    //                   'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้',
    //                   'โปรดติดต่อผู้ดูแลระบบ'
    //                 );
    //               })
    //               .finally(() => { });
    //           } else {
    //           }
    //         }
    //       }
    //     }
    //   });
    // }
    // );
    this.drugReStock.sort(this.compare);
    this.getSPN();
    this.getOPDstock();
  };

  public compare(a: any, b: any) {
    if (a.index < b.index) {
      return -1;
    }
    if (a.index > b.index) {
      return 1;
    }
    return 0;
  }

  public getStaff = async () => {
    this.listStaff = [];
    this.http
      .get(`${environment.apiUrl}listStaffDevice`)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.listStaff = val['result'];
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      })
      .finally(() => {
        console.log(this.listStaff);
      });
  };

  public getRefillSE = async () => {
    this.listRefillSE = [];
    this.http
      .get(`${environment.apiUrl}refillSE`)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.listRefillSE = val['result'];
        }
      })
      .catch((reason) => {
        console.log(reason);
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      })
      .finally(() => {
        // console.log('listRefillSE');
        // console.log(this.listRefillSE);
      });
  };

  exportExcel1() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table1.nativeElement
    );
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // let datestring =
    //   this.time.getDate() +
    //   1 +
    //   '-' +
    //   (this.time.getMonth() + 1) +
    //   '-' +
    //   this.time.getFullYear();
    XLSX.utils.book_append_sheet(wb, ws, this.excelName);
    /* save to file */
    XLSX.writeFile(wb, 'รายการจัด Stock ' + this.excelName + '.xlsx');
  }

  exportExcel2() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table2.nativeElement
    );
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, this.excelName);
    /* save to file */
    XLSX.writeFile(wb, 'รายการยาไม่มีคู่ ' + this.excelName + '.xlsx');
  }
}
