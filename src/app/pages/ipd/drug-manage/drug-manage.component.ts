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
  dataErrsync: any = null;
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
    this.getSync();
  }

  public getData = async () => {
    this.displayedColumns = [
      'code',
      'Name',
      'spec',
      'firmName',
      'unit',
      'status',
      'drug',
    ];

    let getData: any = await this.http.get('dataDrug');
    let getData2: any = await this.http.get('getDrugipd');

    if (getData.connect) {
      if (getData.response.result.length) {
        this.dataDrug = getData.response.result.map(function (emp: {
          code: any;
        }) {
          return {
            ...emp,
            ...(getData2.response.result.find(
              (item: { code: any }) =>
                item.code.toUpperCase().trim() === emp.code.toUpperCase().trim()
            ) ?? { drug: 'n' }),
          };
        });

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
  async getSync() {
    let getData: any = await this.http.get('getERRSynclastupdate');

    if (getData.connect) {
      this.dataErrsync = getData.response.rowCount;
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  async resetInterface() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let getData: any = await this.http.get('deleteERRSynclastupdate');

        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            this.getSync();
            Swal.fire(
              'Success!',
              'You have successfully reset InterfaceIPD.',
              'success'
            );
          } else {
            Swal.fire('error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }

  async addDrug(val: any) {
    let formData = new FormData();
    formData.append('valcode', val.code);
    let getDrugid: any = await this.http.post('getDrugid', formData);
    let valcode = '';
    if (getDrugid.connect) {
      if (getDrugid.response.rowCount > 0) {
        valcode = getDrugid.response.result[0].drugID;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
    val.id = valcode;
    val.datetime = moment(new Date()).format('YYYYMMDDHHmmss');
    for (var key in val) {
      formData.append(key, val[key]);
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let insertDrugipd: any = await this.http.post(
          'insertDrugipd',
          formData
        );

        if (insertDrugipd.connect) {
          if (insertDrugipd.response.rowCount > 0) {
            this.getData();
            Swal.fire(
              'Success!',
              'You have successfully Insert Drug.',
              'success'
            );
          } else {
            Swal.fire('error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }
    });
  }

  dataZiuzmedical: any = null;
  async getZiuzmedical() {
    let getData: any = await this.http.get('getERRZiuzmedical');

    if (getData.connect) {
      this.dataZiuzmedical = getData.response.rowCount;
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  resetZiuzmedical() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
    }).then(async (result) => {
      if (result.isConfirmed) {
        let getData: any = await this.http.get('updateERRZiuzmedical');
        if (getData.connect) {
          if (getData.response.rowCount > 0) {
            this.getZiuzmedical();
            Swal.fire(
              'Success!',
              'You have successfully reset Ziuzmedical.',
              'success'
            );
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
