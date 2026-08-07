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

  constructor(
    private http: HttpService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  async openModal() {
    // Force Angular change detection to update @Input() bindings (drugItem, patient)
    // before we read them. This prevents drugItem from being null on first click
    // when the parent sets selectedDrugItem and immediately calls openModal().

    // Reset form
    this.medErrorType = '';
    this.medErrorDetail = '';
    this.medErrorSeverity = '';
    this.medErrorNote = '';
    console.log(this.patient);
    console.log(this.drugItem);
    this.medWrong = this.drugItem.patient.invName;
    this.medGood =
      this.source == 'AppropriateDosage' || this.source == 'Dosage'
        ? this.drugItem.patient.invName
        : this.medGood;

    // if(this.source = )
    await this.getDataPosition();
    await this.getDrug();
    const modalEl = $('#' + this.modalId);

    // Remove any previous hidden handler to avoid duplicates
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
    modalEl.on('shown.bs.modal', () => {
      $('.modal-backdrop').last().css('z-index', 1055);
      // เรียก detectChanges หลังจาก Bootstrap แสดง modal เสร็จแล้ว
      // เพื่อให้ Angular อัปเดต View หลังจาก Bootstrap ย้าย DOM element
      // this.cdr.detectChanges();
    });

    modalEl.modal('show');
  }

  closeModal() {
    this.gettypeE = [];
    $('#' + this.modalId).modal('hide');
  }

  async onSubmit() {
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
    const payload: any = {
      hn: this.patient?.todayDrugsHN?.[0]?.hn || '',
      toSite: this.patient?.todayDrugsHN?.[0]?.toSite?.trim() || '',
      lastIssTime:
        new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'Asia/Bangkok',
        }).format(new Date(this.patient?.todayDrugsHN?.[0]?.scrnTime)) || '',
      doc: this.patient?.todayDrugsHN?.[0]?.docName?.trim() || '',
      med:
        this.drugItem.patient.invName == this.medWrong
          ? this.drugItem.patient.invCode
          : this.medWrong,
      pe: this.medErrorType,
      user: this.dataUser.user,
      userName: this.dataUser.name,
      medGood:
        this.drugItem.patient.invName == this.medGood
          ? this.drugItem.patient.invCode
          : this.medGood,
      medGoodtext: this.medGoodtext,
      medWrong:
        this.drugItem.patient.invName == this.medWrong
          ? this.drugItem.patient.invCode
          : this.medWrong,
      medWrongtext: this.medWrongtext,
      checkType: this.drugItem.patient.checkType.includes('CPOE')
        ? 'CPOE'
        : 'nonCPOE',
    };

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

    let getData: any = await this.http.post('addPEfix', formData);
    if (getData.connect) {
      if (getData.response.rowCount) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'บันทึกข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
        this.closeModal();
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
    } else {
      // Default: show all types if source doesn't match any filter
      this.gettypeE = this.typeE;
    }
  }
  async getType() {
    let getData: any = await this.http.post('getType');
    if (getData.connect) {
      if (getData.response.result) {
        this.typeE = getData.response.result;
      }
    }
  }
  filter_good(): void {
    const filterValue = this.inputgood.nativeElement.value.toLowerCase();

    this.dataGood = this.drugList.filter((o: any) =>
      o.name.trim().toLowerCase().includes(filterValue),
    );
  }
  filter_wrong(): void {
    const filterValue = this.inputwrong.nativeElement.value.toLowerCase();

    this.dataWrong = this.drugList.filter((o: any) =>
      o.name.trim().toLowerCase().includes(filterValue),
    );
  }
  dataGood: any;
  dataWrong: any;
  drugList: any;
  @ViewChild('inputgood') inputgood!: ElementRef<HTMLInputElement>;
  @ViewChild('inputwrong') inputwrong!: ElementRef<HTMLInputElement>;
  async getDrug() {
    let getData3: any = await this.http.postNodejsTest('getCompiler', {
      hn: this.patient?.todayDrugsHN?.[0]?.hn,
      date: '',
      queue: '',
    });

    if (getData3.response.drug.length) {
      this.drugList = getData3.response.drug;
    } else {
      this.drugList = [];
    }
  }
}
