import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import * as XLSX from 'xlsx';
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
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // ✅ แปลงให้เป็น object โดยฟิกแถวแรกเป็น header
      const headers = data[0];
      const rows = data.slice(1);

      const jsonData = rows
        .map((row: any[]) => {
          const obj: any = {};
          headers.forEach((key: string, index: number) => {
            obj[key] = row[index] ?? null;
          });
          return obj;
        })
        .map((row) => ({
          ...row,
          isEditing: false,
        }));
      if (jsonData.length > 0) {
        setTimeout(() => {
          this.swiper.nativeElement.focus();
        }, 100);
      }

      // 👉 เอา keys ของ object แรกมาเป็น column header
      this.displayedColumns = headers;
      this.displayedColumns[this.displayedColumns.length] = 'Action';

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
    this.dataSource.data = this.dataSource.data.map((item: any) =>
      item['เลขที่การจัดส่ง'] === val
        ? {
            ...item,
            ['สถานะ conference']: 'สำเร็จ',
            ['วัน-เวลาที่ conference']: moment(new Date())
              .add(543, 'year')
              .format('DD/MM/YYYY HH:mm:ss'),
          }
        : item
    );

    if (this.dataSource.data.length > 0) {
      setTimeout(() => {
        this.swiper.nativeElement.focus();
      }, 100);
    }

    this.dataSource.filterPredicate = (data, filter: string) => {
      const dataStr = Object.values(data).join('◬').toLowerCase();
      return dataStr.includes('');
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator2;
  }
  getRow(element: any) {
    // Do something with the selected row data
    console.log('Selected row:', element);
  }
  editableColumn: string | null = null;

  toggleEdit(element: any) {
    element.isEditing = !element.isEditing;

    if (!element.isEditing) {
      // เมื่อกด Save → บันทึกค่า
      console.log('บันทึกข้อมูลใหม่:', element);
      // TODO: call API เพื่อบันทึก DB
    }
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
