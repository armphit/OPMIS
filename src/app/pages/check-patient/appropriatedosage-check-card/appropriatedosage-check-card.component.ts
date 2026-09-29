import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';

declare const $: any;
@Component({
  selector: 'app-appropriatedosage-check-card',
  templateUrl: './appropriatedosage-check-card.component.html',
  styleUrls: [
    '../check-patient.component.scss',
    './appropriatedosage-check-card.component.scss',
  ],
})
export class AppropriatedosageCheckCardComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;

  data: any[] = [];
  selectedDrugItem: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  modalId = 'AppropriateDosageModal';
  constructor() { }

  ngOnInit(): void {
    this.buildData();
  }

  buildData() {
    const list: any[] =
      this.patient?.finalResult?.appropriatedosage?.valueAppropriateDosage || [];
    const drugs: any[] = this.patient?.todayDrugsHN || [];

    this.data = (list || []).map((item: any) => {
      const drug = drugs.find((d: any) => d.invCode === item.invCode) || {};
      const qtyReq = Number(item.qtyReq ?? drug.qtyReq ?? 0);
      const perDay = this.getPerDay(drug);
      const daysNeed = Number(drug.DayApp != null ? drug.DayApp : 0);
      const daysAvailable = perDay > 0 ? Math.floor(qtyReq / perDay) : 0;
      const shouldReceiveQty = perDay * daysNeed;
      const diffDays = daysAvailable - daysNeed;
      const st = this.getStatusInfo({ diffDays: diffDays });

      return {
        ...item,
        ...drug,
        qtyReq,
        perDay,
        daysNeed,
        daysAvailable,
        shouldReceiveQty,
        diffDays,
        statusCls: st.cls,
        statusText: st.text,
        ruleTypeLabel: this.getRuleTypeLabel(item.ruleType),
      };
    });
  }

  getPerDay(drug: any): number {
    const lamedQty = drug.lamedQty != null ? Number(drug.lamedQty) : 1;
    const timePerDay = drug.time_docperday != null ? Number(drug.time_docperday) : 1;
    const perDay = lamedQty * timePerDay;
    return perDay > 0 ? perDay : 1;
  }

  openModal() {
    if (this.data.length) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  openMedErrorModal(item: any) {
    const drugs: any[] = this.patient?.todayDrugsHN || [];
    const drug = drugs.find((d: any) => d.invCode === item.invCode) || {};
    // Construct drugItem in the format expected by modal-mederror
    this.selectedDrugItem = {
      patient: {
        invName: item.invName,
        invCode: item.invCode,
        reqNo: item.reqNo || drug.remark || '',
        Weight: item.Weight || drug.Weight || '',
        checkType:
          this.patient?.finalResult?.appropriatedosage?.result.statusInsert,
      },
    };
    setTimeout(() => {
      this.medErrorModal.openModal();
    });
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
  }

  get statusText(): string {
    return this.data.length ? 'WARNING' : 'PASS (ไม่มีข้อมูล)';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.appropriatedosage?.result;
    return {
      'bg-success text-white': !a.drug_interaction_status,
      'bg-danger text-white': a.drug_interaction_status,
    };
  }

  get patientInfo(): any {

    return this.patient?.todayDrugsHN?.[0] || {};
  }

  get problemCount(): number {
    return this.data.length;
  }

  get clinicName(): string {
    return (
      this.patient?.clinicName ||
      this.patient?.departmentName ||
      this.patientInfo?.clinicName ||
      ''
    ).trim();
  }

  get apptDaysText(): string {
    const days = this.data.length ? this.data[0]?.daysNeed : this.patientInfo?.DayApp;
    return days != null && days !== '' ? String(days) : '';
  }

  getStatusInfo(item: any) {
    if (!item || item.diffDays == null) {
      return { text: '', cls: '' };
    }
    if (item.diffDays > 0) {
      return { text: `เกิน ${item.diffDays} วัน`, cls: 'status-over' };
    }
    if (item.diffDays < 0) {
      return { text: `ขาด ${Math.abs(item.diffDays)} วัน`, cls: 'status-short' };
    }
    return { text: 'พอดี', cls: 'status-ok' };
  }

  getRuleTypeLabel(ruleType: string): string {
    const labels: Record<string, string> = {
      RULE1_TABLET_DAY: 'คำนวณตามจำนวนเม็ด/วัน',
      RULE2_SPECIAL: 'ยาพิเศษเฉพาะ',
      RULE3_LIMIT_COURSE: 'จำกัดจำนวนสะสม',
      RULE4_INSULIN: 'อินซูลิน',
      RULE5_FIXED_INTERVAL: 'ระยะห่างคงที่',
      NORMAL: 'ปกติ',
    };
    return labels[ruleType] || ruleType;
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}
