import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';
import { ModalInterventionComponent } from '../modal-intervention/modal-intervention.component';
declare const $: any;

@Component({
  selector: 'app-interdrugaction-check-card',
  templateUrl: './interdrugaction-check-card.component.html',
  styleUrls: [
    '../check-patient.component.scss',
    './interdrugaction-check-card.component.scss',
  ],
})
export class InterdrugactionCheckCardComponent implements OnInit {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;
  @ViewChild('interventionModal') interventionModal!: ModalInterventionComponent;

  data: any[] = [];
  selectedDrugItem: any = null;
  selectedInterventionItem: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  modalId = 'interdrugactionModal';

  /** Cached enrichedItems.
   * Built once in ngOnInit and reused, so the DOM isn't rebuilt on every
   * change-detection cycle. (Previously a getter returned fresh objects each
   * time, which made ngFor recreate the cards ----- and the PE button inside
   * the ngFor got destroyed/rebuilt mid-click, so the click never fired.) */
  private _enrichedItems: any[] = [];

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    const raw =
      this.patient?.finalResult?.druginteraction?.valueDrugInteraction;
    this.data = Array.isArray(raw) ? raw : raw ? [raw] : [];
    this._enrichedItems = this.buildEnrichedItems();
  }

  /** Stable trackBy key for the *ngFor so Angular reuses the same DOM nodes
   *  (no destroy/rebuild on each change-detection cycle). */
  trackByDrug(index: number, item: any): string {
    const code =
      item?.todayDrug?.invCode || item?.interactingDrug?.invCode || '';
    return `${index}::${code}`;
  }

  get interactionList(): any[] {
    const raw =
      this.patient?.finalResult?.druginteraction?.valueDrugInteraction ??
      this.data;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  }

  openModal() {
    const a =
      this.patient?.finalResult.druginteraction.valueDrugInteraction.length;

    if (a) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $(`#${this.modalId}`).modal('hide');
  }

  openMedErrorModal(item: any) {
    // Safety: ข้อความ summary bar อาจส่ง item = undefined (อยู่นอก *ngFor)
    // หรือ item ที่ไม่มี todayDrug -> กันไม่ให้ throw error ตรงบรรทัดแรก
    // (ก่อนจะถึง console.log) ซึ่งทำให้เหมือน "ไม่ได้เข้า function"


    this.selectedDrugItem = {
      todayDrug: item?.todayDrug,
      interactingDrug: item?.interactingDrug,
      severity: item?.severity,
      interactionType: item?.interactionType,
      note: item?.note || item?.interaction?.Note,
      patient: {
        invName: item.todayDrug?.invName || item.interactingDrug?.invName,
        invCode: item.todayDrug?.invCode || item.interactingDrug?.invCode,
        reqNo: item.todayDrug?.reqNo || '',
        Weight: '',
        checkType:
          this.patient?.finalResult?.druginteraction?.result.statusInsert,
      },
    };

    // ใช้ setTimeout เพื่อให้ Angular อัปเดต @Input selectedDrugItem
    // ให้กับ app-modal-mederror ก่อนเรียก openModal()
    setTimeout(() => {
      this.medErrorModal?.openModal();
    });
  }

  openInterventionModal(item: any) {
    if (!item?.todayDrug && !item?.interactingDrug) return;
    // ส่งคู่ยาทั้งคู่ให้ modal-intervention แยก today/interacting ได้เอง
    this.selectedInterventionItem = {
      todayDrug: item?.todayDrug,
      interactingDrug: item?.interactingDrug,
      severity: item?.severity,
      interactionType: item?.interactionType,
      note: item?.note || item?.interaction?.Note,
      patient: {
        invName: item?.todayDrug?.invName || item?.interactingDrug?.invName,
        invCode: item?.todayDrug?.invCode || item?.interactingDrug?.invCode,
      },
    };
    setTimeout(() => {
      this.interventionModal?.openModal();
    });
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
  onConfirm2(data: any) {
    console.log(data);
  }
  get interdrugactionStatus(): string {
    const hasInteraction =
      this.patient?.finalResult?.druginteraction?.result
        ?.drug_interaction_status;

    if (!hasInteraction) {
      return 'PASS';
    }
    const count = this.interactionList.length;
    return count ? `FAIL (${count} รายการ)` : 'FAIL';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.druginteraction?.result;

    return {
      'bg-success text-white': !a.drug_interaction_status,
      'bg-danger text-white': a.drug_interaction_status,
    };
  }

  formatMedHow(medHow: string): string {
    const trimmed = medHow?.trim();
    return trimmed && trimmed !== '0' ? trimmed : '-';
  }

  formatQty(drug: any): string {
    if (!drug?.qtyReq && drug?.qtyReq !== 0) return '-';
    return `${drug.qtyReq} ${drug.unit || ''}`.trim();
  }

  formatDate(date: string): string {
    return moment(date).format('DD/MM/YYYY');
  }

  getInteractingSourceLabel(drug: any): string {

    if (drug?.source === 'today') {
      return 'ใบสั่งวันนี้';
    }
    if (drug?.lastIssTime) {
      const months = moment().diff(moment(drug.lastIssTime), 'months');
      if (months >= 1) {
        return `ประวัติรับยาเมื่อ ${months} เดือนก่อน - ยายังไม่หมด`;
      }
      const days = moment().diff(moment(drug.lastIssTime), 'days');
      if (days >= 1) {
        return `ประวัติรับยาเมื่อ ${days} วันก่อน - ยายังไม่หมด`;
      }
      return 'ประวัติรับยาวันนี้ - ยายังไม่หมด';
    }
    return 'ประวัติรับยา - ยายังไม่หมด';
  }

  getSeverityCardClass(severity: string): string {
    const key = (severity || '').toLowerCase();
    if (key === 'major') return 'severity-card--major';
    if (key === 'moderate') return 'severity-card--moderate';
    if (key === 'minor') return 'severity-card--minor';
    return 'severity-card--default';
  }

  getSeverityBadgeClass(severity: string): string {
    const key = (severity || '').toLowerCase();
    if (key === 'major') return 'severity-badge--major';
    if (key === 'moderate') return 'severity-badge--moderate';
    if (key === 'minor') return 'severity-badge--minor';
    return 'severity-badge--default';
  }

  getSeverityTextClass(severity: string): string {
    const key = (severity || '').toLowerCase();
    if (key === 'major') return 'severity-text--major';
    if (key === 'moderate') return 'severity-text--moderate';
    if (key === 'minor') return 'severity-text--minor';
    return 'severity-text--default';
  }

  /** ข้อมูลผู้ป่วยใน Header (HN, ชื่อ-สกุล, ห้องยา) */
  get patientInfo(): any {
    return this.patient?.todayDrugsHN?.[0] || {};
  }

  /** จำนวนคู่ยาที่พบปัญหา */
  get problemCount(): number {
    return this.interactionList.length;
  }

  /** จำนวนคู่ยาที่พบจากใบสั่งปัจจุบัน (interactingDrug.source === 'today') */
  get todayProblemCount(): number {
    return this.interactionList.filter(
      (item: any) => item.interactingDrug?.source === 'today',
    ).length;
  }

  /** จำนวนคู่ยาที่พบจากประวัติย้อนหลัง (interactingDrug.source === 'history') */
  get historyProblemCount(): number {
    return this.interactionList.filter(
      (item: any) => item.interactingDrug?.source === 'history',
    ).length;
  }

  /** ตรวจพบการโต้ตอบจากประวัติย้อนหลังหรือไม่ */
  get detectedFromHistory(): boolean {
    return this.historyProblemCount > 0;
  }

  /**
   * รายการโต้ตอบที่ถูกเสริมข้อมูลจาก todayDrugsHN
   * (ผู้สั่ง/แพทย์, แผนก/ห้องตรวจ) พร้อมคำนวณจำนวนวันที่ยาเก่ายังเหลือ
   */
  get enrichedItems(): any[] {
    // return cached, not recompute every change-detection cycle
    return this._enrichedItems;
  }

  /** Build enrichedItems once (in ngOnInit) and cache it */
  private buildEnrichedItems(): any[] {
    const drugs: any[] = this.patient?.todayDrugsHN || [];

    return this.interactionList.map((item: any) => {
      const lookup = (code: string) =>
        drugs.find((d: any) => d.invCode === code) || {};

      const todayDrug = {
        ...item.todayDrug,
        ...lookup(item.todayDrug?.invCode),
      };
      const interactingDrug = {
        ...item.interactingDrug,
        lastIssTime: item.interactingDrug?.lastIssTime || null,
      };

      return {
        ...item,
        todayDrug,
        interactingDrug,
        todayRemainingDays: this.calcRemainingDays(todayDrug),
        interactingRemainingDays: this.calcRemainingDays(interactingDrug),
        isHistorical: this.isHistoricalDrug(interactingDrug),
      };
    });
  }

  /** จำนวนเม็ด/ครั้งต่อวัน สำหรับคำนวณจำนวนวันที่ยาหมด */
  getPerDay(drug: any): number {
    const lamedQty = drug?.lamedQty != null ? Number(drug.lamedQty) : 1;
    const timePerDay =
      drug?.time_docperday != null ? Number(drug.time_docperday) : 1;
    const perDay = lamedQty * timePerDay;
    return perDay > 0 ? perDay : 1;
  }

  /**
   * คำนวณ "ยาเก่ายังเหลืออีก X วัน"
   * = (จำนวนที่จ่าย / ใช้ต่อวัน) - จำนวนวันที่ล่วงเลยนับจากวันที่รับยาครั้งล่าสุด
   */
  calcRemainingDays(drug: any): number | null {
    if (!drug) return null;
    const qty = Number(drug.qtyReq) || 0;
    const perDay = this.getPerDay(drug);
    const daysAvailable = perDay > 0 ? Math.floor(qty / perDay) : 0;
    if (!drug.lastIssTime) {
      return Math.max(daysAvailable, 0);
    }
    const elapsed = moment()
      .startOf('day')
      .diff(moment(drug.lastIssTime).startOf('day'), 'days');
    const remaining = daysAvailable - elapsed;
    return Math.max(remaining, 0);
  }

  /** รายการยาที่มาจากประวัติย้อนหลัง (ประวัติยาเดิม) */
  isHistoricalDrug(drug: any): boolean {
    if (drug?.source === 'history') return true;
    if (drug?.lastIssTime) {
      const months = moment().diff(moment(drug.lastIssTime), 'months');
      if (months >= 3) return true;
    }
    return false;
  }

  /** ข้อความจำนวนวันที่ยาคงเหลือ เช่น "เหลืออีก 30 วัน" */
  remainingDaysText(days: number | null): string {
    if (days == null) return '';
    if (days <= 0) return 'ยาคงเหลือหมดแล้ว';
    return `เหลืออีก ${days} วัน`;
  }
}
