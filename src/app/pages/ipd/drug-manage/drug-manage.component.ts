import { Component, OnInit, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-drug-manage',
  templateUrl: './drug-manage.component.html',
  styleUrls: ['./drug-manage.component.scss'],
})
export class DrugManageComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource: any = null;
  dataDrug: any = null;

  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
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
      'code',
      'Name',
      'spec',
      'firmName',
      'unit',
      'status',
    ];

    let getData: any = await this.http.get('dataDrug');

    if (getData.connect) {
      if (getData.response.result.length) {
        this.dataDrug = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public changeActive(data: any) {
    Swal.fire({
      title: 'Change Status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let st = '';
        if (data.status == 'Y') {
          st = 'N';
        } else {
          st = 'Y';
        }

        let formData = new FormData();
        formData.append('active', st);
        formData.append('code', data.code);

        // formData.forEach((value, key) => {
        //   console.log(key + '=' + value);
        // });

        let getData: any = await this.http.post('updatesendMachine', formData);

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            await this.getData();
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Your work has been saved',
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            Swal.fire('error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }
}
