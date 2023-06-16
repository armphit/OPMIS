import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import _ from 'lodash';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-other-med',
  templateUrl: './other-med.component.html',
  styleUrls: ['./other-med.component.scss'],
})
export class OtherMedComponent implements OnInit {
  public dataDrug: any = null;

  public displayedColumns: string[] = [];

  public dataSource: any = null;

  public dataTable: any = null;
  public campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });

  public location: any = [
    // {
    //   id: 'JV',
    //   name: 'เครื่องนับยาเม็ด',
    // },
    // {
    //   id: 'LCA',
    //   name: 'แพ็คยาเม็ด',
    // },
    // {
    //   id: 'Manual',
    //   name: 'ตู้จัดมือ',
    // },
    // {
    //   id: 'CDMed',
    //   name: 'ตู้ยาควบคุม',
    // },
    // {
    //   id: 'INJ',
    //   name: 'ตู้ยาฉีด',
    // },
    // {
    //   id: 'Ref',
    //   name: 'ตู้เย็น',
    // },
    // {
    //   id: 'Nsemed',
    //   name: 'ยาเศษ',
    // },
    // {
    //   id: 'ตู้ฉร',
    //   name: 'ตู้ฉร',
    // },
    // {
    //   id: 'EL11',
    //   name: 'EL11M',
    // },
    // {
    //   id: 'EL14',
    //   name: 'EL14M',
    // },
    // {
    //   id: 'EL15',
    //   name: 'EL15M',
    // },
  ];

  deviceFilter = new FormControl('');
  codeFilter = new FormControl('');
  filterValues = {
    device: '',
    drugCode: '',
    // check: '',
  };
  public getHidden: any = 0;
  public nameExcel: any = 'เครื่องนับยาเม็ด (JV)';
  public nameExcel2: any = null;
  public startDate: any = null;
  public endDate: any = null;

  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;

  // @ViewChild('MatSort2') sort2!: MatSort;
  // @ViewChild('MatSort3') sort3!: MatSort;
  // @ViewChild('MatSort4') sort4!: MatSort;
  // @ViewChild('MatSort5') sort5!: MatSort;
  // @ViewChild('MatSort6') sort6!: MatSort;
  // @ViewChild('MatSort7') sort7!: MatSort;
  // @ViewChild('MatSort8') sort8!: MatSort;
  // @ViewChild('MatSort9') sort9!: MatSort;
  // @ViewChild('MatSort10') sort10!: MatSort;

  // @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  // @ViewChild('MatPaginator3') paginator3!: MatPaginator;
  // @ViewChild('MatPaginator4') paginator4!: MatPaginator;
  // @ViewChild('MatPaginator5') paginator5!: MatPaginator;
  // @ViewChild('MatPaginator6') paginator6!: MatPaginator;
  // @ViewChild('MatPaginator7') paginator7!: MatPaginator;
  // @ViewChild('MatPaginator8') paginator8!: MatPaginator;
  // @ViewChild('MatPaginator9') paginator9!: MatPaginator;
  // @ViewChild('MatPaginator10') paginator10!: MatPaginator;
  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('th-TH');

    const momentDate = new Date();
    const endDate = moment(momentDate).format('YYYY-MM-DD');
    const startDate = moment(momentDate).format('YYYY-MM-DD');

    this.startDate = startDate;
    this.endDate = endDate;
    this.getOtherDrug();
    // this.getTest();
  }

  ngOnInit(): void {
    this.deviceFilter.valueChanges.subscribe((device) => {
      this.filterValues.device = device;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.codeFilter.valueChanges.subscribe((drugCode) => {
      this.filterValues.drugCode = drugCode;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
  }

  public startChange(event: any) {
    const momentDate = new Date(event.value);
    this.startDate = moment(momentDate).format('YYYY-MM-DD');
  }

  public endChange(event: any) {
    if (event.value) {
      const momentDate = new Date(event.value);

      this.endDate = moment(momentDate).format('YYYY-MM-DD');
      this.nameExcel2 = `${this.loname} ${this.startDate}_${this.endDate}`;
      this.getOtherDrug();
    }
  }

  async getOtherDrug() {
    this.displayedColumns = [
      'drugCode',
      'drugName',

      'device',
      'position',
      'freq',
      'amount',
      'unit',
    ];

    let formData = new FormData();
    formData.append('date1', this.startDate);
    formData.append('date2', this.endDate);
    let getData: any = await this.http.post('listOtherDrug', formData);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.getHidden = 1;
        this.dataDrug = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.createFilter();
        this.location = this.dataDrug
          .map((a: any) => a.device)
          .filter(
            (arr: any, index: any, self: any) =>
              index === self.findIndex((t: any) => t === arr)
          )
          .sort();
      } else {
        this.getHidden = 0;
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    this.dataDrug = null;

    this.nameExcel2 = `${this.loname} ${this.startDate}_${this.endDate}`;
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      return (
        data.device.indexOf(searchTerms.device) !== -1 &&
        data.drugCode
          .toLowerCase()
          .indexOf(searchTerms.drugCode.toLowerCase()) !== -1
      );
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    };
    return filterFunction;
  }
  loname = 'All';
  // drug_r = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'];
  // drug_m = ['M1', 'M2', 'M21', 'M22', 'M3', 'M41', 'M42'];
  loName(e: any) {
    this.loname = e.source.triggerValue;
    this.nameExcel2 = `${this.loname} ${this.startDate}_${this.endDate}`;
  }
}
