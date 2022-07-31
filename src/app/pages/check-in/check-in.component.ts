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
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
})
export class CheckInComponent implements OnInit {
  displayedColumns: string[] = [];
  campaignOne = new FormGroup({
    picker: new FormControl(new Date()),
  });
  // startDate: any = null;
  dataSource: any = null;
  dataDrug: any = null;
  nameExcel: any = null;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit(): void {
    this.getData();
  }

  public getData = async () => {
    this.displayedColumns = [
      'USERID',
      'Name',
      'DEPTNAME',
      'deviceName',
      'datetime',
    ];

    let connDate = moment(this.campaignOne.value.picker).format('YYYY-MM-DD');

    let formData = new FormData();
    formData.append('date', connDate);

    let getData: any = await this.http.post('doorReport', formData);
    if (getData.connect) {
      if (getData.response.result) {
        this.dataDrug = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.nameExcel = `Check-IN ${connDate}`;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public async startChange(event: any) {
    this.getData();
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue.trim().toLowerCase());
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  doSomething(e: any) {
    // const filterValue = (e.value as HTMLInputElement).value;
    // console.log(e.value.trim().toLowerCase());
    this.dataSource.filter = e.value.trim().toLowerCase();
  }
}
