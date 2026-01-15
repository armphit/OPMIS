import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-duplicate-check-card',
  templateUrl: './duplicate-check-card.component.html',
  styleUrls: ['../check-patient.component.scss'],
})
export class DuplicateCheckCardComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  data: any = {};
  conditionMeta: any = {};
  constructor() {
    // this.data = {
    //   condition1: [
    //     {
    //       currentDrug: 'DEX-E',
    //       groupName: 'steroid eye drop',
    //       foundToday: [{ invCode: 'DEX-O', invName: 'DEX-OPH EYE DROP 5 ML.' }],
    //     },
    //     {
    //       currentDrug: 'DEX-O',
    //       groupName: 'steroid eye drop',
    //       foundToday: [{ invCode: 'DEX-E', invName: 'DEX-OPH EAR DROP 5 ML.' }],
    //     },
    //   ],
    //   condition2: [
    //     {
    //       currentDrug: 'LEVOF3',
    //       groupName: 'fluoroquinolone',
    //       foundHistory: [
    //         {
    //           duplicateDrugCode: 'LEVOF1',
    //           duplicateDrug: '(ยา รพ.) LEVOFLOXACIN 500 MG/TAB',
    //           lastDate: '2026-01-05 15:02:18',
    //           daysDiff: 4,
    //         },
    //       ],
    //     },
    //   ],
    //   condition3: [
    //     {
    //       currentDrug: 'TENO6',
    //       groupName: 'tenofovir based',
    //       foundHistory: [
    //         {
    //           duplicateDrugCode: 'TDF+1',
    //           duplicateDrug: 'ยา รพ.Teevir (TDF 300+EFV 600+FTC 200 )',
    //           lastDate: '2025-11-19 15:02:18',
    //           daysDiff: 51,
    //         },
    //       ],
    //     },
    //   ],
    // };

    this.conditionMeta = {
      condition1: {
        title: 'ยาวันนี้อยู่กลุ่มเดียวกัน',
        icon: 'warning',
        color: 'warn',
        columns: ['currentDrug', 'groupName', 'duplicate'],
      },
      condition2: {
        title: 'ยาย้อนหลัง 10 วัน อยู่กลุ่มเดียวกัน',
        icon: 'history',
        color: 'accent',
        columns: [
          'currentDrug',
          'groupName',
          'duplicate',
          'lastDate',
          'daysDiff',
        ],
      },
      condition3: {
        title: 'ยาย้อนหลัง 120 วัน อยู่กลุ่มเดียวกัน',
        icon: 'event',
        color: 'primary',
        columns: [
          'currentDrug',
          'groupName',
          'duplicate',
          'lastDate',
          'daysDiff',
        ],
      },
    };
  }

  ngOnInit(): void {
    this.data = this.patient?.finalResult?.duplicatemed;
  }

  modalId = 'duplicateModal';
  openModal() {
    const a = this.patient?.finalResult?.duplicatemed?.result;

    if (Object.keys(a).length !== 0) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  get allergyStatus(): string {
    const a = this.patient?.finalResult?.duplicatemed?.result;

    return !a.statusCheck
      ? Object.keys(a).length
        ? 'PASS'
        : 'PASS (ไม่มียาซ้ำซ้อน)'
      : 'FAIL';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.duplicatemed?.result;
    return {
      'bg-success text-white': !a.statusCheck,
      'bg-danger text-white': a.statusCheck,
    };
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}
