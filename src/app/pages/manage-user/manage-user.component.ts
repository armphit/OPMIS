import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss'],
})
export class ManageUserComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource: any = null;
  dataUser: any = null;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.getData();
  }

  public getData = async () => {
    this.displayedColumns = [
      'user',
      'name',
      'role',
      'createAt',
      'updateAt',
      'status',
    ];

    let getData: any = await this.http.get('dataUser');

    if (getData.connect) {
      if (getData.response.result.length) {
        this.dataUser = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataUser);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataUser = null;
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
        formData.append('user', data.user);

        // formData.forEach((value, key) => {
        //   console.log(key + '=' + value);
        // });

        let getData: any = await this.http.post('updateUser', formData);

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
