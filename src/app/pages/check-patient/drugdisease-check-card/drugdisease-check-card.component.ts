import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';
import { ModalInterventionComponent } from '../modal-intervention/modal-intervention.component';
declare const $: any;

@Component({
  selector: 'app-drugdisease-check-card',
  templateUrl: './drugdisease-check-card.component.html',
  styleUrls: ['../check-patient.component.scss', './drugdisease-check-card.component.scss']
})
export class DrugdiseaseCheckCardComponent implements OnInit, OnChanges {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;
  @ViewChild('interventionModal') interventionModal!: ModalInterventionComponent;

  selectedDrugItem: any = null;
  selectedInterventionItem: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  modalId = 'DrugDiseaseModal';

  /** Cache รายการ/กลุ่ม — ห้ามคืน array/object ใหม่จาก getter ทุก change detection
   * เพราะ *ngFor จะทำลาย/สร้าง row ใหม่ทั้งหมด (ปุ่ม PE/IVT ถูก destroy กลาง click
   * ทำให้ดูเหมือน "กดปุ่ม PE/IVT ไม่เด้ง modal") — แก้แบบเดียวกับ interdrugaction-card */
  private _diseaseItems: any[] = [];
  private _diseaseGroups: { name: string; items: any[] }[] = [];

  constructor() { }

  ngOnInit(): void {
    this.buildData();
  }

  ngOnChanges(): void {
    this.buildData();
  }

  /** รองรับ key หลายแบบจาก backend (case ต่างกัน) */
  private get diseaseNode(): any {
    const fr: any = this.patient?.finalResult || {};
    return fr.drugdisease ?? fr.Drugdisease ?? fr.drugDisease ?? fr.DrugDisease ?? fr['drug-disease'] ?? null;
  }

  get diseaseResult(): any {
    return this.diseaseNode?.result;
  }

  /** สร้าง cache รายการ + กลุ่ม ใหม่เมื่อ patient input เปลี่ยนเท่านั้น */
  private buildData(): void {
    const node: any = this.diseaseNode || {};
    const raw =
      node.valueDrugDisease ??
      node.valueDrugdisease ??
      node.valuedrugdisease ??
      node.value ??
      node.items ??
      node.list ??
      node.data ??
      null;

    let items: any[] = [];
    if (Array.isArray(raw)) {
      items = raw;
    } else if (raw) {
      items = [raw];
    } else {
      // บาง response อาจวาง array ไว้ใน result โดยตรง
      const r = node.result;
      if (Array.isArray(r)) items = r;
      else if (Array.isArray(r?.items)) items = r.items;
      else if (Array.isArray(r?.list)) items = r.list;
    }
    this._diseaseItems = items;

    const map = new Map<string, any[]>();
    items.forEach((item: any) => {
      const key = item?.typeName || item?.diseaseName || 'ข้อห้ามอื่นๆ';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    this._diseaseGroups = Array.from(map.entries()).map(([name, groupItems]) => ({ name, items: groupItems }));
  }

  get diseaseItems(): any[] {
    return this._diseaseItems;
  }

  get isConfirmed(): boolean {

    return Number(this.diseaseResult?.drug_interaction_status) === 0;
  }

  get totalCount(): number {
    return this._diseaseItems.length;
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

  /** จัดกลุ่มรายการตาม typeName เพื่อให้อ่านง่าย (คืน cache ไม่สร้างใหม่ทุก CD) */
  get diseaseGroups(): { name: string; items: any[] }[] {
    return this._diseaseGroups;
  }

  trackByItem(index: number): number {
    return index;
  }

  trackByGroup(_index: number, group: any): string {
    return group?.name || '';
  }

  openModal() {
    if (!this.totalCount) {
      console.warn('[DrugDisease] no items, skip open. finalResult keys=', Object.keys(this.patient?.finalResult || {}));
      return;
    }
    const el: any = $('#' + this.modalId);
    if (!el || !el.length) {
      console.error('[DrugDisease] modal element not found: #' + this.modalId);
      return;
    }
    el.modal('show');
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  /** กันเหนียว: ถ้า child.openModal() ไม่ทำงาน (เช่น ViewChild ยังไม่พร้อม)
   * ให้ยิง show ผ่าน id ของ modal ลูกตัวนั้นตรง ๆ
   * หมายเหตุ: ต้องเช็ค .hasClass('show') ของ id นั้น ๆ เท่านั้น — ห้ามนับ '.modal.show'
   * ทั้งหน้า เพราะ modal ตัวหลังของ card เปิดอยู่แล้ว ทำให้ fallback ไม่มีวันทำงาน */
  private ensureChildModalShown(childModalId?: string) {
    if (!childModalId) return;
    setTimeout(() => {
      try {
        const el = $('#' + childModalId);
        if (el.length && !el.hasClass('show')) {
          console.warn(`[DrugDisease] fallback: force show #${childModalId}`);
          el.modal('show');
        }
      } catch (e) {
        console.error('[DrugDisease] fallback force show failed', e);
      }
    }, 250);
  }

  openMedErrorModal(item: any) {
    const today = this.patient?.todayDrugsHN?.[0] || {};
    this.selectedDrugItem = {
      ...item,
      patient: {
        invName: item?.drugName || item?.invName || '',
        invCode: item?.drugCode || item?.invCode || '',
        reqNo: today.reqNo || today.remark || this.diseaseResult?.prescription || '',
        Weight: today.Weight || '',
        checkType: this.diseaseResult?.statusInsert || '',
      },
    };
    // ใช้ setTimeout เพื่อให้ Angular อัปเดต @Input drugItem
    // ให้กับ app-modal-mederror ก่อนเรียก openModal() (ตรงกับ card อื่นที่ใช้งานได้)
    setTimeout(() => {
      this.medErrorModal?.openModal();
      this.ensureChildModalShown(this.medErrorModal?.modalId);
    });
  }

  openInterventionModal(item: any) {
    this.selectedInterventionItem = {
      ...item,
      invName: item?.drugName || '',
      invCode: item?.drugCode || '',
      patient: {
        invName: item?.drugName || '',
        invCode: item?.drugCode || '',
      },
    };
    setTimeout(() => {
      this.interventionModal?.openModal();
      this.ensureChildModalShown(this.interventionModal?.modalId);
    });
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}
