import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-manage',
  templateUrl: './patient-manage.component.html',
  styleUrls: ['./patient-manage.component.scss'],
})
export class PatientManageComponent implements OnInit {
  patient: any = {};
  patientId = '';
  drugcut: any = null;
  panels: Record<string, boolean> = {
    patient: true,
    drugs: true,
  };
  checkprint = true;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

  constructor(private http: HttpService) { }

  ngOnInit(): void { }

  togglePanel(key: string): void {
    this.panels[key] = !this.panels[key];
  }

  async scan(): Promise<void> {
    this.patient = {};
    if (!this.patientId) return;

    const getData: any = await this.http.postNodejsTest('getdatapatientipd', {
      hn: this.patientId,
      date: moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD'),
      check: 1,
      user: this.dataUser.user,
    });

    if (getData.connect) {
      if (getData.response) {
        this.patient = getData.response;
        // Reset panels to expanded on each new scan
        this.panels = { patient: true, drugs: true };
      } else {
        Swal.fire('ไม่สามารถ response ได้!', '', 'error');
      }
    } else {
      this.patient = {};
      if (getData?.response?.status === 404) {
        Swal.fire('ไม่พบข้อมูลผู้ป่วย', '', 'warning');
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      }
    }

    this.patientId = '';
  }

  cutDrug(val: any): void {

    //     Swal.fire({
    //       title: 'ยืนยันการค้างจ่ายยา',
    //       html: `
    //     <div style="text-align: left; font-family: 'Sarabun', sans-serif;">
    //       <div style="background: #e6f1fb; padding: 12px; border-radius: 8px; border: 1px solid #185fa5; margin-bottom: 15px;">
    //         <small style="color: #185fa5; display: block; margin-bottom: 2px;">รายการยา:</small>
    //         <strong style="font-size: 16px; color: #1a202c;">${val.orderitemname} &nbsp;&nbsp;&nbsp;&nbsp; ${val.orderqty} ${val.orderunitcode}</strong>
    //       </div>

    //       <label for="qty" style="font-size: 14px; font-weight: 500;">จำนวนที่ตัดจ่าย (${val.orderunitcode}):</label>
    //       <input id="qty" class="swal2-input" type="number" value="1" style="margin-top: 5px; height: 40px;">
    //  </div>
    //   `,
    //       showCancelButton: true,
    //       confirmButtonText: 'ยืนยันการจ่าย',
    //       cancelButtonText: 'ยกเลิก',
    //       confirmButtonColor: '#185fa5',

    //       // ป้องกันการปิดหน้าต่างโดยไม่ตั้งใจ
    //       allowOutsideClick: false,
    //       allowEscapeKey: false,
    //       allowEnterKey: false,

    //       preConfirm: () => {
    //         // 1. ดึง Element มาตรวจสอบก่อน
    //         const qtyInput = document.getElementById('qty') as HTMLInputElement;


    //         // 2. ถ้าหา Element ไม่เจอ (กรณี Error ที่คุณเจอ) ให้แจ้งเตือนระบบ
    //         if (!qtyInput) {
    //           Swal.showValidationMessage('เกิดข้อผิดพลาดภายในระบบ (หาช่องกรอกไม่เจอ)');
    //           return false;
    //         }

    //         const qtyValue = qtyInput.value.trim();


    //         // 3. แจ้งผู้ใช้ถ้ากรอกข้อมูลไม่ครบ (User-Friendly Error)
    //         if (!qtyValue) {
    //           Swal.showValidationMessage('กรุณาระบุ "จำนวนยา"');
    //           qtyInput.focus(); // เลื่อนเคอร์เซอร์ไปที่ช่องที่มีปัญหา
    //           return false;
    //         } else {

    //           if (Number(qtyValue) < 0 || Number(qtyValue) >= val.orderqty || val.orderqty % Number(qtyValue) !== 0) {
    //             Swal.showValidationMessage('จำนวนยาไม่ถูกต้อง');
    //             qtyInput.focus();
    //             return false;
    //           }

    //         }





    //         // ถ้าผ่านหมด ส่งค่ากลับไปทำงานต่อ
    //         return {
    //           qty: qtyValue,
    //           receiver: val.orderqty / Number(qtyValue),

    //         };
    //       }
    Swal.fire({
      title: 'ยืนยันการค้างจ่ายยา',
      html: `
    <div style="text-align: left; font-family: 'Sarabun', sans-serif;">
      <div style="background: #e6f1fb; padding: 12px; border-radius: 8px; border: 1px solid #185fa5; margin-bottom: 15px;">
        <small style="color: #185fa5; display: block; margin-bottom: 2px;">รายการยา:</small>
        <strong style="font-size: 16px; color: #1a202c;">${val.orderitemname} &nbsp;&nbsp;&nbsp;&nbsp; ${val.orderqty} ${val.orderunitcode}</strong>
      </div>

      <label for="qty" style="font-size: 14px; font-weight: 500;">จำนวนที่ตัดจ่าย (${val.orderunitcode}):</label>
      <input id="qty" class="swal2-input" type="number" value="1" style="margin-top: 5px; height: 40px; width: 100%; margin-left: 0; margin-right: 0;">

      <div style="margin-top: 15px; display: flex; align-items: center;">
        <input type="checkbox" id="useCustomDate" style="width: 18px; height: 18px; cursor: pointer;">
        <label for="useCustomDate" style="margin-left: 8px; font-size: 14px; cursor: pointer;">ระบุวันที่กำหนดจ่าย</label>
      </div>

      <div id="dateWrapper" style="display: none; margin-top: 10px;">
        <label for="customDate" style="font-size: 14px; font-weight: 500;">วันที่กำหนด:</label>
        <input id="customDate" class="swal2-input" type="date" style="margin-top: 5px; height: 40px; width: 100%; margin-left: 0; margin-right: 0;">
      </div>
    </div>
  `,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการจ่าย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#185fa5',
      allowOutsideClick: false,

      didOpen: () => {
        // จัดการเรื่องการคลิก checkbox เพื่อเปิด/ปิดช่องเลือกวันที่
        const checkbox = document.getElementById('useCustomDate') as HTMLInputElement;
        const dateWrapper = document.getElementById('dateWrapper') as HTMLDivElement;

        checkbox.addEventListener('change', () => {
          dateWrapper.style.display = checkbox.checked ? 'block' : 'none';
        });
      },

      preConfirm: () => {
        const qtyInput = document.getElementById('qty') as HTMLInputElement;
        const checkbox = document.getElementById('useCustomDate') as HTMLInputElement;
        const dateInput = document.getElementById('customDate') as HTMLInputElement;

        if (!qtyInput) {
          Swal.showValidationMessage('เกิดข้อผิดพลาดภายในระบบ');
          return false;
        }

        const qtyValue = qtyInput.value.trim();

        // ตรวจสอบจำนวนยา
        if (!qtyValue) {
          Swal.showValidationMessage('กรุณาระบุ "จำนวนยา"');
          return false;
        }

        if (Number(qtyValue) <= 0 || Number(qtyValue) > val.orderqty) {
          Swal.showValidationMessage('จำนวนยาไม่ถูกต้อง');
          return false;
        }

        // จัดการเรื่องวันที่
        let finalDate = '';
        const today = new Date().toISOString().split('T')[0]; // Format yyyy-mm-dd

        if (checkbox.checked) {
          if (!dateInput.value) {
            Swal.showValidationMessage('กรุณาเลือกวันที่กำหนด');
            return false;
          }
          finalDate = dateInput.value;
        } else {
          // ถ้าไม่เช็ค ให้ใช้ค่า Default เป็นวันนี้
          finalDate = today;
        }

        return {
          qty: qtyValue,
          receiver: val.orderqty / Number(qtyValue),
          targetDate: finalDate // จะได้วันที่ตามที่ต้องการ
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        let senddata = {
          ...result.value,
          ...val,
        }
        // console.log(senddata);
        // senddata.ip = this.dataUser.ip;
        // senddata.choice = 1;
        // const getprint: any = await this.http.Printjs162('stickerIPD', senddata);
        await this.insertCutdispend(senddata);

      }
    });
  }


  async insertCutdispend(data: any) {
    data.ip = this.dataUser.ip;
    data.choice = 1;

    // 1. ถ้าติ๊กพิมพ์ ให้เช็คเครื่องพิมพ์ก่อน ถ้าพังให้หยุดทันที (Early Return)
    if (this.checkprint) {
      const getprint: any = await this.http.Printjs162('stickerIPD', data);
      if (!getprint.connect) return Swal.fire('ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้!', '', 'error');
    }

    // 2. เตรียมข้อมูล (เขียนครั้งเดียว ใช้ได้ทั้งสองกรณี)
    const formData = new FormData();
    const qty = Number(data.qty);
    // const balance = qty === 0 ? data.orderqty : data.orderqty - qty;

    const fields = {
      drugcode: data.orderitemcode,
      drugname: data.orderitemname,
      phar: this.dataUser.user,
      hn: data.hn,
      cutamount: data.qty,
      realamount: data.orderqty,
      balanceamount: data.orderqty,
      departmentcode: "W7",
      receiver: data.receiver
    };

    Object.entries(fields).forEach(([key, value]) => formData.append(key, value.toString()));

    // 3. ยิง API บันทึกข้อมูล
    const getData: any = await this.http.post('insertCutDispendDrug', formData);

    // 4. เช็คผลลัพธ์การบันทึก
    if (!getData.connect) Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    if (getData.response.rowCount === 0) Swal.fire('ไม่สามารถตัดจ่ายยาได้!', '', 'error');

    // 5. บันทึกสำเร็จ
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: `ตัดจ่ายยา ${data.orderitemname} เรียบร้อยแล้ว`,
      timer: 2000,
      showConfirmButton: false
    });

    this.patientId = data.prescriptionno;
    await this.scan();
    return
  }
  async drugCut(data: any) {


    let formData = new FormData();

    formData.append('hn', data.hn.trim());
    let getData: any = await this.http.post('getCutDispendDrug', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        const result = Array.from(
          new Set(getData.response.result.map((s: { id: any }) => s.id)),
        ).map((lab) => {
          return {
            id: lab,
            id2: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { id2: any }) => edition.id2),
            amount: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { amount: any }) => edition.amount),
            phar2: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { phar2: any }) => edition.phar2),
            phar2_name: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { phar2_name: any }) => edition.phar2_name),
            datetime: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { datetime: any }) => edition.datetime),
            receiver: getData.response.result
              .filter((s: { id: any }) => s.id === lab)
              .map((edition: { receive2: any }) => edition.receive2)
          };
        });

        let dataOwe = getData.response.result;
        dataOwe = dataOwe.filter(
          (value: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.id === value.id),
        );

        dataOwe.forEach((element: any) => {
          delete element['id2'];
          delete element['amount'];
          delete element['phar2'];
          delete element['phar2_name'];
          delete element['datetime'];
        });

        this.drugcut = dataOwe.map(function (emp: { id: any }) {
          return {
            ...emp,
            ...(result.find((item: { id: any }) => item.id === emp.id) ?? {
              id2: [],
              amount: [],
              phar2: [],
              phar2_name: [],
              datetime: [],
            }),
            choice: 2,
          };
        });



        let win: any = window;

        win.$('#modal_owe').modal('show');

        // this.cutDispendModal(this.drugcut[0])
      } else {
        this.drugcut = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  async deleteCutowe(dcc_id: any, val: any, amount: any) {

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
        formData.append('id', val);

        let getData: any = await this.http.post(
          'deleteCutDispendOwe',
          formData,
        );

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            formData.append('cdd_id', dcc_id);
            formData.append('balanceamount', amount);

            let getData2: any = await this.http.post(
              'updateCutDispendDrugOwe',
              formData,
            );

            if (getData2.connect) {
              if (getData2.response.rowCount > 0) {
                this.drugCut(this.patient[0]);

                Swal.fire({
                  icon: 'success',
                  title: 'ลบข้อมูลสำเร็จ',
                  showConfirmButton: false,
                  timer: 1500,
                });
              } else {
                Swal.fire('ไม่สามารถตัดจ่ายยาได้4!', '', 'error');
              }
            } else {
              Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
          } else {
            Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }
  async deleteCutdrug(val: any) {
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
        formData.append('id', val.id);

        let getData2: any = await this.http.post(
          'deleteCutDispendDrug',
          formData,
        );

        if (getData2.connect) {
          if (getData2.response.rowCount > 0) {

            let win: any = window;
            win.$('#modal_owe').modal('hide');
            Swal.fire({
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ',
              showConfirmButton: false,
              timer: 1500,
            });
            this.patientId = val.prescriptionno;
            await this.scan();
          } else {
            Swal.fire('ไม่สามารถลบข้อมูลได้!', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }
  async cutDispendModal(val: any) {


    // console.log(this.patient);
    Swal.fire({
      title: 'ยืนยันการตัดจ่ายยา',
      html: `
    <div style="text-align: left; font-family: 'Sarabun', sans-serif;">
      <div style="background: #e6f1fb; padding: 12px; border-radius: 8px; border: 1px solid #185fa5; margin-bottom: 15px;">
        <small style="color: #185fa5; display: block; margin-bottom: 2px;">รายการยา:</small>
        <strong style="font-size: 16px; color: #1a202c;">${val.drugname} &nbsp;&nbsp;&nbsp;&nbsp; ${val.balanceamount} ${val.miniUnit}</strong>
      </div>

      <label for="qty" style="font-size: 14px; font-weight: 500;">จำนวนที่ตัดจ่าย (${val.miniUnit}):</label>
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
        // console.log(senddata);
        // if (this.checkprint) {
        //   const getprint: any = await this.http.Printjs162('stickerIPD', senddata);
        //   if (!getprint.connect) return Swal.fire('ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้!', '', 'error');
        // }
        await this.updatedispendDrug(senddata, result.value.qty_another);


      }
      return
    });

  }

  async updatedispendDrug(data: any, formValues: any) {
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

            if (Number(data.balanceamount) - Number(formValues) === 0) {
              let win: any = window;

              win.$('#modal_owe').modal('hide');
              this.patientId = this.patient[0]?.prescriptionno;
              this.scan()

            } else {
              await this.drugCut(this.patient[0]);
            }
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
  onTabChange(index: any) {
    this.tabIndex = index;

    if (index === 0) {

      this.scan();

    }
    // else if (index === 1) {
    //   //  console.log(this.tabIndex);
    //   // this.getReport();
    // } else if (index === 2) {

    // }
  }
  tabIndex = 0;
  // async getReport(){
  //    let getData: any = await this.http.post('getReportCutDispend', formData);
  // }
}
