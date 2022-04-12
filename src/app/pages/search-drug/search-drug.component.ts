import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-drug',
  templateUrl: './search-drug.component.html',
  styleUrls: ['./search-drug.component.scss'],
})
export class SearchDrugComponent implements OnInit {
  public dataDrug: any = null;

  public fileName: any = null;
  public nameExcel: any = null;
  public dataSource: any = null;
  public displayedColumns: string[] = [
    'orderitemcode',
    'genericname',
    'Strength',
    'dosageunitcode',
    'dosegeform',
    'action',
  ];
  public valData!: FormGroup;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('input') input!: ElementRef;
  constructor(private http: HttpService, private formBuilder: FormBuilder) {
    this.test();
  }
  submitted = false;
  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 1000);
  }
  ngOnInit(): void {
    this.valData = this.formBuilder.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      unit: ['', [Validators.required]],
      form: ['', [Validators.required]],
      capacity: ['', [Validators.required]],
      capacity_unit: ['', [Validators.required]],
      pack: ['', [Validators.required]],
      firmname: ['', [Validators.required]],
    });
  }
  public async test() {
    let getData: any = await this.http.serchDrug();

    if (getData.connect) {
      if (getData.response.data.length > 0) {
        this.dataDrug = getData.response.data;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public funcAction = async (val: any) => {
    const formData = new FormData();
    formData.append('drugCode', val.orderitemcode.trim());
    let getData: any = await this.http.post('listDrugAll101', formData);

    this.valData = this.formBuilder.group({
      code: [
        getData.response.result[0]
          ? getData.response.result[0].orderitemcode
          : val.orderitemcode,
        Validators.required,
      ],
      name: [
        getData.response.result[0]
          ? getData.response.result[0].orderitemTHname
          : val.genericname,
        Validators.required,
      ],
      unit: [
        getData.response.result[0]
          ? getData.response.result[0].dosageunitcode
          : val.dosageunitcode,
        Validators.required,
      ],
      form: [
        getData.response.result[0]
          ? getData.response.result[0].orderunitcode
          : val.dosegeform,
        Validators.required,
      ],
      capacity: [
        getData.response.result[0] ? getData.response.result[0].capacity : '',
        Validators.required,
      ],
      capacity_unit: [
        getData.response.result[0]
          ? getData.response.result[0].capacity_unit
          : '',
        Validators.required,
      ],
      pack: [
        getData.response.result[0] ? getData.response.result[0].pack : '',
        Validators.required,
      ],
      firmname: [
        getData.response.result[0] ? getData.response.result[0].firmname : '',
        Validators.required,
      ],
    });
  };

  public submitInput = async () => {
    this.submitted = true;

    if (this.valData.invalid) {
      return;
    }

    let val = new Array();
    val = Object.entries(this.valData.value);
    const formData = new FormData();
    Object.entries(val).forEach(([key, value]) => {
      formData.append(value[0], value[1].trim());
    });
    let getData: any = await this.http.post('list101', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        let drug = {
          code: this.valData.value.code,
          name: this.valData.value.name,
          miniSpec:
            this.valData.value.capacity + this.valData.value.capacity_unit,
          miniUnit: this.valData.value.unit,
          miniDose: this.valData.value.capacity,
          doseunit: this.valData.value.capacity_unit,
          packageSpec:
            this.valData.value.capacity +
            this.valData.value.capacity_unit +
            '*' +
            this.valData.value.pack +
            ' ' +
            this.valData.value.form +
            '/BOX',
          packageUnit: 'BOX',
          packageRatio: this.valData.value.pack,
          class: '',
          doseForm: this.valData.value.form,
          attribute: '',
          property: '',
          refrigerated: 'N',
          controlled: '',
          firmName: this.valData.value.firmname,
          barcode: this.valData.value.code,
          PYCode: this.valData.value.name,
          supervisionCode: '',
          enable: 'Y',
        };
        let drugDict = { drug: drug };

        let getDataSoap: any = await this.http.syncNodejs('soapDIH', drugDict);

        if (getDataSoap.connect) {
          if (getDataSoap.response.status == 'success') {
            Swal.fire('Success', '', 'success');
            let win: any = window;
            win.$('#myModal').modal('hide');
          } else {
            Swal.fire('Error', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('Error', '', 'error');
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };
  get f() {
    return this.valData.controls;
  }

  onReset(): void {
    this.submitted = false;
    this.valData.reset();
  }
}
