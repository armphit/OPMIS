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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-drug',
  templateUrl: './search-drug.component.html',
  styleUrls: ['./search-drug.component.scss'],
})
export class SearchDrugComponent implements OnInit {
  public dataDrug: any = null;
  public dataPrepack: any = null;
  public dataSelect: any = null;
  public fileName: any = null;
  public nameExcel: any = null;
  public dataSource: any = null;
  public dataSource2: any = null;
  public displayedColumns: string[] = [
    'orderitemcode',
    'genericname',
    'Strength',
    'dosageunitcode',
    'dosegeform',
    'action',
  ];
  public displayedColumns2: string[] = [
    'drugCode',
    'drugName',
    'deviceCode',
    'positionID',

    'action',
  ];
  public valData!: FormGroup;
  myControl: FormControl = new FormControl();
  filteredOptions!: Observable<any>;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('input') input!: ElementRef;
  constructor(private http: HttpService, private formBuilder: FormBuilder) {
    this.listDrugHomc();
    this.listDrugPrePack();
  }
  submitted = false;
  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 1000);
  }

  options: any = null;
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
    setTimeout(() => {
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value))
      );
    }, 500);
  }

  private _filter(value: string): string[] {
    return this.dataSelect
      .map((x: { orderitemcode: any }) => x.orderitemcode)
      .filter((option: string) =>
        option
          ? option.trim().toLowerCase().includes(value.toLowerCase())
          : null
      );
  }

  public async listDrugHomc() {
    let getData: any = await this.http.serchDrug();
    let getData2: any = await this.http.get('getDrugAll101');
    this.dataSelect = getData2.response.result;
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

  public selectedOption: any = null;
  public funcAction = async (val: any) => {
    const formData = new FormData();
    formData.append(
      'drugCode',
      val.orderitemcode ? val.orderitemcode.trim() : val.drugCode
    );
    let getData: any = await this.http.post('getDrugAllIPD', formData);

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
            let updatePack: any = await this.http.post(
              'updatePack102_mySQL',
              formData
            );

            if (updatePack.connect) {
              Swal.fire('Success', '', 'success');
              let win: any = window;
              win.$('#myModal').modal('hide');
              this.submitted = false;
              this.valData.reset();
            } else {
              console.log('1:' + updatePack);
              Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
            }
          } else {
            console.log('2:' + getDataSoap);
            Swal.fire('Error : DataSoap', '', 'error');
          }
        } else {
          console.log('22:' + getDataSoap);
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      } else {
        Swal.fire('Error:DataSoap', '', 'error');
      }
    } else {
      console.log('3:' + getData);
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

  public async listDrugPrePack() {
    let getData: any = await this.http.get('listDrugPrePack');

    if (getData.connect) {
      if (getData.response.result.length > 0) {
        this.dataPrepack = getData.response.result;
        this.dataSource2 = new MatTableDataSource(this.dataPrepack);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      } else {
        this.dataPrepack = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }
  public applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  public getPosts(val: any) {
    let data = {
      drugCode: val,
    };
    this.funcAction(data);
  }
}
