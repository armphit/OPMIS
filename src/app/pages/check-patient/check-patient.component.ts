import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-check-patient',
  templateUrl: './check-patient.component.html',
  styleUrls: ['./check-patient.component.scss'],
})
export class CheckPatientComponent implements OnInit {
  patient: any = {};

  patientId = '';

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  constructor(private http: HttpService) {
    // this.patientService.scanPatient(this.patientId).subscribe((data) => {
    //   this.medications = data.medications;
    // });
    // this.medications = new MatTableDataSource(this.patient_drug);
  }

  async scan() {
    let getData: any = await this.http.postNodejsTest('getdatacpoe', {
      hn: this.patientId,
      date: moment(new Date()).format('YYYY-MM-DD'),
      check: 1,
    });
    console.log(getData);
    if (getData.connect) {
      if (getData.response) {
        this.patient = getData.response;
        // this.allergy = getData.response.finalResult.allergymed;
        // if (!this.patient[0]) {
        //   Swal.fire('1', '', 'error');
        // }
      } else {
        Swal.fire('ไม่สามารถ response ได้!', '', 'error');
      }
    } else {
      this.patient = {};
      if (getData.response.status == 404) {
        Swal.fire('2', '', 'error');
      } else Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  win: any = window;
  openDetail() {
    this.win.$('#staticBackdrop').modal('show');
    // if (check.status === "fail") {
    //   const modalRef = this.modalService.open(CheckDetailModalComponent, {
    //     size: "lg",
    //   });
    //   modalRef.componentInstance.check = check;
    // }
  }

  get allergyStatus(): string {
    const a = this.patient.finalResult?.allergymed[0];

    if (!a?.cid) {
      return 'PASS (No Allergy)';
    } else {
      if (!a?.timestamp) {
        return 'FAIL';
      } else {
        return 'PASS';
      }
    }
  }
  async allergyConfirm() {
    let getData: any = await this.http.postNodejsTest('getdatacpoe', {
      hn: this.patient.todayDrugsHN[0]?.hn,
      user: this.dataUser.user,
      username: this.dataUser.name,
      queue: this.patient.todayDrugsHN[0]?.queue,
      date: moment(new Date()).format('YYYY-MM-DD'),
      site: 'W8',
      text: 'allergy',
      check: 2,
    });
    if (getData.connect) {
      if (getData.response) {
        this.patient.finalResult.allergymed = getData.response.moph_patient;
        this.win.$('#staticBackdrop').modal('hide');
        Swal.fire({
          icon: 'success',
          title: 'การยืนยันเสร็จสิ้น',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire('ไม่สามารถ response ได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  ngOnInit(): void {}
}
