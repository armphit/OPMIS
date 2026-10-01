import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import Swal from 'sweetalert2';

import { HttpService } from 'src/app/services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { AllergyCheckCardComponent } from './allergy-check-card/allergy-check-card.component';
import { DuplicateCheckCardComponent } from './duplicate-check-card/duplicate-check-card.component';
import { LaboratoryTestComponent } from './laboratory-test/laboratory-test.component';
import { DosageCheckCardComponent } from './dosage-check-card/dosage-check-card.component';
import { InterdrugactionCheckCardComponent } from './interdrugaction-check-card/interdrugaction-check-card.component';
import { AppropriatedosageCheckCardComponent } from './appropriatedosage-check-card/appropriatedosage-check-card.component';
import { DrugdiseaseCheckCardComponent } from './drugdisease-check-card/drugdisease-check-card.component';

declare const $: any;

export interface DrugInteraction {
  drug_interaction_type: string;
  drug_interaction_status: string;
  userConfirm: string | null;
  userCheck?: string | null;
}

export interface Prescription {
  prescription: string;
  hn: string;
  patientname?: string;
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
export class CheckPatientComponent implements OnInit, AfterViewInit {
  patient: any = {};
  patientId = { hn: '' };
  selectedSite = 'W8';
  selectedDate: Date = new Date();
  reportDateStart: Date = new Date();
  reportDateEnd: Date = new Date();
  reportSelectedSite = 'W8';
  reportStatus: 'pending' | 'confirmed' | 'all' = 'all';
  reportRisk = 'all';
  reportSearch = '';
  private _rawResult: any[] = [];
  /** warning ที่ผู้ใช้คลิกแล้ว modal ไม่เปิด (ไม่พบข้อมูล) — ซ่อนเฉพาะ badge นี้ */
  private hiddenRiskTypes = new Set<string>();

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  displayedColumns: string[] = [
    'queue',
    'checkedAt',
    'patient',
    'departmentcode',
    'riskType',
    'status',
    'actions',
  ];

  dataSource: MatTableDataSource<Prescription> =
    new MatTableDataSource<Prescription>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(AllergyCheckCardComponent) allergyCard?: AllergyCheckCardComponent;
  @ViewChild(DuplicateCheckCardComponent) duplicateCard?: DuplicateCheckCardComponent;
  @ViewChild(LaboratoryTestComponent) labCard?: LaboratoryTestComponent;
  @ViewChild(DosageCheckCardComponent) dosageCard?: DosageCheckCardComponent;
  @ViewChild(InterdrugactionCheckCardComponent) interCard?: InterdrugactionCheckCardComponent;
  @ViewChild(AppropriatedosageCheckCardComponent) appropCard?: AppropriatedosageCheckCardComponent;
  @ViewChild(DrugdiseaseCheckCardComponent) drugDiseaseCard?: DrugdiseaseCheckCardComponent;

  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>,
  ) {
    this.dateAdapter.setLocale('th-TH');
    this.scan();
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const text = [
        data.prescription,
        data.hn,
        data.patientname,
        data.queue,
        data.userCheck,
        data.scanDT,
      ]
        .map((value) => value || '')
        .join(' ');
      return text.toLowerCase().includes(filter);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
          patientname: item.patientname || item.patientName || '',
          keyCreateDT: item.keyCreateDT || '',
          statusCheck: item.statusCheck,
          scanDT: item.scanDT || item.keyCreateDT || '',
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
        userConfirm: item.userConfirm ?? null,
        userCheck: item.userCheck ?? null,
      });
    }

    return Array.from(map.values());
  }

  /**
   * กรอง warning ที่ถูกซ่อน (ผู้ใช้คลิกแล้ว modal ไม่เปิด/ไม่พบข้อมูล) ออก
   * และตัด row ที่ไม่เหลือ warning ใด ๆ ทิ้ง
   * ทำงานที่ชั้น render จึงทนต่อการ reload ข้อมูลจาก getDuplicate()
   */
  private removeHiddenRiskTypes(rows: Prescription[]): Prescription[] {
    return rows
      .map((row) => ({
        ...row,
        details: row.details.filter(
          (detail) =>
            !this.hiddenRiskTypes.has(
              `${row.prescription}|${detail.drug_interaction_type}`,
            ),
        ),
      }))
      .filter((row) => row.details.length > 0);
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
      } else if (data === 'Drugdisease') {

        this.patient.finalResult.drugdisease.result =
          getData.response.updated?.[0];
        ;
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
  async getDuplicate(resetHidden = false) {
    // ปุ่ม "โหลดข้อมูล" = รีเฟรชใหม่ -> ล้างรายการที่ซ่อนไว้ ให้กลับมาเหมือนเดิม
    if (resetHidden) {
      this.hiddenRiskTypes.clear();
    }
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

        this.applyReportFilters();
      } else {
        this._rawResult = [];
        this.dataSource = new MatTableDataSource<Prescription>([]);
        this.dataSource.paginator = this.paginator;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  private applyReportFilters() {
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

    let grouped = this.groupByPrescription(filtered);
    grouped = this.removeHiddenRiskTypes(grouped);
    grouped = grouped.filter((row) => {
      const matchesStatus =
        this.reportStatus === 'all' ||
        (this.reportStatus === 'confirmed' && this.isConfirmed(row)) ||
        (this.reportStatus === 'pending' && !this.isConfirmed(row));
      const matchesRisk =
        this.reportRisk === 'all' ||
        row.details.some(
          (detail) => detail.drug_interaction_type === this.reportRisk,
        );
      return matchesStatus && matchesRisk;
    });

    grouped.sort((first, second) =>
      this.isConfirmed(first) === this.isConfirmed(second)
        ? 0
        : this.isConfirmed(first)
          ? 1
          : -1,
    );
    this.dataSource = new MatTableDataSource<Prescription>(grouped);
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data, filter) => {
      const text = [
        data.prescription,
        data.hn,
        data.patientname,
        data.queue,
        data.userCheck,
      ]
        .map((value) => value || '')
        .join(' ');
      return text.toLowerCase().includes(filter);
    };
    this.dataSource.filter = this.reportSearch.trim().toLowerCase();
  }

  isConfirmed(row: Prescription): boolean {
    return String(row.statusCheck) === '0';
  }

  getReportCount(status: 'pending' | 'confirmed' | 'all'): number {
    const rows = this.removeHiddenRiskTypes(
      this.groupByPrescription(this.getSiteFilteredResults()),
    );
    if (status === 'all') return rows.length;
    return rows.filter((row) =>
      status === 'confirmed' ? this.isConfirmed(row) : !this.isConfirmed(row),
    ).length;
  }

  private getSiteFilteredResults(): any[] {
    if (this.reportSelectedSite === 'W8') {
      return this._rawResult.filter(
        (item: any) =>
          !item.departmentcode ||
          item.departmentcode === null ||
          item.departmentcode === '' ||
          item.departmentcode === 'W8',
      );
    }
    return this._rawResult.filter(
      (item: any) => item.departmentcode === this.reportSelectedSite,
    );
  }

  setReportStatus(status: 'pending' | 'confirmed' | 'all') {
    this.reportStatus = status;
    this.applyReportFilters();
  }

  onReportRiskChange() {
    this.applyReportFilters();
  }

  onReportSearch(event: Event) {
    this.reportSearch = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.reportSearch.trim().toLowerCase();
  }

  copyPatient(hn: string, row: any) {
    console.log('Copying HN:', hn, 'Row:', row);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hn);
    }
  }

  getRiskLabel(type: string): string {
    return type === 'Appropriatedosage' ? 'QUANTITY' : type;
  }

  /**
   * ผู้ที่ยืนยันความเสี่ยงแต่ละประเภท
   * รองรับทั้งฟิลด์ userCheck และ userConfirm (แล้วแต่โครงสร้างที่ API ส่งกลับมา)
   */
  getConfirmUser(detail: DrugInteraction): string {

    return detail?.userConfirm || '';
  }

  getRiskIcon(type: string): string {
    const icons: { [key: string]: string } = {
      Allergy: 'block',
      Duplicate: 'medication',
      Lab: 'science',
      Dosage: 'vaccines',
      Interdrugaction: 'sync_problem',
      Appropriatedosage: 'format_list_numbered',
      Drugdisease: 'healing',
    };
    return icons[type] || 'warning';
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

  /**
   * คลิกที่ risk-badge ในแท็บ Report -> โหลดข้อมูลผู้ป่วย (goTab2)
   * แล้วเด้ง modal ของการ์ดที่ตรงกับประเภทความเสี่ยงนั้นทันที
   * เมื่อปิด/ยืนยัน modal จะสลับกลับมาที่แท็บ Report อัตโนมัติ
   */
  async openRiskDetail(row: any, type: string) {
    await this.goTab2(row);
    // รอให้ Angular สร้างการ์ด (ผ่าน *ngIf="patient.todayDrugsHN") หลัง scan เสร็จ
    setTimeout(() => {
      const card: any = this.getRiskCard(type);

      if (!card) {
        this.tabIndex = 1;
        return;
      }
      const modal = $('#' + card.modalId);
      // กลับไปแท็บ Report เมื่องานเสร็จ (Close / Confirm) แล้วโหลดสถานะใหม่
      modal.one('hidden.bs.modal', () => {
        this.tabIndex = 1;
        this.getDuplicate();
      });
      card.openModal();
      // กันเหนียว: ถ้า modal ไม่เปิด (ไม่พบข้อมูล) ให้กลับแท็บ Report
      setTimeout(async () => {
        if (!$('body').hasClass('modal-open')) {

          // modal ไม่เปิด (ไม่พบข้อมูล) → ซ่อนเฉพาะ warning badge ที่คลิก

          let formData = new FormData();
          formData.append('prescription', row.prescription);
          formData.append('type', type);
          let getData: any = await this.http.post('getDuplicate3', formData);

          if (getData.connect) {
            if (getData.response.isQuery) {
              this.hiddenRiskTypes.add(`${row.prescription}|${type}`);
              this.applyReportFilters();
              this.tabIndex = 1;
            } else {
              this._rawResult = [];
              this.dataSource = new MatTableDataSource<Prescription>([]);
              this.dataSource.paginator = this.paginator;
            }
          } else {
            Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
          }

        }
      }, 600);
    });
  }

  /** หา component การ์ดตามประเภทความเสี่ยง */
  private getRiskCard(type: string): any {
    return (
      {
        allergy: this.allergyCard,
        Duplicate: this.duplicateCard,
        Lab: this.labCard,
        Dosage: this.dosageCard,
        Interdrugaction: this.interCard,
        Appropriatedosage: this.appropCard,
        Drugdisease: this.drugDiseaseCard,
      } as { [key: string]: any }
    )[type];
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.reportSearch = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  getInteractionClass(type: string): string {
    return 'type-' + String(type || '').toLowerCase();
  }

  getStatusClass(status: string): string {
    return String(status) === '0' ? 'status-confirmed' : 'status-pending';
  }

  onReportSiteChange() {
    this.applyReportFilters();
  }
  changeName(name: string): string {
    return name === 'Appropriatedosage' ? 'QUANTITY' : name;
  }
}
