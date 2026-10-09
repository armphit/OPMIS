import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';
import { ModalInterventionComponent } from '../modal-intervention/modal-intervention.component';

declare const $: any;
@Component({
  selector: 'app-dosage-check-card',
  templateUrl: './dosage-check-card.component.html',
  styleUrls: ['../check-patient.component.scss', './dosage-check-card.component.scss'],
})
export class DosageCheckCardComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;
  @ViewChild('interventionModal') interventionModal!: ModalInterventionComponent;

  selectedDrugItem: any = null;
  selectedInterventionItem: any = null;

  constructor() { }

  ngOnInit(): void { }
  modalId = 'dosageModal';

  get patientInfo(): any {
    return this.patient?.todayDrugsHN?.[0] || {};
  }

  get problemCount(): number {
    return this.patient?.finalResult?.dosage?.valueDosage?.length || 0;
  }

  get doctorName(): string {

    return this.patient?.todayDrugsHN?.[0]?.docName || this.patientInfo.doctorName || this.patientInfo.doctor || '-';
  }

  get clinicName(): string {
    return this.patient?.todayDrugsHN?.[0]?.clinicName || this.patient?.clinicName || this.patient?.departmentName || this.patientInfo.clinicName || '-';
  }

  get servicePoint(): string {
    return this.patient?.todayDrugsHN?.[0]?.toSite || this.patient?.toSite || this.patient?.site || this.patientInfo.toSite || this.patientInfo.site || '-';
  }

  dailyDose(item: any): number {
    const weight = Number(item?.patient?.Weight || this.patientInfo.Weight || 0);
    return Number(item?.calculatedResult || 0) * weight;
  }

  statusInfo(item: any): { label: string; deltaLabel: string; icon: string; className: string; delta: number | null } {

    const value = Number(item?.calculatedResult);
    const warningNotequalto = item.matchedDrugRule.warningNotequalto
    const min = Number(item?.matchedDrugRule?.warningMin);
    const max = Number(item?.matchedDrugRule?.warningMax);
    if (warningNotequalto) {
      if (value < warningNotequalto) return { label: 'ต่ำกว่าขนาดต่ำสุด', deltaLabel: 'ขาด', icon: '●', className: 'status-low', delta: warningNotequalto };
      if (value > warningNotequalto) return { label: 'เกินขนาดยาสูงสุด', deltaLabel: 'เกิน', icon: '●', className: 'status-high', delta: warningNotequalto };
      return { label: 'อยู่ในช่วงมาตรฐาน', deltaLabel: '', icon: '✓', className: 'status-ok', delta: null };
    } else {
      if (value < min) return { label: 'ต่ำกว่าขนาดต่ำสุด', deltaLabel: 'ขาด', icon: '●', className: 'status-low', delta: min - value };
      if (value > max) return { label: 'เกินขนาดยาสูงสุด', deltaLabel: 'เกิน', icon: '●', className: 'status-high', delta: value - max };
      return { label: 'อยู่ในช่วงมาตรฐาน', deltaLabel: '', icon: '✓', className: 'status-ok', delta: null };
    }

  }

  copyHn(): void {
    const hn = this.patientInfo.hn || this.patientInfo.HN || '';
    if (hn && navigator.clipboard) navigator.clipboard.writeText(String(hn));
  }

  openModal() {
    const a = this.patient?.finalResult?.dosage?.valueDosage.length;

    if (a) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  openMedErrorModal(item: any) {
    ((item.patient.checkType =
      this.patient?.finalResult?.dosage?.result.statusInsert),
      (this.selectedDrugItem = item));
    setTimeout(() => {
      this.medErrorModal.openModal();
    });
  }

  openInterventionModal(item: any) {
    this.selectedInterventionItem = item;
    setTimeout(() => {
      this.interventionModal?.openModal();
    });
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
  }

  get allergyStatus(): string {
    const a = this.patient?.finalResult?.dosage?.result;

    const b = this.patient?.finalResult?.dosage?.valueDosage;
    return b.length
      ? !a?.drug_interaction_status
        ? 'PASS'
        : 'FAIL'
      : 'PASS (ไม่มีค่าผลขนาดยา)';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.dosage?.result;

    return {
      'bg-success text-white': !a?.drug_interaction_status,
      'bg-danger text-white': a?.drug_interaction_status,
    };
  }

  conDate(val: string | number): string {
    if (!val) return '-';

    const s = val.toString();
    if (s.length !== 8) return '-';

    const year = s.substring(0, 4); // 2568
    const month = s.substring(4, 6); // 12
    const day = s.substring(6, 8); // 26

    return `${day}/${month}/${year}`;
  }
  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }

  checkDosage(val: any, max: any, min: any) {
    return val < min
      ? `ขนาดยาน้อยเกินที่กำหนด`
      : val > max
        ? `ขนาดยามากเกินที่กำหนด`
        : ``;
  }
}
