import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import {
  CheckResult,
  Patient,
  PatientService,
} from 'src/app/services/patient.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-check-patient',
  templateUrl: './check-patient.component.html',
  styleUrls: ['./check-patient.component.scss'],
})
export class CheckPatientComponent implements OnInit {
  patient: any = [];
  patient2?: Patient;
  patientId = '';
  medications: any = [];
  constructor(
    private patientService: PatientService,
    private http: HttpService
  ) {
    this.patientService.scanPatient(this.patientId).subscribe((data) => {
      this.medications = data.medications;
    });

    // this.medications = new MatTableDataSource(this.patient_drug);
  }

  async scan() {
    let getData: any = await this.http.postNodejsTest('getdatacpoe', {
      hn: this.patientId,
      date: moment(new Date())
        .year(moment().year() + 543)
        .format('YYYYMMDD'),
    });

    if (getData.connect) {
      if (getData.response) {
        this.patient = getData.response;
        if (!this.patient[0]) {
          Swal.fire(getData.response.message, '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถ response ได้!', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    this.patientService.scanPatient(this.patientId).subscribe((data) => {
      this.patient2 = data;
    });
  }
  openDetail(check: CheckResult) {
    let win: any = window;
    win.$('#staticBackdrop').modal('show');
    // if (check.status === "fail") {
    //   const modalRef = this.modalService.open(CheckDetailModalComponent, {
    //     size: "lg",
    //   });
    //   modalRef.componentInstance.check = check;
    // }
  }

  ngOnInit(): void {}
}
