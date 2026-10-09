import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import {
  createInterventionPayload,
  interventionToFormData,
} from 'src/app/pages/check-patient/shared/intervention-payload';
import Swal from 'sweetalert2';

declare const $: any;

export type InterventionGroupKey = 'doctor' | 'pharmacist' | 'patient';

export interface InterventionOption {
  value: string;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-modal-intervention',
  templateUrl: './modal-intervention.component.html',
  styleUrls: ['./modal-intervention.component.scss'],
})
export class ModalInterventionComponent implements OnInit {
  @Input() patient: any;
  @Input() drugItem: any;
  @Input() source: string = '';

  @ViewChild('quickRemarkBox') quickRemarkBox!: ElementRef<HTMLTextAreaElement>;

  modalId = 'interventionModal_' + Math.random().toString(36).substring(2, 8);

  // ===== กลุ่มผู้รับการแทรกแซง (3 กลุ่ม) =====
  activeGroup: InterventionGroupKey = 'doctor';
  groups = [
    { key: 'doctor', label: 'ดำเนินการกับ แพทย์', short: 'แพทย์', icon: '🩺', desc: 'ประสานปรับแผนการสั่งยา' },
    { key: 'pharmacist', label: 'ดำเนินการกับ เภสัชกร', short: 'เภสัชกร', icon: '💊', desc: 'กำชับจุดจ่ายยา' },
    { key: 'patient', label: 'ดำเนินการกับ ผู้ป่วย / ญาติ', short: 'ผู้ป่วย / ญาติ', icon: '🧑‍🤝‍🧑', desc: 'Counseling & Education' },
  ] as { key: InterventionGroupKey; label: string; short: string; icon: string; desc: string }[];

  // ===== Part 1: ประเด็นที่เตือน =====
  issueTopic = '';
  issueDetail = '';

  // ===== Part 2: การจัดการ =====
  management = '';

  // ===== Part 3: ผลการตอบรับ =====
  outcome = '';
  confirmReason = '';
  isNonPE = true;
  recorder = '';
  quickRemark = '';

  // tag ด่วนสำหรับ Quick Remarks — คลิกแล้วเติมลง textarea
  quickRemarkTags: string[] = ['นัด F/U', 'แยกมื้อ 2 ชม.', 'แผ่นพับ'];

  // display values
  trigger = '';
  targetDrugs: string[] = [];

  private readonly defaultTopicBySource: Record<string, string> = {
    Dosage: 'ขนาดยาไม่เหมาะสม (Inappropriate Dose)',
    AppropriateDosage: 'ความเหมาะสมของขนาดยา (Appropriateness)',
    Duplicate: 'ยาซ้ำซ้อน (Duplicate Therapy)',
    DrugInteraction: 'อันตรกิริยาระหว่างยา (Drug-Drug Interaction)',
    DrugDisease: 'ข้อห้ามใช้ในผู้ป่วยรายนี้ (Contraindication)',
    Allergy: 'ประวัติแพ้ยา (Drug Allergy)',
    Lab: 'ค่าแล็บผิดปกติที่กระทบต่อยา (Lab-related)',
  };

  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

  doctorManagements: InterventionOption[] = [
    { value: 'DDI', label: 'DDI (เฝ้าระวังอันตรกิริยาระหว่างยา)', desc: 'คู่ยาที่จำเป็นต้องใช้ร่วมกัน ปรึกษาแนวทางนัดติดตามอาการ (F/U)' },
    { value: 'LAB_ORGAN', label: 'Lab/Organ (ปรับขนาดยาตามค่าแล็บ)', desc: 'ปรึกษาแนวโน้มการทำงานของอวัยวะ เช่น ค่าไต (CrCl), ค่าตับ (AST/ALT), หรือเกลือแร่ (K+)' },
    { value: 'TIMING', label: 'Timing (ปรับเวลาหรือความถี่บริหารยา)', desc: 'ปรึกษาการกระจายมื้อยา หรือการปรับรอบเวลาเพื่อลดผลข้างเคียง' },
    { value: 'MONITORING', label: 'Monitoring (วางแผนส่งตรวจทางห้องปฏิบัติการ)', desc: 'แนะนำตรวจติดตามระดับยาในเลือด (TDM) หรือส่งตรวจเลือดเฉพาะทาง' },
    { value: 'MEDREC', label: 'Med Rec (ปรึกษาเรื่องยาเดิม)', desc: 'แจ้งประวัติการใช้ยาเดิมที่มีอยู่ เพื่อป้องกันการใช้ยาซ้ำซ้อนกับยาที่ผู้ป่วยยังเหลืออยู่' },
  ];

  pharmacistManagements: InterventionOption[] = [
    { value: 'DOUBLE_CHECK_HAD', label: 'Double Check HAD', desc: 'กำชับให้จุดจ่ายยาทำ Double check ซ้ำสำหรับยากลุ่มเสี่ยงสูง (เช่น Warfarin, Insulin, Methotrexate)' },
    { value: 'LASA', label: 'LASA Precaution', desc: 'แจ้งเตือนระวังยาหน้าตาคล้าย / ชื่อพ้องเสียง / ยาตัวเดียวกันแต่ต่างความแรง' },
    { value: 'COUNSELING_FLAG', label: 'Counseling Flag', desc: 'ส่งต่อ Flag แจ้งจุดจ่ายยา ให้เรียกผู้ป่วยเข้าห้องให้คำปรึกษาเฉพาะ (Counseling Room)' },
    { value: 'DEVICE_TECHNIQUE', label: 'Device Technique Precaution', desc: 'กำชับจุดจ่ายให้ทดสอบเทคนิคการใช้ยาพ่นสูดหรือปากกาฉีดของผู้ป่วยซ้ำก่อนส่งมอบ' },
    { value: 'STORAGE_PACKAGE', label: 'Storage & Package', desc: 'กำชับข้อกำหนดการเก็บรักษาพิเศษ เช่น แช่ตู้เย็น 2–8°C, ห่อซองกันแสง, ตัดแบ่งเม็ด' },
    { value: 'DRUG_RETURN', label: 'Drug Return Check', desc: 'แจ้งให้จุดจ่ายนับยาเดิมที่คนไข้นำมาคืน' },
  ];

  patientManagements: InterventionOption[] = [
    { value: 'ADMIN_TIMING', label: 'Administration Timing', desc: 'แนะนำการแยกมื้อรับประทานยา (เช่น ยาลดกรด/นม/ธาตุเหล็ก ห่างจากยาอย่างน้อย 2 ชั่วโมง)' },
    { value: 'SPECIAL_TECHNIQUE', label: 'Special Technique Device', desc: 'สาธิตและสอนวิธีใช้อุปกรณ์พิเศษ (ยาพ่นสูด MDI/DPI, ปากกาฉีด Insulin)' },
    { value: 'ADR_RED_FLAGS', label: 'ADR & Red Flags Warning', desc: 'อธิบายอาการผิดปกติสำคัญที่ต้องเฝ้าระวัง (เช่น ปวดเมื่อยกล้ามเนื้อ/ปัสสาวะสีโค้กจาก Statin, ภาวะเลือดออกผิดปกติ)' },
    { value: 'ADHERENCE', label: 'Adherence Support', desc: 'แก้ไขปัญหาผู้ป่วยลืมกินยา หรือจัดทำตารางเวลาการใช้ยาเฉพาะบุคคล' },
    { value: 'DIET_HERBAL', label: 'Dietary & Herbal Precaution', desc: 'ให้คำแนะนำหลีกเลี่ยงอาหารหรือสมุนไพรที่ตีกับยา (เช่น สมุนไพรฟ้าทะลายโจร, แอลกอฮอล์)' },
    { value: 'STORAGE_EDU', label: 'Storage Education', desc: 'แนะนำการเก็บรักษายาที่ถูกต้องที่บ้าน (ห้ามแช่ช่องฟรีซ, ปิดฝาให้สนิท, หลีกเลี่ยงความชื้น)' },
  ];
  doctorOutcomes: InterventionOption[] = [
    { value: 'accepted', label: 'แพทย์ปรับแผนตามคำแนะนำ (Accepted)', desc: 'แพทย์ปฏิบัติตามคำแนะนำของเภสัชกร' },
    { value: 'confirmed', label: 'แพทย์ยืนยันใช้เดิม (Confirmed)', desc: 'แพทย์ยืนยันใช้ยาตามคำสั่งเดิม + บันทึกเหตุผลทางคลินิก' },
  ];

  doctorConfirmReasons: string[] = [
    'แพทย์ทราบความเสี่ยงแล้ว นัดติดตามอาการ (F/U) ใกล้ชิด',
    'ผู้ป่วยเคยใช้ยานี้ร่วมกันได้ ปลอดภัย ไม่มีผลข้างเคียง',
    'มีข้อบ่งชี้จำเป็นเร่งด่วนในระยะสั้น (Short-course therapy)',
    'ผู้ป่วยแพ้หรือดื้อยาทางเลือกอื่น จำเป็นต้องใช้ยานี้',
    'ขนาดยาเหมาะสมกับโรคเฉพาะรายของผู้ป่วยแล้ว',
  ];

  pharmacistOutcomes: InterventionOption[] = [
    { value: 'notified', label: 'แจ้งจุดเภสัชกรตำแหน่งที่เกี่ยวข้องเรียบร้อย', desc: 'ประสาน/กำชับจุดจ่ายยาเรียบร้อยแล้ว' },
    { value: 'on_label', label: 'ข้อความถูกส่งไปลงในใบสั่งยาหรือหน้าจอ', desc: 'มีข้อความเตือนแสดงบนใบสั่งยา/หน้าจอจ่ายยา' },
  ];

  patientOutcomes: InterventionOption[] = [
    { value: 'full_understand', label: 'เข้าใจดี ตอบ/สาธิตย้อนกลับได้', desc: 'เข้าใจสมบูรณ์ สาธิตวิธีใช้ยา/ตอบทวนกลับได้ถูกต้อง 100%' },
    { value: 'partial_leaflet', label: 'เข้าใจบางส่วน แจกเอกสารเพิ่ม', desc: 'เข้าใจหลักการ จ่ายเอกสาร/แผ่นพับเสริมเพื่ออ่านทบทวน' },
    { value: 'via_caregiver', label: 'แนะนำผ่านญาติ/ผู้ดูแล', desc: 'ผู้ป่วยมีข้อจำกัดในการสื่อสาร จึงแนะนำแก่ผู้ดูแลหลักแทน' },
  ];

  constructor(private http: HttpService) { }

  ngOnInit(): void { }

  get patientInfo(): any {
    return this.patient?.todayDrugsHN?.[0] || {};
  }

  get hn(): string {
    return this.patientInfo.hn || this.patientInfo.HN || '-';
  }

  get clinicName(): string {
    return (
      this.patientInfo.clinicName ||
      this.patient?.clinicName ||
      this.patient?.departmentName ||
      '-'
    );
  }

  get activeGroupMeta() {
    return this.groups.find((g) => g.key === this.activeGroup) || this.groups[0];
  }

  get currentManagements(): InterventionOption[] {
    if (this.activeGroup === 'pharmacist') return this.pharmacistManagements;
    if (this.activeGroup === 'patient') return this.patientManagements;
    return this.doctorManagements;
  }

  get currentOutcomes(): InterventionOption[] {
    if (this.activeGroup === 'pharmacist') return this.pharmacistOutcomes;
    if (this.activeGroup === 'patient') return this.patientOutcomes;
    return this.doctorOutcomes;
  }

  get selectedManagement(): InterventionOption | undefined {
    return this.currentManagements.find((m) => m.value === this.management);
  }

  get needConfirmReason(): boolean {
    return this.activeGroup === 'doctor' && this.outcome === 'confirmed';
  }

  get isValid(): boolean {
    if (!this.management || !this.outcome) return false;
    if (this.needConfirmReason && !this.confirmReason) return false;
    return true;
  }

  selectGroup(key: InterventionGroupKey) {
    if (this.activeGroup === key) return;
    this.activeGroup = key;
    this.management = '';
    this.outcome = '';
    this.confirmReason = '';
  }

  // คลิก tag แล้วเติมข้อความต่อท้าย quickRemark (คั่นด้วย space, กันซ้ำติดกัน) + focus กลับที่ textarea
  appendQuickRemarkTag(tag: string) {
    const t = (tag || '').trim();
    if (!t) return;
    const cur = (this.quickRemark || '').trim();
    if (!cur) {
      this.quickRemark = t;
    } else if (!cur.endsWith(t)) {
      // กันกดซ้ำติดกัน
      this.quickRemark = cur + ' ' + t;
    }
    // focus กลับที่ textarea ให้พิมพ์ต่อได้ทันที (เลื่อน caret ไปท้ายข้อความ)
    setTimeout(() => {
      const el = this.quickRemarkBox?.nativeElement;
      if (!el) return;
      el.focus({ preventScroll: false });
      const len = el.value?.length ?? 0;
      try {
        el.setSelectionRange(len, len);
      } catch { /* บาง browser ไม่รองรับ — ข้ามได้ */ }
    });
  }

  openModal() {
    this.activeGroup = 'doctor';
    this.management = '';
    this.outcome = '';
    this.confirmReason = '';
    this.quickRemark = '';
    this.isNonPE = true;
    this.recorder = this.dataUser?.user

    this.targetDrugs = this.resolveTargetDrugs();
    this.buildTrigger();
    this.buildIssuePrefill();
    const modalEl = $('#' + this.modalId);
    // เปิดซ้อนบน modal แจ้งเตือนทุกตัว (dosage/duplicate/...) - จัด z-index แบบเดียวกับ modal-mederror
    modalEl.off('hidden.bs.modal');
    modalEl.on('hidden.bs.modal', () => {
      $('body').addClass('modal-open');
    });
    modalEl.css('z-index', 1060);
    modalEl.off('shown.bs.modal');
    modalEl.on('shown.bs.modal', () => {
      $('.modal-backdrop').last().css('z-index', 1055);
    });
    modalEl.modal('show');
  }
  closeModal() {
    $('#' + this.modalId).modal('hide');
  }
  async onSubmit() {
    if (!this.isValid) return;

    const { drug, drugCode } = this.resolveDrugInfo();
    const mgmt = this.selectedManagement;
    const outcomeOpt = this.currentOutcomes.find((o) => o.value === this.outcome);
    // payload ชุดเดียวกับ flow CPOE ของ modal-mederror (ค่าว่าง = flow นี้ไม่ได้ใช้ field นั้น)
    // ตาราง: tb_clinical_intervention (ดู schema/tb_clinical_intervention.sql)

    const payload = createInterventionPayload({
      hn: this.hn,
      clinic: this.clinicName,
      doc: this.patientInfo.docName || '-',
      drug,
      drugCode,
      weight: this.patientInfo.Weight || '',
      height: this.patientInfo.Height || '',
      source: this.source,
      trigger: this.trigger,
      targetDrugs: this.targetDrugs,
      group: this.activeGroup,
      groupLabel: this.activeGroupMeta.label,
      // flow นี้ไม่ได้ใช้ช่องทางประสานงานแบบ inline (ของ flow CPOE)
      channel: '',
      channelLabel: '',
      issueTopic: this.issueTopic,
      issueDetail: this.issueDetail,
      management: mgmt?.value || '',
      managementLabel: mgmt?.label || '',
      managementDesc: mgmt?.desc || '',
      // action/fix เป็นของ flow inline ใน modal-mederror
      action: '',
      outcome: this.outcome,
      outcomeLabel: outcomeOpt?.label || '',
      confirmReason: this.needConfirmReason ? this.confirmReason : '',
      fix: '',
      fixDetail: '',
      isNonPE: this.isNonPE,
      quickRemark: this.quickRemark,
      note: this.quickRemark,
      recorder: this.recorder,
      user: this.dataUser?.user || '',
      userName: this.dataUser?.name || '',
      entryChannel: 'nonPE',
      prescription: this.patientInfo.reqNo || this.patientInfo.remark || '',
    });
    // console.log('[Intervention][' + this.activeGroup + '] payload:', payload);
    // console.log('Clinical Intervention payload:', JSON.stringify(payload));

    const formData = interventionToFormData(payload);
    const saved: any = await this.http.post('saveClinicalIntervention', formData);



    // console.log('saveClinicalIntervention response:', saved);

    if (!saved || saved.connect !== true) {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      return;
    }

    const rowCount = Number(saved.response?.response?.rowCount ?? 0);

    if (rowCount > 0) {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'บันทึก Intervention สำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      });

      this.closeModal();
    } else {
      console.error('บันทึกไม่สำเร็จ:', saved.response.response);

      Swal.fire(
        'บันทึก Intervention ไม่สำเร็จ',
        saved.response?.response?.message ?? '',
        'error'
      );
    }


  }
  private buildTrigger() {
    // Dosage: คำนวณสถานะเทียบเกณฑ์เหมือนเดิม
    if (this.source === 'Dosage') {
      const value = Number(this.drugItem?.calculatedResult);
      const rule = this.drugItem?.matchedDrugRule;
      const notequal = Number(rule?.warningNotequalto);
      const min = Number(rule?.warningMin);
      const max = Number(rule?.warningMax);
      let status = '';
      if (rule?.warningNotequalto) {
        status = value < notequal ? 'ต่ำกว่าเกณฑ์มาตรฐาน' : value > notequal ? 'เกินเกณฑ์มาตรฐาน' : 'อยู่ในเกณฑ์มาตรฐาน';
      } else {
        status = value < min ? 'ต่ำกว่าเกณฑ์มาตรฐาน' : value > max ? 'เกินเกณฑ์มาตรฐาน' : 'อยู่ในเกณฑ์มาตรฐาน';
      }
      this.trigger = `Dosage Screening (${status})`;
      return;
    }
    // Duplicate: แสดงกลุ่มยา + สถานะคู่ (สั่งวันนี้/ยาเดิมเหลือ X วัน)
    if (this.source === 'Duplicate') {
      const group = this.drugItem?.groupName || '-';
      const badge = this.drugItem?.badgeText || 'ยาซ้ำซ้อน';
      this.trigger = `Duplicate Screening (${group} • ${badge})`;
      return;
    }
    // DrugInteraction: แสดงคู่ยา + severity
    if (this.source === 'DrugInteraction') {
      const d1 = this.drugItem?.todayDrug?.invName || '-';
      const d2 = this.drugItem?.interactingDrug?.invName || '-';
      const sev = this.drugItem?.severity ? ` • ${this.drugItem.severity}` : '';
      this.trigger = `Drug Interaction (${d1} + ${d2}${sev})`;
      return;
    }
    // DrugDisease: แสดงโรค/ข้อห้ามที่เป็น trigger
    if (this.source === 'DrugDisease') {
      const cond = this.drugItem?.typeName || this.drugItem?.diseaseName || this.drugItem?.note || 'ยาห้ามใช้กับโรค';
      this.trigger = `Drug-Disease Screening (${cond})`;
      return;
    }
    // Allergy: แสดงยาที่แพ้
    if (this.source === 'Allergy') {
      const drug = this.drugItem?.patient?.invName || this.drugItem?.invName || 'แพ้ยา';
      this.trigger = `Allergy Screening (${drug})`;
      return;
    }
    // Lab: แสดงค่าแล็บที่เป็น trigger
    if (this.source === 'Lab') {
      const lab = this.drugItem?.result_name || this.drugItem?.labName || 'Lab';
      const val = this.drugItem?.real_res != null ? ` = ${this.drugItem.real_res}` : '';
      this.trigger = `Lab Screening (${lab}${val})`;
      return;
    }
    // AppropriateDosage: แสดงสถานะเกิน/ขาด
    if (this.source === 'AppropriateDosage') {
      const st = this.drugItem?.statusText || 'ความเหมาะสมของยา';
      this.trigger = `Appropriate Screening (${st})`;
      return;
    }
    // source อื่น ๆ ในอนาคต: ใช้ชื่อ source เป็น trigger ตรง ๆ
    this.trigger = this.source || 'Clinical Intervention';
  }

  private buildIssuePrefill() {
    const topic = this.defaultTopicBySource[this.source] || this.source || 'ประเด็นที่ต้องแทรกแซง';
    this.issueTopic = topic;
    const drugs = this.targetDrugs.filter((d) => d && d !== '-').join(' + ') || '-';
    this.issueDetail = this.trigger ? this.trigger + ' | ยาที่เกี่ยวข้อง: ' + drugs : 'ยาที่เกี่ยวข้อง: ' + drugs;
  }

  /**
   * รวมชื่อยาเป้าหมายทุกรูปแบบ input ให้แสดงได้ทุก component
   * - Dosage: drugItem.patient.invName
   * - Duplicate: row ปัจจุบัน (currentDrug) + คู่ซ้ำ (pairedDrug)
   * - DrugInteraction: todayDrug + interactingDrug
   * - DrugDisease/Allergy/Lab/Appropriate: ชื่อยาเดี่ยว
   * - component อื่น: พยายามอ่าน field ชื่อยาทั่วไป (invName/drugName/...)
   */
  private resolveTargetDrugs(): string[] {
    const d = this.drugItem;
    if (!d) return ['-'];
    // เคส Duplicate: แสดงทั้งยาตัวที่ 1 และยาตัวที่ 2
    if (d.currentDrug || d.pairedDrug) {
      const names = [
        d.currentDrug?.drugName || d.currentDrug?.invName,
        d.pairedDrug?.drugName || d.pairedDrug?.invName,
      ].filter(Boolean);
      return names.length ? names : ['-'];
    }
    // เคส DrugInteraction: แสดงคู่ยาที่ตีกัน
    if (d.todayDrug || d.interactingDrug) {
      const names = [
        d.todayDrug?.invName || d.todayDrug?.drugName,
        d.interactingDrug?.invName || d.interactingDrug?.drugName,
      ].filter(Boolean);
      return names.length ? names : ['-'];
    }
    const single =
      d.patient?.invName ||
      d.invName ||
      d.drugName ||
      d.currentDrugName ||
      d.duplicateDrug ||
      '-';
    return [single];
  }

  /** ดึงชื่อ/รหัสยาหลักสำหรับ payload ให้ได้ทุก shape (Dosage/Duplicate/อื่น ๆ) */
  private resolveDrugInfo(): { drug: string; drugCode: string } {
    const d = this.drugItem;
    if (!d) return { drug: '', drugCode: '' };
    // Duplicate row: ใช้ยาตัวที่ 1 (ใบสั่งปัจจุบัน) เป็นหลัก
    if (d.currentDrug || d.pairedDrug) {
      return {
        drug: d.currentDrug?.drugName || d.invName || '',
        drugCode: d.currentDrug?.invCode || d.invCode || '',
      };
    }
    // DrugInteraction: ใช้ยาตัวที่ 1 (ใบสั่งปัจจุบัน) เป็นหลัก
    if (d.todayDrug || d.interactingDrug) {
      return {
        drug: d.todayDrug?.invName || d.patient?.invName || d.invName || '',
        drugCode: d.todayDrug?.invCode || d.patient?.invCode || d.invCode || '',
      };
    }
    return {
      drug: d.patient?.invName || d.invName || d.drugName || '',
      drugCode: d.patient?.invCode || d.invCode || d.drugCode || '',
    };
  }
}
