import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-report-scan',
  templateUrl: './report-scan.component.html',
  styleUrls: ['./report-scan.component.scss'],
})
export class ReportScanComponent implements OnInit {
  constructor(private http: HttpService) {}
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  nameExcel7 = '';
  dataSource7: any = null;
  displayedColumns7: any = null;

  headerRow1 = ['user', 'name', 'total', 'OnClickHeader', 'QRCode'];
  headerRow2 = ['OnClick_1', 'OnClick_0'];
  dataColumns = ['user', 'name', 'total', 'OnClick_1', 'OnClick_0', 'QRCode'];
  @ViewChild('input7') input7!: ElementRef;
  @ViewChild('MatSort7') sort7!: MatSort;
  @ViewChild('MatPaginator7') paginator7!: MatPaginator;
  public select: any = '';
  public checkS: any = '';
  dataTable: any = [];
  dataFilter: any = [];
  searchValue: string = '';
  dataSource!: MatTableDataSource<any>;

  ngOnInit(): void {
    // this.reportCheck();
  }

  public reportCheck = async () => {
    this.dataFilter = [];

    let send = {
      datestart: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
      dateend: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
      select: this.select,
      choice: this.checkS,
    };

    let getData: any = await this.http.postNodejsTest('reportcheck', send);

    if (getData.connect) {
      if (Object.values(getData.response).length > 0) {
        this.dataSource = new MatTableDataSource(
          Object.values(getData.response)
        );

        this.dataSource.sort = this.sort7;
        this.dataSource.paginator = this.paginator7;
      } else {
        this.dataSource7 = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  exportExcel() {
    const data = this.dataSource.data;

    // Header ซ้อน 2 ชั้น
    const header1 = ['user', 'name', 'total', 'OnClick', '', 'QRCode'];
    const header2 = ['', '', '', 'OnClick_มีQRCode', 'OnClick_ไม่มีQRCode', ''];

    // Data rows
    const rows = data.map((e) => [
      e.user,
      e.name,
      e.total,
      e.OnClick_1,
      e.OnClick_0,
      e.QRCode,
    ]);

    // รวมทั้งหมด
    const excelData = [header1, header2, ...rows];

    // สร้าง sheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

    // รวมเซลล์ (merge) ให้ OnClick ครอบ 2 คอลัมน์
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // merge C1:D1 (OnClick)
    ];

    // สร้าง workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    XLSX.writeFile(wb, 'onclick_report.xlsx');
  }

  // public async reportCheck() {
  //   const send = {
  //     datestart: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
  //     dateend: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
  //     select: this.select,
  //     choice: this.checkS,
  //   };

  //   const getData: any = await this.http.postNodejsTest('reportcheck', send);
  //   if (getData.connect && getData.response.length > 0) {
  //     this.dataTable = getData.response;
  //     this.initDataSource();
  //   } else {
  //     this.dataSource7 = new MatTableDataSource([]);
  //   }
  // }

  // สร้าง MatTableDataSource และตั้งค่า sort/paginator/filterPredicate
  // private initDataSource() {
  //   this.dataSource7 = new MatTableDataSource(this.dataTable);

  //   // กำหนด filterPredicate ให้สามารถกรองได้หลาย column
  //   this.dataSource7.filterPredicate = (data: any, filter: string) => {
  //     const f: TableFilter = JSON.parse(filter);

  //     const matchSearch =
  //       data.queue.toLowerCase().includes(f.search) ||
  //       data.hn.toLowerCase().includes(f.search) ||
  //       data.patientName.toLowerCase().includes(f.search) ||
  //       data.drugCode.toLowerCase().includes(f.search) ||
  //       data.drugName.toLowerCase().includes(f.search) ||
  //       data.checkAccept.toLowerCase().includes(f.search) ||
  //       data.user.toLowerCase().includes(f.search) ||
  //       data.name.toLowerCase().includes(f.search) ||
  //       data.createDT.toLowerCase().includes(f.search);

  //     const matchCheckS = f.checkS ? data.checkAccept === f.checkS : true;

  //     const matchSelect = f.select
  //       ? f.select === '2'
  //         ? data.site === '2' || data.site === 'M' || data.site === 'P'
  //         : data.site === f.select
  //       : true;

  //     return matchSearch && matchCheckS && matchSelect;
  //   };
  // }

  // // เรียกกรองจาก input search
  // public applyFilter7(event: Event) {
  //   this.searchValue = (event.target as HTMLInputElement).value;
  //   this.updateFilter();
  // }

  // // เรียกกรองจาก filter dropdown (checkAccept / site)
  // public applyFilterDropdown() {
  //   // trigger filterPredicate ใหม่
  //   this.updateFilter();
  // }
  // public updateFilter() {
  //   const f: TableFilter = {
  //     search: this.searchValue.trim().toLowerCase(),
  //     checkS: this.checkS,
  //     select: this.select,
  //   };
  //   this.dataSource7.filter = JSON.stringify(f);
  // }

  // ngOnInit() {

  // }

  // public reportCheck = async () => {
  //   this.dataFilter = [];
  //   this.select = '';
  //   this.checkS = '';
  //   this.displayedColumns7 = [
  //     'queue',
  //     'hn',
  //     'patientname',
  //     'drugCode',
  //     'drugName',
  //     'checkAccept',
  //     'user',
  //     'name',
  //     'createDT',
  //   ];

  //   let send = {
  //     datestart: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
  //     dateend: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
  //     select: this.select,
  //     choice: this.checkS,
  //   };

  //   let getData: any = await this.http.postNodejsTest('reportcheck', send);
  //   if (getData.connect) {
  //     if (getData.response.length > 0) {
  //       this.dataTable = getData.response;
  //       this.dataFilter = this.dataTable;
  //       this.dataSource7 = new MatTableDataSource(this.dataTable);
  //       this.dataSource7.sort = this.sort7;
  //       this.dataSource7.paginator = this.paginator7;
  //       this.nameExcel7 = `${this.select} reportcheck ${send.datestart}_${send.dateend}`;
  //       this.setFilterSearch();
  //       setTimeout(() => {
  //         this.input7.nativeElement.focus();
  //       }, 100);
  //     } else {
  //       this.dataSource7 = null;
  //     }
  //   } else {
  //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //   }
  // };
  // public applyFilter7(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource7.filter = filterValue.trim().toLowerCase();
  // }
  // public filterScan() {
  //   if (this.checkS) {
  //     this.dataFilter = this.dataFilter.filter(
  //       (item: any) => item.checkAccept == this.checkS
  //     );
  //   } else {
  //     this.dataFilter = this.dataTable;
  //   }

  //   if (this.select) {
  //     if (this.select == '2') {
  //       this.dataFilter = this.dataTable.filter(
  //         (item: any) =>
  //           item.site == this.select || item.site == 'M' || item.site == 'P'
  //       );
  //     } else {
  //       this.dataFilter = this.dataTable.filter(
  //         (item: any) => item.site == this.select
  //       );
  //     }
  //   }
  //   this.dataSource7 = new MatTableDataSource(this.dataFilter);
  //   this.dataSource7.sort = this.sort7;
  //   this.dataSource7.paginator = this.paginator7;
  //   this.setFilterSearch();
  // }

  // public filterSite() {
  //   if (this.select) {
  //     if (this.select == '2') {
  //       this.dataFilter = this.dataTable.filter(
  //         (item: any) => item.site == this.select
  //       );
  //     } else {
  //       this.dataFilter = this.dataTable.filter(
  //         (item: any) => item.site == this.select
  //       );
  //     }
  //   } else {
  //     this.dataFilter = this.dataTable;
  //   }
  //   if (this.checkS) {
  //     this.dataFilter = this.dataFilter.filter(
  //       (item: any) => item.checkAccept == this.checkS
  //     );
  //   }
  //   this.dataSource7 = new MatTableDataSource(this.dataFilter);
  //   this.dataSource7.sort = this.sort7;
  //   this.dataSource7.paginator = this.paginator7;
  //   this.setFilterSearch();
  // }
  // setFilterSearch() {
  //   this.dataSource7.filterPredicate = (data: any, filter: string) => {
  //     filter = filter.trim().toLowerCase();
  //     return (
  //       (data.queue + '').toLowerCase().includes(filter) ||
  //       (data.hn + '').toLowerCase().includes(filter) ||
  //       (data.patientname + '').toLowerCase().includes(filter) ||
  //       (data.drugCode + '').toLowerCase().includes(filter) ||
  //       (data.drugName + '').toLowerCase().includes(filter) ||
  //       (data.checkAccept + '').toLowerCase().includes(filter) ||
  //       (data.user + '').toLowerCase().includes(filter) ||
  //       (data.name + '').toLowerCase().includes(filter) ||
  //       (data.createDT + '').toLowerCase().includes(filter)
  //     );
  //   };
  // }
}
