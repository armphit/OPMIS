import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
declare const window: any;
@Component({
  selector: 'app-check-post',
  templateUrl: './check-post.component.html',
  styleUrls: ['./check-post.component.scss'],
})
export class CheckPostComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('swiper') swiper!: ElementRef;
  @ViewChild('MatSort') sort!: MatSort;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  fileName: string = '';
  xlsxName: string = `ประวัติการรอรับยา ${moment(new Date())
    .add(543, 'year')
    .format('DD-MM-YYYY')}`;
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.fileName = event.target.files[0].name;
    } else {
      this.fileName = '';
    }
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      console.error('กรุณาเลือกไฟล์เพียง 1 ไฟล์');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // 👉 ได้ข้อมูลเป็น array ซ้อน array
      let data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const seen = new Set();
      data = data
        .filter((subArr) => subArr.length > 0 && subArr[0] != null)
        .filter((subArr) => {
          const str = JSON.stringify(subArr);
          if (seen.has(str)) return false; // ซ้ำ → ตัดออก
          seen.add(str);
          return true;
        })
        .map((subArr) => subArr.filter((item) => item != null))
        .map((row, i) => {
          if (i === 0) return row; // header ไม่ต้องแปลง

          const newRow = [...row];

          // แปลงวันที่นัด
          if (typeof row[1] === 'number') {
            newRow[1] = this.excelDateToJSDate(row[1]);
          }

          // แปลงเวลา
          if (typeof row[2] === 'number') {
            newRow[2] = this.excelTimeToJSDate(row[2]);
          }

          if (typeof row[8] === 'number') {
            newRow[8] = this.excelDateToJSDate(row[8]);
          }

          return newRow;
        });

      // ✅ แปลงให้เป็น object โดยฟิกแถวแรกเป็น header
      let headers = data[0];
      const rows = data.slice(1);
      if (headers[headers.length - 1] != 'จำนวน') {
        headers[headers.length] = 'จำนวน';
      }

      const jsonData = rows
        .map((row: any[]) => {
          const obj: any = {};
          headers.forEach((key: string, index: number) => {
            obj[key] = row[index] ?? null;
          });
          return obj;
        })
        .map((row, index) => ({
          ...row,
          isEditing: false,
          ลำดับ: index + 1,
        }));

      if (jsonData.length > 0) {
        setTimeout(() => {
          this.swiper.nativeElement.focus();
        }, 100);
      }
      headers[headers.length] = 'Action';
      headers.unshift(headers.pop());
      this.displayedColumns = headers;

      this.dataSource.data = jsonData;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data, filter: string) => {
        const dataStr = Object.values(data).join('◬').toLowerCase();
        return dataStr.includes(filter);
      };
      this.dataSource.paginator = this.paginator2;
    };
    reader.readAsBinaryString(target.files[0]);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getRecord(val: any) {
    const matches = this.dataSource.data.filter((item: any) => {
      const hn = item['HN - VN'].split('-')[0].trim();
      return hn === val.trim();
    });

    if (matches.length) {
      Swal.fire({
        icon: 'success',
        title: 'การยืนยันเสร็จสิ้น',
        showConfirmButton: false,
        timer: 1500,
      });
      this.dataSource.data = this.dataSource.data.map((item: any) =>
        item['HN - VN'].split('-')[0].trim() === val.trim()
          ? {
              ...item,

              isEditing: true,
            }
          : item
      );

      if (this.dataSource.data.length > 0) {
        setTimeout(() => {
          this.swiper.nativeElement.focus();
        }, 100);
      }
      this.dataSource.data.sort((a, b) => {
        // 1. Sort by status: false < true
        if (a.isEditing !== b.isEditing) {
          return a.isEditing ? 1 : -1;
        }

        // 2. Sort by ลำดับ
        return a.ลำดับ - b.ลำดับ;
      });
      this.dataSource.filterPredicate = (data, filter: string) => {
        const dataStr = Object.values(data).join('◬').toLowerCase();
        return dataStr.includes('');
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator2;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบข้อมูล',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }
  getRow(element: any) {
    // Do something with the selected row data
    console.log('Selected row:', element);
  }
  editableColumn: string | null = null;
  // onCheckPostClick() {
  //   console.log('✅ Angular Click detected');
  //   window.electron.ipcRenderer2.send('check-post-clicked', {
  //     page: 'check-post',
  //     timestamp: new Date().toISOString(),
  //   });
  // }
  toggleEdit(element: any) {
    // element.isEditing = !element.isEditing;

    // if (!element.isEditing) {
    //   // เมื่อกด Save → บันทึกค่า
    //   console.log('บันทึกข้อมูลใหม่:', element);
    //   // TODO: call API เพื่อบันทึก DB
    // }
    Swal.fire({
      title: 'คุณยืนยันข้อมูลใช่หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'Save',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        element.isEditing = !element.isEditing;

        Swal.fire({
          icon: 'success',
          title: 'การยืนยันเสร็จสิ้น',
          showConfirmButton: false,
          timer: 1500,
        });
      }

      if (this.dataSource.data.length > 0) {
        setTimeout(() => {
          this.swiper.nativeElement.focus();
        }, 100);
      }
      this.dataSource.data.sort((a, b) => {
        // 1. Sort by status: false < true
        if (a.isEditing !== b.isEditing) {
          return a.isEditing ? 1 : -1;
        }

        // 2. Sort by ลำดับ
        return a.ลำดับ - b.ลำดับ;
      });
      this.dataSource.filterPredicate = (data, filter: string) => {
        const dataStr = Object.values(data).join('◬').toLowerCase();
        return dataStr.includes('');
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator2;
    });
  }
  excelDateToJSDate(serial: number): string {
    const utc_days = serial - 25569;
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    // เพิ่ม 543 ปีเป็น พ.ศ.
    const year = date_info.getUTCFullYear();
    const month = (date_info.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date_info.getUTCDate().toString().padStart(2, '0');

    return `${day}/${month}/${year}`;
  }

  excelTimeToJSDate(serial: number): string {
    // serial < 1 คือเวลา fraction ของวัน
    const totalSeconds = Math.round(serial * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }

  // toggleEdit(element: any) {
  //   if (!element.isEditing) {
  //     // --- กดครั้งแรก → Action → Save ---
  //     element.isEditing = true;
  //     this.editableColumn = 'ชื่อผู้ใช้บริการ'; // ฟิลด์ที่จะให้แก้ไข
  //   } else {
  //     // --- กดอีกครั้ง → Save → Action ---
  //     element.isEditing = false;
  //     this.editableColumn = null;

  //     // TODO: ส่งข้อมูลไป API หรือบันทึก database
  //     console.log('ข้อมูลที่แก้ไขแล้ว:', element);
  //   }
  // }

  // onFileChange(event: any) {
  //   const target: DataTransfer = <DataTransfer>event.target;

  //   if (target.files.length !== 1) {
  //     console.error('กรุณาเลือกไฟล์เพียง 1 ไฟล์');
  //     return;
  //   }

  //   const reader: FileReader = new FileReader();
  //   reader.onload = (e: any) => {
  //     /* อ่านไฟล์เป็น binary string */
  //     const bstr: string = e.target.result;
  //     const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

  //     /* เอาเฉพาะชีทแรก */
  //     const wsname: string = wb.SheetNames[0];
  //     const ws: XLSX.WorkSheet = wb.Sheets[wsname];

  //     /* แปลงเป็น JSON */
  //     this.jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
  //     console.log(this.jsonData);
  //     // ถ้าอยากได้ key ตาม header row ใช้: XLSX.utils.sheet_to_json(ws);
  //   };
  //   reader.readAsBinaryString(target.files[0]);
  // }
}
