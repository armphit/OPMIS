import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import {
  createInterventionPayload,
  interventionToFormData,
} from 'src/app/pages/check-patient/shared/intervention-payload';
import Swal from 'sweetalert2';
declare const $: any;

@Component({
  selector: 'app-modal-mederror',
  templateUrl: './modal-mederror.component.html',
  styleUrls: ['./modal-mederror.component.scss'],
})
export class ModalMederrorComponent implements OnInit {
  @Input() patient: any;
  @Input() drugItem: any;
  @Input() source: string = '';
  @Output() save = new EventEmitter<any>();

  // Form fields for med error
  medErrorType: string = '';
  medErrorDetail: string = '';
  medErrorSeverity: string = '';
  medErrorNote: string = '';

  modalId = 'medErrorModal_' + Math.random().toString(36).substring(2, 8);
  gettypeE: any = [];
  typeE: any = [];
  medGood: string = 'รอผลการการแก้ไข';
  medGoodtext: string = '';
  medWrong: string = '';
  medWrongtext: string = '';
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

  // ===== Clinical Intervention (inline checkbox, แยกจาก modal-intervention เดิม) =====
  // ไม่ยุ่งกับ modal-intervention: state/payload แยกชุดใหม่ทั้งหมด (civ*)
  showIntervention: boolean = false;
  civChannel: string = 'phone';
  civAction: string = '';
  civOutcome: string = 'accept';
  civFix: string = '';
  civFixDetail: string = '';
  ivtTrigger: string = '';
  ivtTargetDrugs: string[] = [];

  // หัวข้อประเด็นที่เตือนตาม Alert ที่เปิดมา (ตรงกับ modal-intervention)
  private readonly ivtDefaultTopicBySource: Record<string, string> = {
    Dosage: 'ขนาดยาไม่เหมาะสม (Inappropriate Dose)',
    AppropriateDosage: 'ความเหมาะสมของขนาดยา (Appropriateness)',
    Duplicate: 'ยาซ้ำซ้อน (Duplicate Therapy)',
    DrugInteraction: 'อันตรกิริยาระหว่างยา (Drug-Drug Interaction)',
    DrugDisease: 'ข้อห้ามใช้ในผู้ป่วยรายนี้ (Contraindication)',
    Allergy: 'ประวัติแพ้ยา (Drug Allergy)',
    Lab: 'ค่าแล็บผิดปกติที่กระทบต่อยา (Lab-related)',
  };

  civChannels = [
    { value: 'phone', label: 'โทรประสานงาน' },
    { value: 'sendback', label: 'ส่งกลับพบแพทย์' },
  ];

  // ขั้นตอนที่ 2: Action 8 รายการ (editable combobox)
  civActionOptions: string[] = [
    'ขนาดยาไม่เหมาะสม แนะนำปรับขนาดยา',
    'เกิดยาซ้ำซ้อน ไม่แนะนำให้ใช้ร่วมกัน',
    'เกิดอันตรกิริยาระหว่างยา แนะนำเปลี่ยนชนิดยา / หยุดยาชั่วคราว',
    'มีข้อห้ามใช้ตามโรค/สภาวะผู้ป่วย แนะนำเปลี่ยนชนิดยา',
    'มีประวัติแพ้ยา แนะนำเปลี่ยนชนิดยา',
    'ปริมาณยาไม่พอดีกับวันนัด แนะนำปรับจำนวนยา',
    'ค่าแล็บผิดปกติ แนะนำปรับลดขนาดยา / หยุดยา',
    'เกิดอันตรกิริยาด้านการดูดซึม แนะนำแยกมื้อบริหารยา',
  ];

  private readonly civActionBySource: Record<string, string> = {
    Dosage: 'ขนาดยาไม่เหมาะสม แนะนำปรับขนาดยา',
    Duplicate: 'เกิดยาซ้ำซ้อน ไม่แนะนำให้ใช้ร่วมกัน',
    DrugInteraction:
      'เกิดอันตรกิริยาระหว่างยา แนะนำเปลี่ยนชนิดยา / หยุดยาชั่วคราว',
    DrugDisease: 'มีข้อห้ามใช้ตามโรค/สภาวะผู้ป่วย แนะนำเปลี่ยนชนิดยา',
    Allergy: 'มีประวัติแพ้ยา แนะนำเปลี่ยนชนิดยา',
    AppropriateDosage: 'ปริมาณยาไม่พอดีกับวันนัด แนะนำปรับจำนวนยา',
    Lab: 'ค่าแล็บผิดปกติ แนะนำปรับลดขนาดยา / หยุดยา',
  };

  civOutcomes = [
    { value: 'accept', label: 'ยอมรับ (Accept)' },
    { value: 'keep', label: 'ยืนยันใช้เดิม' },
    { value: 'pending', label: 'รอติดต่อแพทย์' },
  ];

  // ขั้นตอนที่ 4: การแก้ไขของแพทย์ 6 รายการ
  civFixOptions: string[] = [
    'OFF ยารายการวันนี้ออก',
    'เปลี่ยนชนิดยา',
    'ปรับขนาดยาใหม่',
    'ปรับจำนวนยาให้พอดีวันนัด',
    'หยุดยาชั่วคราว',
    'ปรับวิธีใช้ / แยกมื้อบริหารยา',
  ];

  get ivtPatientInfo(): any {
    return this.patient?.todayDrugsHN?.[0] || {};
  }

  get ivtHn(): string {
    return this.ivtPatientInfo.hn || this.ivtPatientInfo.HN || '-';
  }

  get ivtClinicName(): string {
    return (
      this.ivtPatientInfo.clinicName ||
      this.patient?.clinicName ||
      this.patient?.departmentName ||
      '-'
    );
  }

  get isInterventionValid(): boolean {
    return !!(this.showIntervention && this.civAction?.trim());
  }

  onToggleIntervention() {
    if (!this.showIntervention) {
      this.resetInterventionForm();
      return;
    }
    // Default: channel = โทรประสานงาน, outcome = ยอมรับ (Accept)
    this.civChannel = 'phone';
    this.civOutcome = 'accept';
    // Auto-fill Action ตาม Alert ที่เปิดมา (ผู้ใช้แก้/พิมพ์ต่อท้ายได้)
    this.civAction = this.civActionBySource[this.source] || '';
    this.civFix = '';
    this.civFixDetail = '';
    this.ivtTargetDrugs = this.resolveIvtTargetDrugs();
    this.buildIvtTrigger();
  }

  onCivFixChange() {
    const drugName = this.resolveIvtDrugName();
    if (this.civFix === 'ปรับขนาดยาใหม่') {
      this.civFixDetail = drugName ? `${drugName} (ปรับขนาดยาใหม่)` : '';
    } else if (this.civFix === 'ปรับจำนวนยาให้พอดีวันนัด') {
      this.civFixDetail = drugName ? `${drugName} (ปรับจำนวนยาตามวันนัด)` : '';
    } else if (this.civFix === 'เปลี่ยนชนิดยา') {
      // ให้พิมพ์ชื่อยาใหม่ต่อได้ — ล้างเฉพาะเมื่อยังไม่มีค่า
      if (!this.civFixDetail) {
        this.civFixDetail = '';
      }
    } else {
      this.civFixDetail = '';
    }
  }

  private resetInterventionForm() {
    this.civChannel = 'phone';
    this.civAction = '';
    this.civOutcome = 'accept';
    this.civFix = '';
    this.civFixDetail = '';
    this.ivtTrigger = '';
    this.ivtTargetDrugs = [];
  }

  constructor(
    private http: HttpService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void { }

  async openModal() {


    // Force Angular change detection to update @Input() bindings (drugItem, patient)
    // before we read them. This prevents drugItem from being null on first click
    // when the parent sets selectedDrugItem and immediately calls openModal().

    // Reset form
    this.medErrorType = '';
    this.medErrorDetail = '';
    this.medErrorSeverity = '';
    this.medErrorNote = '';
    this.showIntervention = false;
    this.resetInterventionForm();

    this.medWrong = this.drugItem?.patient?.invName || this.drugItem?.drugName || this.drugItem?.invName || '';
    this.medGood =
      this.source == 'AppropriateDosage' || this.source == 'Dosage'
        ? this.drugItem?.patient?.invName || this.medGood
        : this.medGood;

    const modalEl = $('#' + this.modalId);
    // Remove any previous handlers to avoid duplicates
    modalEl.off('hidden.bs.modal');
    // When child modal closes (by any means: close btn, backdrop click, Escape key),
    // Bootstrap removes 'modal-open' from body, which breaks scroll on parent modal.
    // Restore it after the hide animation completes.
    modalEl.on('hidden.bs.modal', () => {
      $('body').addClass('modal-open');
    });

    // Set z-index higher than parent modal (default Bootstrap modal z-index is 1050)
    modalEl.css('z-index', 1060);
    // Also ensure the backdrop has a higher z-index
    modalEl.off('shown.bs.modal');
    modalEl.on('shown.bs.modal', () => {
      $('.modal-backdrop').last().css('z-index', 1055);
      // เรียก detectChanges หลังจาก Bootstrap แสดง modal เสร็จแล้ว
      // เพื่อให้ Angular อัปเดต View หลังจาก Bootstrap ย้าย DOM element
      // this.cdr.detectChanges();
    });

    // IMPORTANT: แสดง Bootstrap modal ก่อนโหลดข้อมูล dropdown
    // เพื่อให้ modal ขึ้นบนจอทันที ไม่ต้องรอ (หรือค้าง) กับ HTTP requests
    // (getType / getCompiler) ซึ่งถ้า server อยู่นอกเครือข่าย/ค้าง จะทำให้
    // การกดปุ่ม PE ดูเหมือน "ไม่มีอะไรเกิดขึ้น" และ modal ไม่เคยแสดง
    modalEl.modal('show');

    // โหลดประเภท error + รายการยาเป็น background หลัง modal แสดงแล้ว
    // try/catch: ถึงโหลดไม่สำเร็จ modal ก็ยังเปิดกรอก/บันทึกได้ (ไม่ค้าง/ไม่เด้งออก)
    try {
      await this.getDataPosition();
    } catch {
      this.gettypeE = this.gettypeE?.length ? this.gettypeE : this.typeE || [];
    }
    try {
      await this.getDrug();
    } catch {
      this.drugList = Array.isArray(this.drugList) ? this.drugList : [];
    }


  }

  closeModal() {
    this.gettypeE = [];
    $('#' + this.modalId).modal('hide');
  }

  async onSubmit() {
    // กันกดบันทึกถ้าติ๊ก Clinical Intervention แต่ยังไม่กรอก Action
    if (this.showIntervention && !this.isInterventionValid) {
      Swal.fire(
        'กรุณากรอกสิ่งที่เภสัชกรแนะนำ (Action)!',
        '',
        'warning',
      );
      return;
    }
    // Duplicate (ยาซ้ำซ้อน): คงข้อมูลส่ง API เดิม (getPE -> addPE) ไม่เปลี่ยน field
    if (this.source == 'Duplicate') {
      await this.onSubmitDuplicate();
      return;
    }
    let formData = new FormData();
    // formData.append('currentDrug', currentDrug);
    // formData.append('hn', todayDrugs?.hn);
    // formData.append('lastIssTime', todayDrugs?.lastIssTime);
    // let getData: any = await this.http.post('getPE', formData);
    // if (getData.connect) {
    //   if (getData.response.rowCount) {
    //     Swal.fire({
    //       position: 'center',
    //       icon: 'error',
    //       title: 'บันทึกข้อมูลไม่สำเร็จ เนื่องจากมีข้อมูล PE อยู่แล้ว',
    //       showConfirmButton: false,
    //       timer: 1500,
    //     });
    //   }
    // } else {
    //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    // }


    const drugInvName = this.drugItem?.patient?.invName || this.drugItem?.drugName || this.drugItem?.invName || '';
    const drugInvCode = this.drugItem?.patient?.invCode || this.drugItem?.drugCode || this.drugItem?.invCode || '';
    const payload: any = {
      hn: this.patient?.todayDrugsHN?.[0]?.hn || '',
      toSite: String(this.patient?.todayDrugsHN?.[0]?.toSite || '').trim(),
      lastIssTime:
        this.patient?.todayDrugsHN?.[0]?.scrnTime || '',
      doc: String(this.patient?.todayDrugsHN?.[0]?.docName || '').trim(),
      med:
        drugInvName && drugInvName == this.medWrong
          ? drugInvCode || this.medWrong
          : this.medWrong,
      pe: this.medErrorType,
      user: this.dataUser.user,
      userName: this.dataUser.name,
      medGood:
        drugInvName && drugInvName == this.medGood
          ? drugInvCode || this.medGood
          : this.medGood,
      medGoodtext: this.medGoodtext,
      medWrong:
        drugInvName && drugInvName == this.medWrong
          ? drugInvCode || this.medWrong
          : this.medWrong,
      medWrongtext: this.medWrongtext,
      checkType: String(this.drugItem?.patient?.checkType || '').includes('CPOE')
        ? 'CPOE'
        : 'nonCPOE',
    };
    // console.log('Payload:', payload); // Log the payload to check its structure and values
    Object.keys(payload).forEach((key) => {
      const value = payload[key];

      // ตรวจสอบว่าเป็น Object หรือ Array หรือไม่ (เช่น currentDrug หรือ pe)
      if (typeof value === 'object' && value !== null) {
        // ถ้าเป็น Object ให้แปลงเป็น String ก่อนส่ง
        formData.append(key, JSON.stringify(value));
      } else {
        // ถ้าเป็นค่าปกติ (String, Number) ส่งไปได้เลย
        formData.append(key, value ?? '');
      }
    });
    if (this.showIntervention && this.isInterventionValid) {
      await this.emitInterventionIfNeeded(payload);
    } else {
      this.save.emit(payload);
    }
    let getData: any = await this.http.post('addPEfix', formData);
    if (getData.connect) {
      if (getData.response.rowCount) {



        if (this.showIntervention && this.isInterventionValid) {
          await this.emitInterventionIfNeeded(payload);
        } else {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
          });
          this.closeModal();
          this.save.emit(payload);
        }

      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'บันทึกข้อมูลไม่สำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  /**
   * บันทึก PE สำหรับยาซ้ำซ้อน (source == 'Duplicate')
   * คง flow เดิมของ duplicate-check-card.sendPE ทุก field:
   * 1) getPE ด้วย currentDrug/hn/lastIssTime (กันบันทึกซ้ำ)
   * 2) addPE ด้วย payload { hn, toSite, lastIssTime, doc, ...d, currentDrug, pe, user, userName }
   * ต่างแค่เลือก pe5/pe6 ผ่าน modal-mederror แทน SweetAlert
   */
  private async onSubmitDuplicate() {
    const dup: any = this.drugItem?.duplicate || {};
    const currentDrug = dup.currentDrug || this.drugItem?.patient?.invCode || '';
    const d: any = { ...dup };
    delete d.currentDrug;
    delete d.todayDrug;
    const todayDrug: any = dup.todayDrug || {};
    const firstDrug: any = this.patient?.todayDrugsHN?.[0] || {};

    if (!currentDrug) {
      Swal.fire('ไม่พบข้อมูลคู่ยา!', '', 'error');
      return;
    }
    if (!this.medErrorType) {
      Swal.fire('กรุณาเลือกประเภท PE (pe5/pe6)!', '', 'warning');
      return;
    }

    const checkForm = new FormData();
    checkForm.append('currentDrug', currentDrug);
    checkForm.append('hn', todayDrug?.hn || firstDrug?.hn || '');
    checkForm.append('lastIssTime', todayDrug?.lastIssTime || firstDrug?.lastIssTime || '');
    const checked: any = await this.http.post('getPE', checkForm);
    if (!checked.connect) {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      return;
    }
    if (checked.response.rowCount) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ เนื่องจากมีข้อมูล PE อยู่แล้ว',
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const payload: any = {
      hn: todayDrug?.hn || firstDrug?.hn,
      toSite: todayDrug?.toSite || firstDrug?.toSite,
      lastIssTime: firstDrug?.scrnTime || firstDrug?.lastIssTime,
      doc: todayDrug?.docName,
      ...d,
      currentDrug: currentDrug,
      pe: this.medErrorType,
      user: this.dataUser.user,
      userName: this.dataUser.name,
    };
    // console.log('Duplicate PE Payload:', payload); // Log the payload for debugging
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      const value = (payload as any)[key];
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value ?? '');
      }
    });

    const saved: any = await this.http.post('addPE', formData);
    if (!saved.connect) {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
      return;
    }
    if (saved.response.rowCount) {

      // ถ้าติ๊ก Intervention: build payload (entryChannel='CPOE') + emit คู่กับ PE
      // ถ้าไม่ติ๊ก: emit PE เดิมเหมือนเดิม — parent ไม่กระทบ
      if (this.showIntervention && this.isInterventionValid) {
        await this.emitInterventionIfNeeded(payload);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'บันทึกข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
        this.closeModal();
        this.save.emit(payload);
      }
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  async getDataPosition() {
    await this.getType();
    if (this.source == 'DrugInteraction') {
      this.gettypeE = this.typeE.filter((v: any) =>
        ['pe10', 'pe11'].includes(v.id_type),
      );
    } else if (this.source == 'Allergy') {
      this.gettypeE = this.typeE.filter((v: any) =>
        ['pe7', 'pe8', 'pe9'].includes(v.id_type),
      );
    } else if (this.source == 'AppropriateDosage') {
      this.gettypeE = this.typeE.filter((v: any) =>
        ['pe3', 'pe19'].includes(v.id_type),
      );
    } else if (this.source == 'Dosage') {
      this.gettypeE = this.typeE.filter((v: any) =>
        ['pe12', 'pe13', 'pe14'].includes(v.id_type),
      );
    } else if (this.source == 'Lab') {
      this.gettypeE = this.typeE.filter((v: any) =>
        ['pe1', 'pe2', 'pe12', 'pe13', 'pe15', 'pe20'].includes(v.id_type),
      );
    } else if (this.source == 'Duplicate') {
      this.gettypeE = this.typeE.filter((v: any) =>
        ['pe5', 'pe6'].includes(v.id_type),
      );
    } else if (this.source == 'DrugDisease') {
      // Drug-Disease: โชว์ PE ทุกประเภท (ไม่กรอง)
      this.gettypeE = [...this.typeE];
    } else {
      // Default: show all types if source doesn't match any filter
      this.gettypeE = this.typeE;
    }
  }
  async getType() {
    try {
      let getData: any = await this.http.post('getType');
      if (getData?.connect) {
        if (getData?.response?.result) {
          this.typeE = getData.response.result;
        }
      }
    } catch {
      // โหลดประเภทไม่สำเร็จก็ปล่อย dropdown ว่างไว้ แต่ modal ยังเปิด/ใช้งานได้
    }
  }
  filter_good(): void {
    const filterValue = (this.inputgood?.nativeElement?.value || '').toLowerCase();
    const list = Array.isArray(this.drugList) ? this.drugList : [];

    this.dataGood = list.filter((o: any) =>
      (o?.name || '').trim().toLowerCase().includes(filterValue),
    );
  }
  filter_wrong(): void {
    const filterValue = (this.inputwrong?.nativeElement?.value || '').toLowerCase();
    const list = Array.isArray(this.drugList) ? this.drugList : [];

    this.dataWrong = list.filter((o: any) =>
      (o?.name || '').trim().toLowerCase().includes(filterValue),
    );
  }
  dataGood: any;
  dataWrong: any;
  drugList: any;
  @ViewChild('inputgood') inputgood!: ElementRef<HTMLInputElement>;
  @ViewChild('inputwrong') inputwrong!: ElementRef<HTMLInputElement>;
  // ===== Clinical Intervention payload (บันทึกผ่าน API addIntervention) =====
  // ใช้ payload ชุดเดียวกับ modal-intervention (createInterventionPayload)
  // เพื่อให้ลงตารางเดียวกันคือ tb_clinical_intervention (ดู schema/tb_clinical_intervention.sql)
  private buildInterventionPayload(): any {
    const { drug, drugCode } = this.resolveIvtDrugInfo();
    const channelLabel =
      this.civChannels.find((c) => c.value === this.civChannel)?.label ||
      this.civChannel;
    const outcomeLabel =
      this.civOutcomes.find((o) => o.value === this.civOutcome)?.label ||
      this.civOutcome;
    // Part 1: ประเด็นที่เตือน (เติมอัตโนมัติให้ตรงกับ flow modal-intervention)
    const issueTopic =
      this.ivtDefaultTopicBySource[this.source] || this.source || '';
    const drugs =
      (this.ivtTargetDrugs || []).filter((d) => d && d !== '-').join(' + ') ||
      '-';
    const issueDetail = this.ivtTrigger
      ? this.ivtTrigger + ' | ยาที่เกี่ยวข้อง: ' + drugs
      : 'ยาที่เกี่ยวข้อง: ' + drugs;

    return createInterventionPayload({
      hn: this.ivtHn,
      clinic: this.ivtClinicName,
      doc: this.ivtPatientInfo.docName || '-',
      drug,
      drugCode,
      weight: this.ivtPatientInfo.Weight || '',
      height: this.ivtPatientInfo.Height || '',
      source: this.source,
      trigger: this.ivtTrigger,
      targetDrugs: this.ivtTargetDrugs,
      // flow inline ไม่ได้ให้เลือกกลุ่มผู้รับ (group) => เก็บค่าว่าง
      group: '',
      groupLabel: '',
      channel: this.civChannel,
      channelLabel,
      issueTopic,
      issueDetail,
      // flow inline ใช้ action แทน management ของ modal-intervention
      management: '',
      managementLabel: '',
      managementDesc: '',
      action: (this.civAction || '').trim(),
      outcome: this.civOutcome,
      outcomeLabel,
      confirmReason: '',
      fix: this.civFix || '',
      fixDetail: (this.civFixDetail || this.civFix || '').trim(),
      // intervention ชุดนี้บันทึกคู่กับ PE (มีรายงาน PE อยู่แล้ว) => ไม่ใช่ NON-PE
      isNonPE: false,
      quickRemark: '',
      note: '',
      recorder: this.dataUser?.user || '',
      user: this.dataUser?.user || '',
      userName: this.dataUser?.name || '',
      entryChannel: 'CPOE',
      prescription: this.ivtPatientInfo.reqNo || this.ivtPatientInfo.remark || '',
    });
  }

  private async emitInterventionIfNeeded(pePayload: any) {
    if (!this.showIntervention || !this.isInterventionValid) {
      return;
    }
    const interventionPayload = this.buildInterventionPayload();
    // console.log(
    //   'Clinical Intervention payload (from checkbox, CPOE):',
    //   interventionPayload,
    // );
    // บันทึกลงตาราง tb_clinical_intervention ผ่าน API addIntervention
    const formData = interventionToFormData(interventionPayload);
    const saved: any = await this.http.post('saveClinicalIntervention', formData);
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
    this.save.emit({ pe: pePayload, intervention: interventionPayload });
  }

  private buildIvtTrigger() {
    // Dosage: คำนวณสถานะเทียบเกณฑ์เหมือน modal-intervention เดิม
    if (this.source === 'Dosage') {
      const value = Number(this.drugItem?.calculatedResult);
      const rule = this.drugItem?.matchedDrugRule;
      const notequal = Number(rule?.warningNotequalto);
      const min = Number(rule?.warningMin);
      const max = Number(rule?.warningMax);
      let status = '';
      if (rule?.warningNotequalto) {
        status =
          value < notequal
            ? 'ต่ำกว่าเกณฑ์มาตรฐาน'
            : value > notequal
              ? 'เกินเกณฑ์มาตรฐาน'
              : 'อยู่ในเกณฑ์มาตรฐาน';
      } else {
        status =
          value < min
            ? 'ต่ำกว่าเกณฑ์มาตรฐาน'
            : value > max
              ? 'เกินเกณฑ์มาตรฐาน'
              : 'อยู่ในเกณฑ์มาตรฐาน';
      }
      this.ivtTrigger = `Dosage Screening (${status})`;
      return;
    }
    if (this.source === 'Duplicate') {
      const group = this.drugItem?.groupName || '-';
      const badge = this.drugItem?.badgeText || 'ยาซ้ำซ้อน';
      this.ivtTrigger = `Duplicate Screening (${group} • ${badge})`;
      return;
    }
    if (this.source === 'DrugInteraction') {
      const d1 = this.drugItem?.todayDrug?.invName || '-';
      const d2 = this.drugItem?.interactingDrug?.invName || '-';
      const sev = this.drugItem?.severity ? ` • ${this.drugItem.severity}` : '';
      this.ivtTrigger = `Drug Interaction (${d1} + ${d2}${sev})`;
      return;
    }
    if (this.source === 'DrugDisease') {
      const cond =
        this.drugItem?.typeName ||
        this.drugItem?.diseaseName ||
        this.drugItem?.note ||
        'ยาห้ามใช้กับโรค';
      this.ivtTrigger = `Drug-Disease Screening (${cond})`;
      return;
    }
    if (this.source === 'Allergy') {
      const drug =
        this.drugItem?.patient?.invName || this.drugItem?.invName || 'แพ้ยา';
      this.ivtTrigger = `Allergy Screening (${drug})`;
      return;
    }
    if (this.source === 'Lab') {
      const lab = this.drugItem?.result_name || this.drugItem?.labName || 'Lab';
      const val =
        this.drugItem?.real_res != null ? ` = ${this.drugItem.real_res}` : '';
      this.ivtTrigger = `Lab Screening (${lab}${val})`;
      return;
    }
    if (this.source === 'AppropriateDosage') {
      const st = this.drugItem?.statusText || 'ความเหมาะสมของยา';
      this.ivtTrigger = `Appropriate Screening (${st})`;
      return;
    }
    this.ivtTrigger = this.source || 'Clinical Intervention';
  }

  private resolveIvtTargetDrugs(): string[] {
    const d = this.drugItem;
    // console.log('Resolving target drugs from drugItem:', this.patient);
    if (!d) {
      return ['-'];
    }
    if (d.currentDrug || d.pairedDrug) {
      const names = [
        d.currentDrug?.drugName || d.currentDrug?.invName,
        d.pairedDrug?.drugName || d.pairedDrug?.invName,
      ].filter(Boolean);
      return names.length ? names : ['-'];
    }
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

  private resolveIvtDrugName(): string {
    return this.resolveIvtDrugInfo().drug || '';
  }

  private resolveIvtDrugInfo(): { drug: string; drugCode: string } {
    const d = this.drugItem;
    if (!d) {
      return { drug: '', drugCode: '' };
    }
    if (d.currentDrug || d.pairedDrug) {
      return {
        drug: d.currentDrug?.drugName || d.invName || '',
        drugCode: d.currentDrug?.invCode || d.invCode || '',
      };
    }
    if (d.todayDrug || d.interactingDrug) {
      return {
        drug: d.todayDrug?.invName || d.patient?.invName || d.invName || '',
        drugCode:
          d.todayDrug?.invCode || d.patient?.invCode || d.invCode || '',
      };
    }
    return {
      drug: d.patient?.invName || d.invName || d.drugName || '',
      drugCode: d.patient?.invCode || d.invCode || d.drugCode || '',
    };
  }

  async getDrug() {
    try {
      let getData3: any = await this.http.postNodejsTest('getCompiler', {
        hn: this.patient?.todayDrugsHN?.[0]?.hn,
        date: '',
        queue: '',
      });

      const drugs = getData3?.response?.drug;
      this.drugList = Array.isArray(drugs) ? drugs : [];
    } catch {
      this.drugList = [];
    }
  }
}
