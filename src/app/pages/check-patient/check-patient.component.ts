// import { Component, OnInit } from '@angular/core';
// import moment from 'moment';
// import { HttpService } from 'src/app/services/http.service';

// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-check-patient',
//   templateUrl: './check-patient.component.html',
//   styleUrls: ['./check-patient.component.scss'],
// })
// export class CheckPatientComponent implements OnInit {
//   patient: any = {};

//   patientId = '';

//   public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
//   constructor(private http: HttpService) {

//   }

//   async scan() {
//     let getData: any = await this.http.postNodejsTest('getdatacpoe', {
//       hn: this.patientId,
//       date: moment(new Date()).format('YYYY-MM-DD'),
//       check: 1,
//     });
//     console.log(getData);
//     if (getData.connect) {
//       if (getData.response) {
//         this.patient = getData.response;

//       } else {
//         Swal.fire('ไม่สามารถ response ได้!', '', 'error');
//       }
//     } else {
//       this.patient = {};
//       if (getData.response.status == 404) {
//         Swal.fire('2', '', 'error');
//       } else Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
//     }
//   }
//   win: any = window;
//   openDetail() {
//     this.win.$('#staticBackdrop').modal('show');

//   }

//   get allergyStatus(): string {
//     const a = this.patient.finalResult?.allergymed[0];

//     if (!a?.cid) {
//       return 'PASS (No Allergy)';
//     } else {
//       if (!a?.timestamp) {
//         return 'FAIL';
//       } else {
//         return 'PASS';
//       }
//     }
//   }
//   async allergyConfirm() {
//     let getData: any = await this.http.postNodejsTest('getdatacpoe', {
//       hn: this.patient.todayDrugsHN[0]?.hn,
//       user: this.dataUser.user,
//       username: this.dataUser.name,
//       queue: this.patient.todayDrugsHN[0]?.queue,
//       date: moment(new Date()).format('YYYY-MM-DD'),
//       site: 'W8',
//       text: 'allergy',
//       check: 2,
//     });
//     if (getData.connect) {
//       if (getData.response) {
//         this.patient.finalResult.allergymed = getData.response.moph_patient;
//         this.win.$('#staticBackdrop').modal('hide');
//         Swal.fire({
//           icon: 'success',
//           title: 'การยืนยันเสร็จสิ้น',
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       } else {
//         Swal.fire('ไม่สามารถ response ได้!', '', 'error');
//       }
//     } else {
//       Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
//     }
//   }

//   ngOnInit(): void {}
// }
import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import Swal from 'sweetalert2';

import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-check-patient',
  templateUrl: './check-patient.component.html',
  styleUrls: ['./check-patient.component.scss'],
})
export class CheckPatientComponent implements OnInit {
  patient: any = {};
  patientId = '';

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

  constructor(private http: HttpService) {}

  ngOnInit(): void {}

  /**
   * Scan HN / Patient ID
   */
  async scan() {
    this.patient = {};

    const getData: any = await this.http.postNodejsTest('getdatacpoe', {
      hn: this.patientId,
      date: moment(new Date()).format('YYYY-MM-DD'),
      check: 1,
      site: 'W8',
    });

    if (getData.connect) {
      if (getData.response) {
        this.patient = getData.response;
        console.log(this.patient);
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

  /**
   * Confirm Allergy จาก child component
   */
  async dataConfirm(data: string) {
    if (!this.patient?.todayDrugsHN?.length) return;

    const payload = {
      hn: this.patient.todayDrugsHN[0]?.hn,
      user: this.dataUser.user,
      username: this.dataUser.name,
      queue: this.patient.todayDrugsHN[0]?.queue,
      date: moment(new Date()).format('YYYY-MM-DD'),
      site: 'W8',
      text: data,
      check: 2,
    };

    const getData: any = await this.http.postNodejsTest('getdatacpoe', payload);

    if (getData.connect && getData.response) {
      // update เฉพาะผล allergy
      if (data === 'allergy') {
        this.patient.finalResult.allergymed = getData.response.moph_patient;
      } else if (data === 'duplicate') {
        this.patient.finalResult.duplicatemed.result = getData.response.updated;
      } else if (data === 'lab') {
        this.patient.finalResult.lab.result = getData.response.updated;
      }

      Swal.fire({
        icon: 'success',
        title: 'การยืนยันเสร็จสิ้น',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
}
