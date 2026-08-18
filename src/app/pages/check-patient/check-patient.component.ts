import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import Swal from 'sweetalert2';

import { HttpService } from 'src/app/services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { DateAdapter } from '@angular/material/core';

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
  statusInsert?: string; // Optional property for statusInsert
}
@Component({
  selector: 'app-check-patient',
  templateUrl: './check-patient.component.html',
  styleUrls: ['./check-patient.component.scss'],
})
export class CheckPatientComponent implements OnInit {
  patient: any = {};
  patientId = { hn: '' };
  selectedSite = 'W8';
  selectedDate: Date = new Date();
  reportDateStart: Date = new Date();
  reportDateEnd: Date = new Date();
  reportSelectedSite = 'W8';
  private _rawResult: any[] = [];

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  displayedColumns: string[] = [
    'prescription',
    'hn',
    'statusCheck',
    'departmentcode',
    'userCheck',
    'Actions',
    'scanDT',
    'drugDetails',

  ];

  dataSource: MatTableDataSource<Prescription> =
    new MatTableDataSource<Prescription>([]);
  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>,
  ) {
    this.dateAdapter.setLocale('th-TH');
    this.scan();
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const text =
        data.prescription + data.hn + data.queue + data.userCheck + data.scanDT;
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
          details: [],
          statusInsert: item.statusInsert || '',
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
    // this.patientId = '1277500';

    if (this.patientId.hn) {
      const dateStr = this.selectedDate
        ? moment(this.selectedDate).format('YYYY-MM-DD')
        : // moment('2026-07-16').format('YYYY-MM-DD')
        moment(new Date()).format('YYYY-MM-DD');

      const getData: any = await this.http.postNodejsTest('getdatacpoe', {
        ...this.patientId,
        date: dateStr,
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
      this.patientId = { hn: '' };
    }
  }
  /**
   * Confirm Allergy จาก child component
   */
  async dataConfirm(data: string) {
    if (!this.patient?.todayDrugsHN?.length) return;
    let id = '';
    const dateStr = this.selectedDate
      ? moment(this.selectedDate).format('YYYY-MM-DD')
      : moment(new Date()).format('YYYY-MM-DD');
    // if (data === 'allergy') {
    //   console.log(this.patient.finalResult.allergymed);
    // } else if (data === 'Duplicate') {
    //   console.log(this.patient.finalResult.duplicatemed.result);
    // } else if (data === 'Lab') {
    //   console.log(this.patient.finalResult.lab.result);
    // } else if (data === 'Dosage') {
    //   console.log(this.patient.finalResult.dosage.result);
    // } else if (data === 'Interdrugaction') {
    //   console.log(this.patient.finalResult.druginteraction.result);
    // } else if (data === 'Appropriatedosage') {
    //   console.log(this.patient.finalResult.appropriatedosage.result);
    // }
    const payload = {
      hn: this.patient.todayDrugsHN[0]?.hn,
      user: this.dataUser.user,
      username: this.dataUser.name,
      queue: this.patient.todayDrugsHN[0]?.queue,
      date: dateStr,
      site: this.dataUser?.role === 'opd' ? this.selectedSite : 'W7',
      text: data,
      check: 2,
    };

    const getData: any = await this.http.postNodejsTest('getdatacpoe', payload);

    if (getData.connect && getData.response) {
      // update เฉพาะผล allergy


      if (data === 'Allergy') {
        this.patient.finalResult.allergymed = getData.response.moph_patient;
      } else if (data === 'Duplicate') {
        this.patient.finalResult.duplicatemed.result = getData.response.updated;
      } else if (data === 'Lab') {
        this.patient.finalResult.lab.result = getData.response.updated;
      } else if (data === 'Dosage') {
        this.patient.finalResult.dosage.result = getData.response.updated;
      } else if (data === 'Interdrugaction') {
        this.patient.finalResult.druginteraction.result =
          getData.response.updated;
      } else if (data === 'Appropriatedosage') {
        this.patient.finalResult.appropriatedosage.result =
          getData.response.updated;
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
    const dateStart = this.reportDateStart
      ? moment(this.reportDateStart).format('YYYY-MM-DD')
      : '';
    const dateEnd = this.reportDateEnd
      ? moment(this.reportDateEnd).format('YYYY-MM-DD')
      : '';
    let formData = new FormData();
    formData.append('dateEnd', dateEnd);
    formData.append('dateStart', dateStart);
    let getData: any = await this.http.post('getDuplicate2', formData);

    if (getData.connect) {
      if (getData.response.rowCount) {
        this._rawResult = getData.response.result;

        this.applyDepartmentFilter();
      } else {
        this._rawResult = [];
        this.dataSource = new MatTableDataSource<Prescription>([]);
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  private applyDepartmentFilter() {
    const site = this.reportSelectedSite;
    let filtered = this._rawResult;

    if (site === 'W8') {
      // W8 => departmentcode = null
      filtered = filtered.filter(
        (item: any) =>
          !item.departmentcode ||
          item.departmentcode === null ||
          item.departmentcode === '' ||
          item.departmentcode === 'W8',
      );
    } else {
      filtered = filtered.filter((item: any) => item.departmentcode === site);
    }

    if (filtered.length) {
      const grouped = this.groupByPrescription(filtered);
      this.dataSource = new MatTableDataSource<Prescription>(grouped);
    } else {
      this.dataSource = new MatTableDataSource<Prescription>([]);
    }
  }
  onTabChange(index: any) {
    if (index === 1) {
      this.getDuplicate();
    } else if (index === 0) {
      this.patientId = { hn: '' };
      this.scan();
    }
  }
  tabIndex = 0;
  async goTab2(row: any) {

    if (row.scanDT) {
      this.selectedDate = moment(row.scanDT, 'YYYY-MM-DD').toDate();
    }
    this.patientId = row
    this.selectedSite = row.departmentcode ? row.departmentcode : 'W8';

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

  onReportSiteChange() {
    this.applyDepartmentFilter();
  }
  changeName(name: string): string {
    return name === 'Appropriatedosage' ? 'QUANTITY' : name;
  }
}
