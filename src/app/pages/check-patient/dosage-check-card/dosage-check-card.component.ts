import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare const $: any;
@Component({
  selector: 'app-dosage-check-card',
  templateUrl: './dosage-check-card.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class DosageCheckCardComponent implements OnInit {

  // constructor() { }

  // ngOnInit(): void {
  // }
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  constructor() {


  }

  ngOnInit(): void { }
  modalId = 'dosageModal';

  openModal() {

    const a = this.patient?.finalResult?.dosage?.valueDosage.length;

    if (a) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
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
}
