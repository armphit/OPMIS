import { Component, Input, Output, EventEmitter } from '@angular/core';

declare const $: any;

@Component({
  selector: 'app-allergy-check-card',
  templateUrl: './allergy-check-card.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class AllergyCheckCardComponent {
  @Input() patient: any;

  @Output() confirm = new EventEmitter<void>();

  modalId = 'allergyModal';

  openModal() {
    const a = this.patient?.finalResult?.allergymed?.[0];
    if (a?.cid) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  get allergyStatus(): string {
    const a = this.patient?.finalResult?.allergymed?.[0];
    if (!a?.cid) return 'PASS (ไม่มีแพ้ยา)';
    return a.timestamp ? 'PASS' : 'FAIL';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.allergymed?.[0];
    return {
      'bg-success text-white': !a?.cid || (a?.cid && a?.timestamp),
      'bg-danger text-white': a?.cid && !a?.timestamp,
    };
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}
