import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';
declare const $: any;

@Component({
  selector: 'app-drugdisease-check-card',
  templateUrl: './drugdisease-check-card.component.html',
  styleUrls: ['../check-patient.component.scss', './drugdisease-check-card.component.scss']
})
export class DrugdiseaseCheckCardComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;

  selectedDrugItem: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  modalId = 'DrugDiseaseModal';

  constructor() { }

  ngOnInit(): void { }

  get diseaseResult(): any {
    return this.patient?.finalResult?.drugdisease?.result;
  }

  get diseaseItems(): any[] {
    const raw = this.patient?.finalResult?.drugdisease?.valueDrugDisease;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  }

  get isConfirmed(): boolean {

    return Number(this.diseaseResult?.drug_interaction_status) === 0;
  }

  get totalCount(): number {
    return this.diseaseItems.length;
  }

  get statusText(): string {
    if (!this.totalCount) return 'PASS (ไม่มีข้อมูล)';
    return this.isConfirmed ? 'ผ่าน (ยืนยันแล้ว)' : 'ตรวจพบความเสี่ยง';
  }

  get cardClass() {
    return {
      'bg-success text-white': !this.totalCount || this.isConfirmed,
      'bg-danger text-white': this.totalCount && !this.isConfirmed,
    };
  }

  get patientInfo(): any {
    const p = this.patient?.todayDrugsHN?.[0] || {};
    return {
      hn: p.hn || this.diseaseResult?.hn || '-',
      patientname: p.patientname || p.patientName || '-',
    };
  }

  /** จัดกลุ่มรายการตาม typeName เพื่อให้อ่านง่าย */
  get diseaseGroups(): any[] {
    const map = new Map<string, any[]>();
    this.diseaseItems.forEach((item: any) => {
      const key = item.typeName || 'ข้อห้ามอื่นๆ';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  }

  trackByItem(index: number): number {
    return index;
  }

  openModal() {
    if (this.totalCount) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  openMedErrorModal(item: any) {
    this.selectedDrugItem = {
      patient: {
        invName: item?.drugName || '',
        invCode: item?.drugCode || '',
        reqNo: '',
        Weight: '',
        checkType: this.diseaseResult?.statusInsert,
      },
    };
    setTimeout(() => this.medErrorModal?.openModal(), 0);
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}
