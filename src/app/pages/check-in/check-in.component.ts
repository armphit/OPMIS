import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
export const MY_FORMATS = {
  parse: { dateInput: 'MM/YYYY' },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
})
export class CheckInComponent implements OnInit {
  displayedColumns: string[] = [];
  campaignOne = new FormGroup({
    start: new FormControl(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
    end: new FormControl(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
  });

  // startDate: any = null;
  dataSource: any = null;
  dataDrug: any = [];
  dataLeave_filter: any = null;
  dataLeave: any = [];
  nameExcel: any = null;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  tableRows: {
    id: number;
    control: FormControl;
    filtered$: Observable<any[]>;
    leaveType: string;
    leaveTime: string;
    leaveNote: string;
    leaveDateStart: FormControl;
    leaveDateEnd: FormControl;
    picker: any; // จะเชื่อมกับ template ref หลัง view init
  }[] = [];

  nextId = 1;

  typeleave: Array<string> = [
    '',
    'ลาป่วย',
    'ลากิจ',
    'ลาพักร้อน',
    'ขาดงาน',
    'มาสาย',
  ];
  timeleave: Array<string> = ['', 'เต็มเวลา', 'ครึ่งเช้า', 'ครึ่งบ่าย'];

  selectedUser: any = null;

  filteredOptions!: Observable<any>;
  // picker!: MatDatepickerPanel<MatDatepickerControl<any>, DateRange<any>, any>;
  myControl: FormControl = new FormControl();
  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>,
    private formBuilder: FormBuilder
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
  private _filter(value: any): any[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value?.userName?.toLowerCase() || '';
    return this.selectedUser.filter((option: any) =>
      option.userName.toLowerCase().includes(filterValue)
    );
  }
  displayFn(user: any): string {
    return user && user.userName ? user.userName : '';
  }
  showOrAddRow() {
    const control = new FormControl('');
    const filtered$ = control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
    const leaveDateStart = new FormControl(new Date());
    const leaveDateEnd = new FormControl(new Date());

    this.tableRows.push({
      id: this.nextId,
      control,
      filtered$,
      leaveType: '',
      leaveTime: '',
      leaveNote: '',
      leaveDateStart: leaveDateStart,
      leaveDateEnd: leaveDateEnd,
      picker: null, // จะเชื่อมกับ template ref หลัง view init
    });
    this.nextId++;
  }
  expandLeaveByDay(rows: any[]) {
    const result: any[] = [];

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    rows.forEach((row) => {
      const start = new Date(row.leaveDateStart);
      const end = new Date(row.leaveDateEnd);
      delete row.leaveDateStart;
      delete row.leaveDateEnd;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        result.push({
          ...row,
          leaveDate: formatDate(d),
          dateindex: formatDate(d).replace(/-/g, ''),
          create_dt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          update_dt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    });

    return result;
  }
  hasEmptyRequiredField(rows: any[]): boolean {
    const requiredFields = [
      'control',
      'leaveType',
      'leaveTime',
      'leaveDateStart',
      'leaveDateEnd',
    ];

    return rows.some((row) =>
      requiredFields.some((field) => {
        const value = row[field];

        if (value instanceof FormControl) {
          return value.invalid || value.value === null || value.value === '';
        } else {
          return value === null || value === undefined || value === '';
        }
      })
    );
  }
  async getData2() {
    if (this.tableRows.length) {
      if (this.hasEmptyRequiredField(this.tableRows)) {
        Swal.fire('กรุณากรอกข้อมูลทุกช่อง!', '', 'error');
      } else {
        const formatDate = (d: Date) => {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };
        const values = this.tableRows.map((r) => ({
          userID: r.control.value.USERID,
          leaveNote: r.leaveNote,

          leaveTime: r.leaveTime,
          leaveType: r.leaveType,
          leaveNum: r.leaveTime === 'เต็มเวลา' ? 1 : 0.5,
          userName: r.control.value.userName,
          leaveDateStart: formatDate(r.leaveDateStart.value),
          leaveDateEnd: formatDate(r.leaveDateEnd.value),
        }));
        const expanded = this.expandLeaveByDay(values);

        let send = {
          choice: 2,
          dataLeave: expanded,
          date1: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
          date2: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
        };

        let getData: any = await this.http.postNodejs('doorReport', send);

        if (getData.connect) {
          if (getData.response) {
            let win: any = window;
            win.$('#exampleModal').modal('hide');
            this.dataDrug = getData.response.recordset;
            this.dataFilter();
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'บันทึกข้อมูลสำเร็จ',
              showConfirmButton: false,
              timer: 1500,
            });
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    } else {
      Swal.fire('กรุณาเพิ่มข้อมูลการลาอย่างน้อย 1 แถว', '', 'warning');
      return;
    }
  }

  async getUser() {
    let send = {
      choice: 3,
    };
    let getData: any = await this.http.postNodejs('doorReport', send);

    if (getData.connect) {
      if (getData.response.recordset.length) {
        this.selectedUser = getData.response.recordset;
        this.showOrAddRow();
      } else {
        this.selectedUser = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public getData = async () => {
    this.displayedColumns = [
      'USERID',
      'userName',
      'datestamp',
      'check_in',
      'check_out',
      'type_leave',
      'leave_time',
      'leave_note',
      'Action',
    ];

    let startDate = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    // let formData = new FormData();
    // formData.append('date1', startDate);
    // formData.append('date2', endDate);

    // if (this.typeDevice) {
    //   formData.append('type', this.typeDevice);
    // }
    // let getData: any = await this.http.post('doorReport', formData);
    let send = {
      date1: startDate,
      date2: endDate,
      type: '',
      choice: 1,
    };
    let getData: any = await this.http.postNodejs('doorReport', send);

    if (getData.connect) {
      if (getData.response.recordset.length) {
        this.dataDrug = getData.response.recordset;

        this.dataFilter();
        this.nameExcel = `รายงานเวลาเข้าประตู ${startDate}_${endDate}`;
      } else {
        this.dataDrug = [];
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  getDept: any = null;
  dataFilter() {
    // if (this.getDept) {
    //   this.dataDrug_filter = this.dataDrug.filter(
    //     (val: any) => val.DEPTNAME == this.getDept
    //   );
    // } else {
    //   this.dataDrug_filter = this.dataDrug;
    // }
    this.dataSource = new MatTableDataSource(this.dataDrug);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public async startChange(event: any) {
    if (event.target.value) {
      this.getData();
    }
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  doSomething() {
    // this.typeDevice = e.value;
    this.getData();
  }

  // public async startChange2(event: any) {
  //   if (event.target.value) {
  //     this.getDatafreq();
  //   }
  // }

  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }
  // doSomething2() {
  //   // this.typeDevice = e.value;
  //   this.getDatafreq();
  // }

  getTab(e: any) {
    // this.typeDevice = '';
    this.campaignOne = this.formBuilder.group({
      start: [new Date(new Date().setDate(new Date().getDate() - 1))],
      end: [new Date(new Date().setDate(new Date().getDate() - 1))],
    });
    if (e === 0) {
      this.getData();
    } else if (e === 1) {
      // this.getDatafreq();
    }
  }

  async toggleEdit(element: any) {
    if (!element.isEditing) {
      // เริ่มแก้ไข
      element.isEditing = true;
    } else {
      element.isEditing = false; // กลับสู่โหมดปกติ
      let send = {
        ...element,
        leave_num: element.leave_time
          ? element.leave_time == 'เต็มเวลา'
            ? 1
            : 0.5
          : 1,
        choice: 2,
        date1: moment(this.campaignOne.value.start).format('YYYY-MM-DD'),
        date2: moment(this.campaignOne.value.end).format('YYYY-MM-DD'),
      };

      let getData: any = await this.http.postNodejs('doorReport', send);

      if (getData.connect) {
        if (getData.response.recordset.length) {
          this.dataDrug = getData.response.recordset;

          this.dataFilter();
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          this.dataDrug = [];
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }
  }

  displayedColumns2: any = null;
  dataSource2: any = null;
  leaveTypes: any = ['ลาป่วย', 'ลากิจ', 'ลาพักร้อน', 'ขาดงาน', 'มาสาย'];

  months = [
    { value: 1, name: 'มกราคม' },
    { value: 2, name: 'กุมภาพันธ์' },
    { value: 3, name: 'มีนาคม' },
    { value: 4, name: 'เมษายน' },
    { value: 5, name: 'พฤษภาคม' },
    { value: 6, name: 'มิถุนายน' },
    { value: 7, name: 'กรกฎาคม' },
    { value: 8, name: 'สิงหาคม' },
    { value: 9, name: 'กันยายน' },
    { value: 10, name: 'ตุลาคม' },
    { value: 11, name: 'พฤศจิกายน' },
    { value: 12, name: 'ธันวาคม' },
  ];

  monthStart = 1;
  monthEnd = 1; // แสดง ม.ค.–ก.พ.

  rawData: any = [
    {
      EmployeeId: 1,
      FullName: 'นายอัศนย์ ประโพธิ์ง',
      LeaveMonth: 1,
      LeaveType: 'กิจ',
      Days: 1,
    },
    {
      EmployeeId: 1,
      FullName: 'นายอัศนย์ ประโพธิ์ง',
      LeaveMonth: 1,
      LeaveType: 'ป่วย',
      Days: 2,
    },
    {
      EmployeeId: 1,
      FullName: 'นายอัศนย์ ประโพธิ์ง',
      LeaveMonth: 1,
      LeaveType: 'พักร้อน',
      Days: 0,
    },
    {
      EmployeeId: 2,
      FullName: 'นายวงศกร อุตระกูล',
      LeaveMonth: 1,
      LeaveType: 'กิจ',
      Days: 2,
    },
    {
      EmployeeId: 2,
      FullName: 'นายวงศกร อุตระกูล',
      LeaveMonth: 1,
      LeaveType: 'ป่วย',
      Days: 0,
    },
    {
      EmployeeId: 2,
      FullName: 'นายวงศกร อุตระกูล',
      LeaveMonth: 1,
      LeaveType: 'พักร้อน',
      Days: 2,
    },
    {
      EmployeeId: 1,
      FullName: 'นายอัศนย์ ประโพธิ์ง',
      LeaveMonth: 2,
      LeaveType: 'กิจ',
      Days: 0,
    },
    {
      EmployeeId: 1,
      FullName: 'นายอัศนย์ ประโพธิ์ง',
      LeaveMonth: 2,
      LeaveType: 'ป่วย',
      Days: 0,
    },
    {
      EmployeeId: 1,
      FullName: 'นายอัศนย์ ประโพธิ์ง',
      LeaveMonth: 2,
      LeaveType: 'พักร้อน',
      Days: 1,
    },
    {
      EmployeeId: 2,
      FullName: 'นายวงศกร อุตระกูล',
      LeaveMonth: 2,
      LeaveType: 'กิจ',
      Days: 1,
    },
    {
      EmployeeId: 2,
      FullName: 'นายวงศกร อุตระกูล',
      LeaveMonth: 2,
      LeaveType: 'ป่วย',
      Days: 0,
    },
    {
      EmployeeId: 2,
      FullName: 'นายวงศกร อุตระกูล',
      LeaveMonth: 2,
      LeaveType: 'พักร้อน',
      Days: 0,
    },
  ];
  startMonth: Date | null = null;
  endMonth: Date | null = null;

  // set default year ล่าสุด (ปีปัจจุบัน)
  defaultYear: Date = new Date();

  setMonth(normalizedMonth: Date, type: 'start' | 'end', datepicker: any) {
    if (type === 'start') {
      this.startMonth = new Date(
        normalizedMonth.getFullYear(),
        normalizedMonth.getMonth(),
        1
      );
    } else {
      this.endMonth = new Date(
        normalizedMonth.getFullYear(),
        normalizedMonth.getMonth(),
        1
      );
    }
    datepicker.close();
  }

  chooseMonth2(normalizedMonth: Date, datepicker: any) {
    // fix ปีเป็นปีปัจจุบัน
    const year = this.defaultYear.getFullYear();

    this.endMonth = new Date(year, normalizedMonth.getMonth() + 1, 0);

    datepicker.close();
  }
  chooseMonth(normalizedMonth: Date, datepicker: any) {
    // fix ปีเป็นปีปัจจุบัน
    const year = this.defaultYear.getFullYear();
    this.startMonth = new Date(year, normalizedMonth.getMonth(), 1);

    datepicker.close();
  }
  // formatDate(date: Date): string {
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0'); // เดือนเริ่ม 0
  //   const day = date.getDate().toString().padStart(2, '0');

  //   return `${year}-${month}-${day}`;
  // }

  async getDatafreq() {
    this.dataSource2 = [];
    const getMonthNumber = (dateString: any) => {
      const date = new Date(dateString);
      return date.getMonth() + 1; // getMonth() คืนค่า 0-11, ต้อง +1
    };

    this.monthStart = getMonthNumber(this.startMonth);
    this.monthEnd = getMonthNumber(this.endMonth);
    let send = {
      monthStart: this.monthStart,
      monthEnd: this.monthEnd,
      choice: 4,
    };
    let getData: any = await this.http.postNodejs('doorReport', send);

    if (getData.connect) {
      this.dataLeave_filter = getData.response.data;
      if (getData.response.result.length) {
        const result: { [id: number]: any } = {};
        getData.response.result.forEach((r: any) => {
          if (!result[r.EmployeeId]) {
            result[r.EmployeeId] = {
              Id: r.EmployeeId,
              fullName: r.FullName,
              total: {},
              months: {},
            };
          }

          // รวม
          result[r.EmployeeId].total[r.LeaveType] =
            (result[r.EmployeeId].total[r.LeaveType] || 0) + r.Days;

          // รายเดือน
          if (!result[r.EmployeeId].months[r.LeaveMonth]) {
            result[r.EmployeeId].months[r.LeaveMonth] = {};
          }
          result[r.EmployeeId].months[r.LeaveMonth][r.LeaveType] =
            (result[r.EmployeeId].months[r.LeaveMonth][r.LeaveType] || 0) +
            r.Days;
        });

        // เติม 0 ให้ครบ
        this.dataSource2 = Object.values(result).map((emp) => {
          this.leaveTypes.forEach((t: any) => {
            if (!emp.total[t]) emp.total[t] = 0;
          });
          for (let m = this.monthStart; m <= this.monthEnd; m++) {
            if (!emp.months[m]) emp.months[m] = {};
            this.leaveTypes.forEach((t: any) => {
              if (!emp.months[m][t]) emp.months[m][t] = 0;
            });
          }
          return emp;
        });
      } else {
        this.dataSource2 = [];
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  exportToExcel() {
    const data: any[][] = [];

    // เตรียม header
    const header1: any[] = ['ชื่อ'];
    const header2: any[] = [''];

    // รวม
    header1.push('รวม');
    this.leaveTypes.forEach((t: any) => header2.push(t));

    // เดือน
    this.months.slice(this.monthStart - 1, this.monthEnd).forEach((m) => {
      this.leaveTypes.forEach(() => header1.push(m.name)); // ชื่อเดือนซ้ำตามจำนวน leaveTypes
      this.leaveTypes.forEach((t: any) => header2.push(t)); // กิจ, ป่วย, พักร้อน
    });

    data.push(header1, header2);

    // เตรียม body
    this.dataSource2.forEach((emp: any) => {
      const row: any[] = [];
      row.push(emp.fullName);
      this.leaveTypes.forEach((t: any) => row.push(emp.total[t]));
      for (let m = this.monthStart; m <= this.monthEnd; m++) {
        this.leaveTypes.forEach((t: any) => row.push(emp.months[m][t]));
      }
      data.push(row);
    });

    // สร้าง worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    // กำหนด merge ให้ header
    const merges: XLSX.Range[] = [];

    // ชื่อ
    merges.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }); // 'ชื่อ' rowspan 2

    // รวม
    merges.push({ s: { r: 0, c: 1 }, e: { r: 0, c: this.leaveTypes.length } }); // 'รวม' colspan leaveTypes

    // เดือน
    let col = 1 + this.leaveTypes.length;
    this.months.slice(this.monthStart - 1, this.monthEnd).forEach((m) => {
      merges.push({
        s: { r: 0, c: col },
        e: { r: 0, c: col + this.leaveTypes.length - 1 },
      }); // month colspan
      col += this.leaveTypes.length;
    });

    ws['!merges'] = merges;

    // สร้าง workbook และ export
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'LeaveReport.xlsx');
  }
  onCellClick(
    emp: any,
    monthOrTotal: string | number,
    type: string,
    total: any
  ) {
    if (total) {
      let win: any = window;
      win.$('#leaveModal').modal('show');
      if (monthOrTotal == 'total') {
        this.dataLeave = this.dataLeave_filter.filter(
          (val: any) => val.EmployeeId == emp.Id && val.type_leave == type
        );
      } else {
        this.dataLeave = this.dataLeave_filter.filter(
          (val: any) =>
            val.EmployeeId == emp.Id &&
            val.type_leave == type &&
            val.leave_month == monthOrTotal
        );
      }
    } else {
      this.dataLeave = [];
    }

    // ตัวอย่าง: แสดง popup
    // Swal.fire({
    //   title: 'Cell clicked',
    //   text: `Employee: ${emp.fullName}, Month: ${monthOrTotal}, Type: ${type}`,
    //   icon: 'info',
    // });
  }
}
