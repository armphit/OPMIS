import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';
import { ModalInterventionComponent } from '../modal-intervention/modal-intervention.component';

declare const $: any;

@Component({
  selector: 'app-allergy-check-card',
  templateUrl: './allergy-check-card.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class AllergyCheckCardComponent {
  @Input() patient: any;

  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;
  @ViewChild('interventionModal') interventionModal!: ModalInterventionComponent;

  modalId = 'allergyModal';
  selectedDrugItem: any = null;
  selectedInterventionItem: any = null;

  openModal() {
    const a = this.patient?.finalResult?.allergymed?.[0];

    if (a?.cid) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  openMedErrorModal(drug: any) {
    console.log();
    this.selectedDrugItem = {
      patient: {
        ...drug?.drug,
        checkType: this.patient?.finalResult?.allergyresult[0]?.statusInsert,
      },
    };

    setTimeout(() => {
      this.medErrorModal.openModal();
    });
  }

  openInterventionModal(drug: any) {
    this.selectedInterventionItem = {
      patient: {
        ...drug?.drug,
      },
    };
    setTimeout(() => {
      this.interventionModal?.openModal();
    });
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
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
