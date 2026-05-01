import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportipd-table',
  templateUrl: './reportipd-table.component.html',
  styleUrls: ['./reportipd-table.component.scss']
})
export class ReportipdTableComponent implements OnInit {
  @Input() Tab: any;
  constructor(private http: HttpService,) {

  }

  ngOnInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Tab']) {
      if (this.Tab) {
        this.getReport();
      }

    }

  }

  campaignOne = new FormGroup({
    start: new FormControl(
      new Date(new Date().setDate(new Date().getDate()))
    ),
    end: new FormControl(
      new Date(new Date().setDate(new Date().getDate()))
    ),
  });
  displayedColumns: string[] = [
    'Action',
    'hn',
    'drugname',
    'balanceamount',
    'amount',



    'realamount',   // รวม drugcode ไว้ข้างในแล้ว
    // จำนวนที่ตัดจ่าย
    'phar',       // คนตัดจ่าย
    'createdDT',  // วันที่ตัดจ่าย
    'receive',    // คนมารับ
    'createDT'    // วันที่มารับ
  ];
  dataDrug: any[] = [];
  dataSource: any = null;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;

  private toLocalDateString(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  async getReport() {
    await Promise.resolve();

    let formData = new FormData();
    formData.append('start', this.toLocalDateString(this.campaignOne.value.start));
    formData.append('end', this.toLocalDateString(this.campaignOne.value.end));
    formData.append('tab', this.Tab);
    let getData: any = await this.http.post('getReportCutDispendIPD', formData);
    // if (getData.connect) {
    //   if (getData.response) {

    //     // Process the report data as needed
    //   }
    // }

    if (getData.connect) {
      if (getData.response.rowCount > 0) {


        this.dataDrug = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {

        this.dataDrug = [];
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public async startChange(event: any) {

    if (event.target.value) {
      this.getReport();
    }
  }
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  async cutDispendModal(val: any) {



    Swal.fire({
      title: 'ยืนยันการตัดจ่ายยา',
      html: `
    <div style="text-align: left; font-family: 'Sarabun', sans-serif;">
      <div style="background: #e6f1fb; padding: 12px; border-radius: 8px; border: 1px solid #185fa5; margin-bottom: 15px;">
        <small style="color: #185fa5; display: block; margin-bottom: 2px;">รายการยา:</small>
        <strong style="font-size: 16px; color: #1a202c;">${val.drugname} </strong>
      </div>

      <label for="qty" style="font-size: 14px; font-weight: 500;">จำนวนที่ตัดจ่าย :</label>
      <input id="qty" class="swal2-input" type="number" value="${Number(val.cutamount)}" disabled style="margin-top: 5px; height: 40px;">

      <label for="receiver" style="font-size: 14px; font-weight: 500; margin-top: 15px; display: block;">ชื่อผู้มารับยา:</label>
      <input id="receiver" class="swal2-input" type="text" placeholder="ระบุ ID เจ้าหน้าที่" style="margin-top: 5px; height: 40px;">
    </div>
  `,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการจ่าย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#185fa5',

      // ป้องกันการปิดหน้าต่างโดยไม่ตั้งใจ
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,

      preConfirm: () => {
        // 1. ดึง Element มาตรวจสอบก่อน
        const qtyInput = document.getElementById('qty') as HTMLInputElement;
        const receiverInput = document.getElementById('receiver') as HTMLInputElement;

        // 2. ถ้าหา Element ไม่เจอ (กรณี Error ที่คุณเจอ) ให้แจ้งเตือนระบบ
        if (!qtyInput || !receiverInput) {
          Swal.showValidationMessage('เกิดข้อผิดพลาดภายในระบบ (หาช่องกรอกไม่เจอ)');
          return false;
        }

        const qtyValue = qtyInput.value.trim();
        const receiverValue = receiverInput.value.trim();

        // 3. แจ้งผู้ใช้ถ้ากรอกข้อมูลไม่ครบ (User-Friendly Error)
        if (!qtyValue) {
          Swal.showValidationMessage('กรุณาระบุ "จำนวนยา"');
          qtyInput.focus(); // เลื่อนเคอร์เซอร์ไปที่ช่องที่มีปัญหา
          return false;
        } else {
          if (Number(qtyValue) <= 0 || Number(qtyValue) > val.balanceamount) {
            Swal.showValidationMessage('จำนวนยาไม่ถูกต้อง');
            qtyInput.focus();
            return false;
          }

        }

        if (!receiverValue) {
          Swal.showValidationMessage('กรุณาระบุ "ผู้มารับยา"');
          receiverInput.focus();
          return false;
        }


        // ถ้าผ่านหมด ส่งค่ากลับไปทำงานต่อ
        return {
          qty_another: qtyValue,
          receiver_another: receiverValue,

        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        let senddata = {
          ...result.value,
          ...val,
        }

        senddata.ip = this.dataUser.ip;
        senddata.choice = 2

        await this.updatedispendDrug(senddata, result.value.qty_another, val);


      }
      return
    });

  }

  async updatedispendDrug(data: any, formValues: any, originalData: any) {
    console.log('Data to send to server:', data);
    let formData = new FormData();
    formData.append('cdd_id', data.id);
    formData.append('phar', this.dataUser.user);
    formData.append('balanceamount', String(Number(data.balanceamount) - Number(formValues)));
    formData.append('amount', String(formValues));
    formData.append('receive', String(data.receiver_another));
    let getData: any = await this.http.post('insertCutDispendOwe', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let getData2: any = await this.http.post(
          'updateCutDispendDrug',
          formData,
        );

        if (getData2.connect) {
          if (getData2.response.rowCount > 0) {
            Swal.fire({
              icon: 'success',
              title:
                Number(data.balanceamount) - Number(formValues) === 0
                  ? `ตัดจ่ายยา ${data.drugname}\n เสร็จสิ้น`
                  : `ตัดจ่ายยา ${data.drugname}\n คงเหลือ ${Number(data.balanceamount) - Number(formValues)} ${data.miniUnit}`,
              showConfirmButton: false,
              timer: 1500,
            });
            this.getReport()
            // if (Number(data.balanceamount) - Number(formValues) === 0) {



            // } else {
            //   Swal.fire('ไม่สามารถบันทึกการตัดจ่ายยาได้!', '', 'error');
            // }
          } else {
            Swal.fire('ไม่สามารถตัดจ่ายยาได้2!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถตัดจ่ายยาได้!3', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
}
