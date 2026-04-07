import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
declare const $: any;
@Component({
  selector: 'app-duplicate-check-card',
  templateUrl: './duplicate-check-card.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class DuplicateCheckCardComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  data: any = {};
  conditionMeta: any = {};
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  constructor(private http: HttpService) {

    this.conditionMeta = {
      condition1: {
        title: 'ยาวันนี้อยู่กลุ่มเดียวกัน',
        icon: 'warning',
        color: 'warn',
        columns: ['currentDrug', 'groupName', 'duplicate'],
      },
      condition2: {
        title: 'ยาย้อนหลัง 10 วัน อยู่กลุ่มเดียวกัน',
        icon: 'history',
        color: 'accent',
        columns: [
          'currentDrug',
          'currentQty',
          'currentUnit',
          'currentSite',
          'currentMedHow',
          'groupName',
          'duplicate',
          'duplicateQty',
          'duplicateUnit',
          'duplicateSite',
          'duplicateMedHow',

          'lastDate',
          'daysDiff',
        ],
      },
      condition3: {
        title: 'ยาย้อนหลัง 120 วัน อยู่กลุ่มเดียวกัน',
        icon: 'event',
        color: 'primary',
        columns: [
          'currentDrug',
          'currentQty',
          'currentUnit',
          'currentSite',
          'currentMedHow',
          'groupName',
          'duplicate',
          'duplicateQty',
          'duplicateUnit',
          'duplicateSite',
          'duplicateMedHow',

          'lastDate',
          'daysDiff',
        ],
      },
    };
  }

  ngOnInit(): void {
    this.data = this.patient?.finalResult?.duplicatemed;
  }

  modalId = 'duplicateModal';
  openModal() {
    const a = this.patient?.finalResult?.duplicatemed?.result;

    if (Object.keys(a).length !== 0) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  get allergyStatus(): string {
    const a = this.patient?.finalResult?.duplicatemed?.result;

    return !a.statusCheck
      ? Object.keys(a).length
        ? 'PASS'
        : 'PASS (ไม่มียาซ้ำซ้อน)'
      : 'FAIL';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.duplicatemed?.result;
    return {
      'bg-success text-white': !a.statusCheck,
      'bg-danger text-white': a.statusCheck,
    };
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
  getDateTime(date: any) {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  }

  async sendPE(d: any, currentDrug?: any) {
    const todayDrugs = this.patient?.todayDrugsHN.find((v: any) => v.invCode === currentDrug);
    let formData = new FormData();
    formData.append('currentDrug', currentDrug);
    formData.append('hn', todayDrugs?.hn);
    formData.append('lastIssTime', todayDrugs?.lastIssTime);
    let getData: any = await this.http.post('getPE', formData);
    if (getData.connect) {
      if (getData.response.rowCount) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'บันทึกข้อมูลไม่สำเร็จ เนื่องจากมีข้อมูล PE อยู่แล้ว',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const { value: pe } = await Swal.fire({
          title: "Select field validation",
          input: "select",
          inputOptions: {
            "pe5": "การสั่งยาซ้ำซ้อน โดยแพทย์ต่างแผนก/ ต่าง Visit",
            "pe6": "การสั่งยาซ้ำซ้อน โดยแพทย์ท่านเดียวกัน",
          },
          showCancelButton: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value) {
                resolve();
              } else {
                resolve("You need to select a field :)");
              }
            });
          }
        });
        if (pe) {

          const payload = {
            hn: todayDrugs?.hn || this.patient?.todayDrugsHN[0]?.hn,
            toSite: todayDrugs?.toSite || this.patient?.todayDrugsHN[0]?.toSite,
            lastIssTime: todayDrugs?.lastIssTime || this.patient?.todayDrugsHN[0]?.lastIssTime,
            doc: todayDrugs?.docName,
            // .replace('T', ' ')      // เปลี่ยน T เป็นช่องว่าง
            // .replace('Z', '')      // เอา Z ออก
            // .slice(0, 10) : this.patient?.todayDrugsHN[0]?.lastIssTime,       // ตัดเอาเฉพาะถึงหลักมิลลิวินาทีที่ 2 (.11),
            ...d,
            currentDrug: currentDrug,
            pe: pe,
            user: this.dataUser.user,
            userName: this.dataUser.name
          }
          console.log('send PE', payload);
          // let getData: any = await this.http.postNodejsTest('addPE', payload);
          // console.log(getData);
          // if (getData.connect) {
          //   if (getData.response.length) {
          //     // this.dataDrug = getData.response.recordset;
          //     Swal.fire({
          //       position: 'center',
          //       icon: 'success',
          //       title: 'บันทึกข้อมูลสำเร็จ',
          //       showConfirmButton: false,
          //       timer: 1500,
          //     });
          //   } else {
          //     Swal.fire('ไม่พบข้อมูล!', '', 'warning');
          //   }
          // } else {
          //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
          // }


          Object.keys(payload).forEach(key => {
            const value = payload[key];

            // ตรวจสอบว่าเป็น Object หรือ Array หรือไม่ (เช่น currentDrug หรือ pe)
            if (typeof value === 'object' && value !== null) {
              // ถ้าเป็น Object ให้แปลงเป็น String ก่อนส่ง
              formData.append(key, JSON.stringify(value));
            } else {
              // ถ้าเป็นค่าปกติ (String, Number) ส่งไปได้เลย
              formData.append(key, value ?? '');
            }
          });

          let getData: any = await this.http.post('addPE', formData);
          if (getData.connect) {


            if (getData.response.rowCount) {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'บันทึกข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'บันทึกข้อมูลไม่สำเร็จ',
                showConfirmButton: false,
                timer: 1500,
              });

            }
          } else {
            Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
          }
        }


      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }


}
