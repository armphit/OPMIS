import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-floor-stock',
  templateUrl: './floor-stock.component.html',
  styleUrls: ['./floor-stock.component.scss']
})
export class FloorStockComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'PrescriptionNo','hn','PatientName','DrugName','Qty','userName','WardName','LastModify'
  ];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpService, private cdr: ChangeDetectorRef) {
        this.getdata();
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getdata() {
    let res: any = await this.http.get('/floorstock/getDispendlog');

    if (res.connect && res.response.rowCount) {
      this.dataSource.data = res.response.result;
      this.cdr.detectChanges();
    }
  }

  applyFilter(event: any) {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }
}
