import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-laboratory-test',
  templateUrl: './laboratory-test.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class LaboratoryTestComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}
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

  get allergyStatus(): string {
    const a = this.patient?.finalResult?.lab?.result;

    const b = this.patient?.finalResult?.lab?.valueLab;
    return b.length
      ? !a?.statusCheck
        ? 'PASS'
        : 'FAIL'
      : 'PASS (ไม่มีค่าผลแลป)';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.lab?.result;

    return {
      'bg-success text-white': !a?.statusCheck,
      'bg-danger text-white': a?.statusCheck,
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
