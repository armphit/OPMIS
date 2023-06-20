import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-dispense',
  templateUrl: './report-dispense.component.html',
  styleUrls: ['./report-dispense.component.scss'],
})
export class ReportDispenseComponent implements OnInit {
  displayedColumns: string[] = [];
  campaignOne = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
  });
  dataSource: any = null;
  dataDrug: any = null;
  nameExcel: any = null;

  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;

  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.getData();
  }

  ngOnInit(): void {}

  public getData = async () => {
    this.displayedColumns = [
      'assignDate',
      'assignTime',
      'patientID',
      'location',
      'position',
      'drugCode',
      'drugName',
      'amount',
      'takeUnit',
    ];

    let startDate = moment(this.campaignOne.value.start).format('YYYY-MM-DD');
    let endDate = moment(this.campaignOne.value.end).format('YYYY-MM-DD');

    let formData = new FormData();
    formData.append('date1', startDate);
    formData.append('date2', endDate);

    // let getData: any = await this.http.post('getDispenseDaterange', formData);
    let val = { date1: startDate, date2: endDate };

    let getData: any = await this.http.postNodejs('getDispenseDaterange', val);

    if (getData.connect) {
      if (getData.response[0].length) {
        this.dataDrug = getData.response[0];
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.nameExcel = `รายงานการจ่ายยา ${startDate}_${endDate}`;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public async startChange(event: any) {
    if (event.target.value) {
      this.getData();
    }
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
