import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import moment from 'moment';
import { ModalMederrorComponent } from '../modal-mederror/modal-mederror.component';
import { ModalInterventionComponent } from '../modal-intervention/modal-intervention.component';
import Swal from 'sweetalert2';
declare const $: any;

@Component({
  selector: 'app-duplicate-check-card',
  templateUrl: './duplicate-check-card.component.html',
  styleUrls: [
    '../check-patient.component.scss',
    './duplicate-check-card.component.scss',
  ],
})
export class DuplicateCheckCardComponent implements OnInit, OnChanges {
  @Input() patient: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() medError = new EventEmitter<any>();

  data: any = {};

  /**
   * แถวตารางที่ cache ไว้ (array reference เดิมเปิดตลอด)
   * ที่ผ่านมาใช้ getter `tableRows` ซึ่งคืน array ใหม่ทุกครั้งที่ Angular
   * ตรวจ change detection -> mat-table rerender/re-create แถวกลางการคลิก
   * ทำให้ event (click) บนปุ่มถูกทิ้ง (กดแล้วไม่ทำงาน / ไม่ log)
   */
  rows: any[] = [];
  @ViewChild('medErrorModal') medErrorModal!: ModalMederrorComponent;
  @ViewChild('interventionModal') interventionModal!: ModalInterventionComponent;
  selectedDrugItem: any = null;
  selectedInterventionItem: any = null;
  modalId = 'duplicateModal';

  /** คอลัมน์ตาราง 5 คอลัมน์ ตามข้อกำหนด UI */
  displayedColumns = ['seq', 'group', 'drug1', 'drug2', 'action'];

  /** ลำดับความสำคัญ (Priority) ของแต่ละเงื่อนไข */
  private readonly conditionConfigs = [
    // Priority 1: สั่งซ้ำวันเดียวกัน -> Badge เขียว "สั่งวันนี้"
    { key: 'condition1', priority: 1, badge: 'badge-green', history: false },
    // Priority 2: ซ้ำกับประวัติ 10 วัน -> Badge เหลือง "ยาเดิมเหลือ X วัน"
    { key: 'condition2', priority: 2, badge: 'badge-yellow', history: true },
    // Priority 3: ซ้ำกับประวัติ 120 วัน -> Badge แดง "ยาเดิมเหลือ X วัน"
    { key: 'condition3', priority: 3, badge: 'badge-red', history: true },
  ];

  constructor() { }

  ngOnChanges(): void {
    this.data = this.patient?.finalResult?.duplicatemed;
    this.buildRowsInternal();
  }

  ngOnInit(): void {
    this.data = this.patient?.finalResult?.duplicatemed;
    this.buildRowsInternal();
  }

  /** ข้อมูลผู้ป่วยจากใบสั่งวันนี้ (HN, ชื่อ, จุดบริการ) */
  get patientInfo(): any {
    return this.patient?.todayDrugsHN?.[0] || {};
  }

  get todayDrugs(): any[] {
    return this.patient?.todayDrugsHN || [];
  }
  /** จำนวนคู่ยาที่พบแยกตาม Priority สำหรับ Badge ใน Header */
  get pairSummary() {
    const rows = this.rows;
    return {
      total: rows.length,
      today: rows.filter((r: any) => r.priority === 1).length,
      hist10: rows.filter((r: any) => r.priority === 2).length,
      hist120: rows.filter((r: any) => r.priority === 3).length,
    };
  }

  /**
   * Enrich ข้อมูล API ให้เป็นแถวตาราง 5 คอลัมน์
   * - currentDrug: ผูกวิธีใช้/จำนวน/แพทย์/แผนก กับยาตัวที่ 1 (ใบสั่งปัจจุบัน)
   * - pairedDrug : ใช้ข้อมูลของยาตัวที่ 2 (คู่ซ้ำ) โดยเฉพาะ ไม่ดึงยาตัวที่ 1 มาทับ
   * คืนค่าเป็นแถวชุดเดิม (เก็บใน this.rows) ไม่สร้าง array ใหม่ทุก CD cycle
   */
  private buildRowsInternal(): any[] {
    const raw = this.data || {};
    const rows: any[] = [];
    let seq = 0;

    for (const cfg of this.conditionConfigs) {
      const list: any[] = raw[cfg.key] || [];
      for (const item of list) {
        const current = this.buildCurrentDrug(item);
        const pairs: any[] = item.foundToday || item.foundHistory || [];
        for (const p of pairs) {
          seq++;
          rows.push(
            this.buildRow(seq, cfg, item.groupName, current, this.buildPairedDrug(p, cfg)),
          );
        }
      }
    }
    this.rows = rows;
    return rows;
  }

  /** สร้างข้อมูลยาตัวที่ 1 (ใบสั่งปัจจุบัน) */
  private buildCurrentDrug(item: any): any {
    const code = String(item.currentDrug || '').trim();
    // ผูกกับใบสั่งวันนี้ (todayDrugsHN) ด้วย invCode เพื่อดึงแพทย์/แผนก
    const t =
      this.todayDrugs.find((d: any) => String(d.invCode || '').trim() === code) ||
      {};
    return {
      invCode: code,
      drugName: item.currentDrugName || t.invName || '-',
      qty: item.currentQty ?? t.qtyReq,
      unit: item.currentUnit || t.unit || '',
      medHow: this.norm(item.currentMedHow) || this.norm(t.medHow) || '-',
      site: item.currentSite || t.toSite || '-',
      docName: this.norm(t.docName) || '-',
      clinicName: this.norm(t.clinicName) || t.toSite || '-',
    };
  }

  /** สร้างข้อมูลยาตัวที่ 2 (คู่ซ้ำ: วันนี้ / ประวัติเดิม) */
  private buildPairedDrug(d: any, cfg: any): any {
    const code = String(d.duplicateDrugCode || d.invCode || '').trim();
    const site = d.duplicateSite || d.toSite || '-';
    const docName = this.norm(d.docName || d.doctorName) || '-';
    const clinicName =
      this.norm(d.clinicName || d.departmentName || d.deptName) || site;
    // history: ใช้ remainingDays จาก API ตรงกับ "ยาเดิมเหลือ X วัน"
    const remainingDays =
      cfg.priority !== 1 && d.remainingDays != null
        ? Number(d.remainingDays)
        : null;
    return {
      raw: d, // เก็บข้อมูลต้นฉบับสำหรับส่ง PE
      invCode: code || d.invName || '',
      drugName: d.invName || d.duplicateDrug || '-',
      qty: d.duplicateQty ?? d.qtyReq ?? d.qty,
      unit: d.duplicateUnit || d.unit || '',
      medHow: this.norm(d.duplicateMedHow || d.medHow) || '-',
      site,
      docName,
      clinicName,
      lastDate: d.lastDate,
      daysDiff: d.daysDiff,
      remainingDays,
    };
  }

  /** ประกอบแถวข้อมูล 1 แถว สำหรับตาราง */
  private buildRow(seq: number, cfg: any, groupName: string, current: any, paired: any): any {
    const isToday = cfg.priority === 1;
    const remaining = paired?.remainingDays;
    const isLastDateToday = paired.lastDate?.slice(0, 10) ===
      new Date().toISOString().slice(0, 10);
    return {
      seq,
      groupName: this.norm(groupName) || '-',
      priority: cfg.priority,
      badgeClass: cfg.badge,
      isHistory: cfg.history,
      badgeText: isToday || isLastDateToday
        ? 'สั่งวันนี้'
        : remaining != null
          ? `ยาเดิมเหลือ ${remaining} วัน`
          : 'ยาเดิมเหลือ - วัน',
      currentDrug: current,
      pairedDrug: paired,
    };
  }

  private norm(v: any): string {
    const s = (v ?? '').toString().trim();
    return s && s !== '0' ? s : '';
  }

  openModal() {
    if (this.rows.length > 0) {
      $('#' + this.modalId).modal('show');
    }
  }

  closeModal() {
    $('#' + this.modalId).modal('hide');
  }

  get allergyStatus(): string {
    const a = this.patient?.finalResult?.duplicatemed?.result;
    if (!a) return 'PASS';
    return !a.drug_interaction_status
      ? this.rows.length
        ? 'PASS'
        : 'PASS (ไม่มียาซ้ำซ้อน)'
      : 'FAIL';
  }

  get cardClass() {
    const a = this.patient?.finalResult?.duplicatemed?.result || {};
    return {
      'bg-success text-white': !a.drug_interaction_status,
      'bg-danger text-white': !!a.drug_interaction_status,
    };
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }

  getDateTime(date: any) {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  }

  /** คัดลอก HN ไปยัง Clipboard */
  async copyHN() {
    const hn = this.patientInfo?.hn;
    if (!hn) return;
    try {
      await (navigator as any).clipboard.writeText(String(hn));
    } catch {
      const ta = document.createElement('textarea');
      ta.value = String(hn);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    Swal.fire({
      icon: 'success',
      title: 'คัดลอก HN แล้ว',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1200,
    });
  }

  /** บันทึก PE สำหรับคู่ยานั้นๆ */
  // async sendPE(d: any, currentDrug?: any) {
  //   console.log('sendPE', d, currentDrug);
  //   if (!d || !currentDrug) return;

  //   const drug = (this.patient?.todayDrugsHN || []).find(
  //     (v: any) => v.invCode === currentDrug,
  //   );
  //   const hn = drug?.hn || this.patientInfo.hn;
  //   const toSite = drug?.toSite || this.patientInfo.toSite;
  //   const lastIssTime = drug?.lastIssTime || this.patientInfo.lastIssTime;
  //   const docName = drug?.docName || this.patientInfo.docName;

  //   if (!hn) {
  //     Swal.fire('ไม่พบข้อมูลผู้ป่วย!', '', 'error');
  //     return;
  //   }

  //   let formData = new FormData();
  //   formData.append('currentDrug', currentDrug);
  //   formData.append('hn', hn);
  //   formData.append('lastIssTime', lastIssTime);

  //   let getData: any = await this.http.post('getPE', formData);
  //   if (getData.connect) {
  //     if (getData.response.rowCount) {
  //       Swal.fire({
  //         position: 'center',
  //         icon: 'error',
  //         title: 'บันทึกข้อมูลไม่สำเร็จ เนื่องจากมีข้อมูล PE อยู่แล้ว',
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //     } else {
  //       const { value: pe } = await Swal.fire({
  //         title: 'Select field validation',
  //         input: 'select',
  //         inputOptions: {
  //           pe5: 'การสั่งยาซ้ำซ้อน โดยแพทย์ต่างแผนก/ ต่าง Visit',
  //           pe6: 'การสั่งยาซ้ำซ้อน โดยแพทย์ท่านเดียวกัน',
  //         },
  //         showCancelButton: true,
  //         inputValidator: (value: any) =>
  //           new Promise((resolve) =>
  //             value ? resolve() : resolve('You need to select a field :)'),
  //           ),
  //       });

  //       if (pe) {
  //         const payload: any = {
  //           hn,
  //           toSite,
  //           lastIssTime,
  //           doc: docName,
  //           ...d,
  //           currentDrug: currentDrug,
  //           pe: pe,
  //           user: this.dataUser.user,
  //           userName: this.dataUser.name,
  //         };

  //         Object.keys(payload).forEach((key) => {
  //           const value = payload[key];
  //           if (typeof value === 'object' && value !== null) {
  //             formData.append(key, JSON.stringify(value));
  //           } else {
  //             formData.append(key, value ?? '');
  //           }
  //         });

  //         let res: any = await this.http.post('addPE', formData);
  //         if (res.connect) {
  //           if (res.response.rowCount) {
  //             Swal.fire({
  //               position: 'center',
  //               icon: 'success',
  //               title: 'บันทึกข้อมูลสำเร็จ',
  //               showConfirmButton: false,
  //               timer: 1500,
  //             });
  //           } else {
  //             Swal.fire({
  //               position: 'center',
  //               icon: 'error',
  //               title: 'บันทึกข้อมูลไม่สำเร็จ',
  //               showConfirmButton: false,
  //               timer: 1500,
  //             });
  //           }
  //         } else {
  //           Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //         }
  //       }
  //     }
  //   } else {
  //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
  //   }
  // }
  async sendPE(d: any, currentDrug?: any, row?: any) {
    if (!d || !currentDrug) {
      Swal.fire('ไม่พบข้อมูลคู่ยา!', '', 'error');
      return;
    }
    const todayDrug = (this.patient?.todayDrugsHN || []).find(
      (v: any) => v.invCode === currentDrug,
    ) || {};
    // ส่งข้อมูลให้ modal-mederror ในรูปแบบเดียวกับการ์ดอื่น (drugItem.patient)
    // โดยเก็บข้อมูลดิบของคู่นี้ไว้สำหรับสร้าง payload เดิมตอนบันทึก
    this.selectedDrugItem = {
      ...row,
      patient: {
        invName: todayDrug.invName || d.invName || d.duplicateDrug || '',
        invCode: currentDrug,
        reqNo: todayDrug.reqNo || todayDrug.remark || '',
        Weight: todayDrug.Weight || '',
        checkType: this.patient?.finalResult?.duplicatemed?.result?.statusInsert || '',
      },
      duplicate: {
        ...d,
        currentDrug: currentDrug,
        todayDrug: todayDrug,
      },
    };
    setTimeout(() => {
      this.medErrorModal?.openModal();
    });
  }

  onMedErrorSave(data: any) {
    this.medError.emit(data);
  }

  openInterventionModal(row: any) {
    if (!row?.pairedDrug) {
      Swal.fire('ไม่พบข้อมูลคู่ยา!', '', 'error');
      return;
    }
    // ส่ง row ทั้งแถวให้ modal-intervention แยกยาตัวที่ 1/2 ได้เอง
    // และกัน modal หลัก (duplicateModal) ถูกปิด/เสีย focus ด้านหลังแบบเคส dosage
    this.selectedInterventionItem = {
      ...row,
      invName: row.currentDrug?.drugName,
      invCode: row.currentDrug?.invCode,
    };
    setTimeout(() => {
      this.interventionModal?.openModal();
    });
  }

}
