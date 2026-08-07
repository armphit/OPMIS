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
  constructor() {}

  ngOnInit(): void {
    this.data =
      this.patient?.finalResult?.appropriatedosage?.valueAppropriateDosage ||
      [];
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
    // Construct drugItem in the format expected by modal-mederror
    this.selectedDrugItem = {
      patient: {
        invName: item.invName,
        invCode: item.invCode,
        reqNo: item.reqNo || '',
        Weight: item.Weight || '',
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
