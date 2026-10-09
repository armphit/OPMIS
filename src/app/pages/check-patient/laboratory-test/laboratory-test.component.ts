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
  selector: 'app-laboratory-test',
  templateUrl: './laboratory-test.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class LaboratoryTestComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;
  @ViewChild('interventionModal') interventionModal!: ModalInterventionComponent;

  selectedDrugItem: any = null;
  selectedInterventionItem: any = null;

  constructor() { }

  ngOnInit(): void { }
  modalId = 'labModal';

  openModal() {
    const a = this.patient?.finalResult?.lab?.valueLab.length;

    if (a) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  openMedErrorModal(item: any) {
    this.selectedDrugItem = {
      ...item,
      patient: {
        invName: item.invName,
        invCode: item.invCode,
        reqNo: '',
        Weight: '',
        checkType: this.patient?.finalResult?.lab?.result.statusInsert,
      },
    };
    setTimeout(() => {
      this.medErrorModal.openModal();
    });
  }

  openInterventionModal(item: any) {
    this.selectedInterventionItem = {
      ...item,
      patient: {
        invName: item?.invName,
        invCode: item?.invCode,
        reqNo: '',
        Weight: '',
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
    const a = this.patient?.finalResult?.lab?.result;

    const b = this.patient?.finalResult?.lab?.valueLab;
    return b.length
      ? !a?.drug_interaction_status
        ? 'PASS'
        : 'FAIL'
      : 'PASS (ไม่มีค่าผลแลป)';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.lab?.result;

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
