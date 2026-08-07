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

  data: any[] = [];
  selectedDrugItem: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');
  modalId = 'interdrugactionModal';

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    const raw =
      this.patient?.finalResult?.druginteraction?.valueDrugInteraction;
    this.data = Array.isArray(raw) ? raw : raw ? [raw] : [];
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

    this.selectedDrugItem = {
      patient: {
        invName: item.todayDrug?.invName || item.interactingDrug?.invName,
        invCode: item.todayDrug?.invCode || item.interactingDrug?.invCode,
        reqNo: item.todayDrug?.reqNo || '',
        Weight: '',
        checkType:
          this.patient?.finalResult?.druginteraction?.result.statusInsert,
      },
    };
    setTimeout(() => {
      this.medErrorModal.openModal();
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
}
