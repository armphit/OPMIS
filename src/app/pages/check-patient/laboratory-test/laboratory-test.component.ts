import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-laboratory-test',
  templateUrl: './laboratory-test.component.html',
  styleUrls: ['./laboratory-test.component.scss'],
})
export class LaboratoryTestComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}
  modalId = 'labModal';

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
    // const a = this.patient?.finalResult?.allergymed?.[0];
    // if (!a?.cid) return 'PASS (ไม่มีแพ้ยา)';
    // return a.timestamp ? 'PASS' : 'FAIL';
    return true ? 'PASS' : 'FAIL';
  }

  get cardClass() {
    // const a = this.patient?.finalResult?.allergymed?.[0];
    // return {
    //   'bg-success text-white': !a?.cid || (a?.cid && a?.timestamp),
    //   'bg-danger text-white': a?.cid && !a?.timestamp,
    // };
    return {
      'bg-success text-white': true,
      'bg-danger text-white': false,
    };
  }
  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}
