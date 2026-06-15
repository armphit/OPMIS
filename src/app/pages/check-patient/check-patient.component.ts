import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import Swal from 'sweetalert2';

import { HttpService } from 'src/app/services/http.service';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';

export interface DrugInteraction {
  drug_interaction_type: string;
  drug_interaction_status: string;
  userConfirm: string | null;
}

export interface Prescription {
  prescription: string;
  hn: string;
  keyCreateDT: string;
  statusCheck: string;
  scanDT: string;
  queue: string;
  userCheck: string;
  departmentcode?: string;
  details: DrugInteraction[];
}
@Component({
  selector: 'app-check-patient',
  templateUrl: './check-patient.component.html',
  styleUrls: ['./check-patient.component.scss'],
})
export class CheckPatientComponent implements OnInit {
  patient: any = {};
  patientId = '';
  selectedSite = 'W8';

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  displayedColumns: string[] = ['prescription', 'hn', 'statusCheck', 'departmentcode', 'userCheck', 'Actions', 'scanDT', 'drugDetails'];

  dataSource: MatTableDataSource<Prescription> =
    new MatTableDataSource<Prescription>([]);
  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const text = data.prescription + data.hn + data.queue + data.userCheck + data.scanDT;

      return text.toLowerCase().includes(filter);
    };
  }

  /**
   * Group raw records by prescription into parent-child structure
   */
  private groupByPrescription(rawData: any[]): Prescription[] {
    const map = new Map<string, Prescription>();

    for (const item of rawData) {
      const key = item.prescription;
      if (!map.has(key)) {
        map.set(key, {
          prescription: item.prescription,
          hn: item.hn,
          keyCreateDT: item.keyCreateDT || '',
          statusCheck: item.statusCheck,
          scanDT: item.scanDT || item.scanDT,
          queue: item.queue || '',
          userCheck: item.userCheck,
          departmentcode: item.departmentcode || '',
          details: [], // Will populate below
        });
      }
      const entry = map.get(key)!;
      entry.details.push({
        drug_interaction_type: item.drug_interaction_type,
        drug_interaction_status: item.drug_interaction_status,
        userConfirm: item.userConfirm,
      });
    }

    return Array.from(map.values());
  }

  /**
   * Scan HN / Patient ID
   */
  async scan() {
    this.patient = {};
    if (this.patientId) {
      const getData: any = await this.http.postNodejsTest('getdatacpoe', {
        hn: this.patientId,
        date: moment(new Date()).format('YYYY-MM-DD'),
        check: 1,
        site: this.dataUser?.role === 'opd' ? this.selectedSite : 'W7',
        user: this.dataUser.user,
      });

      if (getData.connect) {
        if (getData.response) {
          this.patient = getData.response;
          // console.log(this.patient);
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
      site: this.dataUser?.role === 'opd' ? this.selectedSite : 'W7',
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
      } else if (data === 'dosage') {
        this.patient.finalResult.dosage.result = getData.response.updated;
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
  async getDuplicate() {
    let getData: any = await this.http.post('getDuplicate');

    if (getData.connect) {
      if (getData.response.rowCount) {
        const grouped = this.groupByPrescription(getData.response.result);
        this.dataSource = new MatTableDataSource<Prescription>(grouped);
      } else {
        this.dataSource = new MatTableDataSource<Prescription>([]);
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  onTabChange(index: any) {
    if (index === 1) {
      this.getDuplicate();
    } else if (index === 0) {
      this.patientId = '';
      this.scan();
    }
  }
  tabIndex = 0;
  async goTab2(row: any) {

    this.patientId = row.hn;
    this.selectedSite = row.departmentcode ? row.departmentcode : 'W8';
    console.log(row);
    console.log('Selected Site:', this.selectedSite);
    this.tabIndex = 0;
    await this.scan();
  }
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  getInteractionClass(type: string): string {
    return 'type-' + type.toLowerCase();
  }

  getStatusClass(status: string): string {
    return status === '0' ? 'status-confirmed' : 'status-pending';
  }

}
