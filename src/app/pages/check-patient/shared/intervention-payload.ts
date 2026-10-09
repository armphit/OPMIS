/**
 * ===== Clinical Intervention — canonical payload สำหรับ API `addIntervention` =====
 *
 * ใช้ร่วมกันระหว่าง 2 จุดบันทึก เพื่อให้ข้อมูล "เข้ากันได้" และลงตารางเดียวกัน
 * (tb_clinical_intervention — ดู schema: schema/tb_clinical_intervention.sql)
 *
 *   1) modal-intervention.component.ts -> onSubmit()                (entryChannel = 'nonPE')
 *   2) modal-mederror.component.ts     -> buildInterventionPayload() (entryChannel = 'CPOE')
 *
 * ทั้งคู่ส่ง field ชุดเดียวกันทุก key (ค่าว่าง = flow นั้นไม่ได้ใช้ field นี้)
 * แปลงเป็น FormData ด้วย interventionToFormData() แล้วยิง:
 *   const saved: any = await this.http.post('addIntervention', formData);
 *
 * หมายเหตุ FormData:
 *  - targetDrugs (array) -> JSON string '["A","B"]'
 *  - isNonPE   (boolean) -> '1' / '0'  (ให้ INSERT เข้าคอลัมน์ BIT ได้ตรง ๆ)
 */

export type InterventionEntryChannel = 'nonPE' | 'CPOE';

/** ค่าที่รับจาก component ก่อน normalize — ทุก field ไม่บังคับ (ไม่ส่ง = ค่าว่าง) */
export interface InterventionPayloadInput {
  hn?: string;
  clinic?: string;
  doc?: string;
  drug?: string;
  drugCode?: string;
  weight?: string | number;
  height?: string | number;
  source?: string;
  trigger?: string;
  targetDrugs?: string[];

  group?: string;
  groupLabel?: string;
  channel?: string;
  channelLabel?: string;

  issueTopic?: string;
  issueDetail?: string;

  management?: string;
  managementLabel?: string;
  managementDesc?: string;
  action?: string;

  outcome?: string;
  outcomeLabel?: string;
  confirmReason?: string;

  fix?: string;
  fixDetail?: string;

  isNonPE?: boolean;
  quickRemark?: string;
  note?: string;
  recorder?: string;

  user?: string;
  userName?: string;
  entryChannel?: InterventionEntryChannel;
  createdDT?: string;
  prescription?: string;
}

/** payload สุดท้ายที่ส่งเข้า API — key ตรงกับคอลัมน์ใน tb_clinical_intervention */
export interface InterventionPayload {
  hn: string;
  clinic: string;
  doc: string;
  drug: string;
  drugCode: string;
  weight: string;
  height: string;
  source: string;
  trigger: string;
  targetDrugs: string[];

  group: string;
  groupLabel: string;
  channel: string;
  channelLabel: string;

  issueTopic: string;
  issueDetail: string;

  management: string;
  managementLabel: string;
  managementDesc: string;
  action: string;

  outcome: string;
  outcomeLabel: string;
  confirmReason: string;

  fix: string;
  fixDetail: string;

  isNonPE: boolean;
  quickRemark: string;
  note: string;
  recorder: string;

  user: string;
  userName: string;
  entryChannel: InterventionEntryChannel;
  createdDT: string;
  prescription: string;
}

/** trim + กัน null/undefined (คืนเป็น string เสมอ) */
const txt = (value: string | number | undefined | null): string =>
  value === undefined || value === null ? '' : String(value).trim();

/** สร้าง payload มาตรฐานเดียวให้ทั้ง 2 flow ใช้ร่วมกัน */
export function createInterventionPayload(
  input: InterventionPayloadInput,
): InterventionPayload {
  return {
    hn: txt(input.hn),
    clinic: txt(input.clinic),
    doc: txt(input.doc),
    drug: txt(input.drug),
    drugCode: txt(input.drugCode),
    weight: txt(input.weight),
    height: txt(input.height),
    source: txt(input.source),
    trigger: txt(input.trigger),
    targetDrugs: Array.isArray(input.targetDrugs)
      ? input.targetDrugs.slice()
      : [],

    group: txt(input.group),
    groupLabel: txt(input.groupLabel),
    channel: txt(input.channel),
    channelLabel: txt(input.channelLabel),

    issueTopic: txt(input.issueTopic),
    issueDetail: txt(input.issueDetail),

    management: txt(input.management),
    managementLabel: txt(input.managementLabel),
    managementDesc: txt(input.managementDesc),
    action: txt(input.action),

    outcome: txt(input.outcome),
    outcomeLabel: txt(input.outcomeLabel),
    confirmReason: txt(input.confirmReason),

    fix: txt(input.fix),
    fixDetail: txt(input.fixDetail),

    isNonPE: input.isNonPE === true,
    quickRemark: txt(input.quickRemark),
    note: txt(input.note),
    recorder: txt(input.recorder),

    user: txt(input.user),
    userName: txt(input.userName),
    entryChannel: input.entryChannel === 'CPOE' ? 'CPOE' : 'nonPE',
    createdDT: txt(input.createdDT) || new Date().toISOString(),
    prescription: txt(input.prescription),
  };
}

/** แปลง payload -> FormData แบบเดียวกับ API อื่น ๆ (object -> JSON string) */
export function interventionToFormData(payload: InterventionPayload): FormData {
  const formData = new FormData();
  Object.keys(payload).forEach((key) => {
    const value = (payload as any)[key];
    if (value === null || value === undefined) {
      formData.append(key, '');
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}
