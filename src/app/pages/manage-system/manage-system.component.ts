import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-manage-system',
  templateUrl: './manage-system.component.html',
  styleUrls: ['./manage-system.component.scss'],
})
export class ManageSystemComponent implements OnInit {
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}')
    .role;
  constructor(private http: HttpService) {}

  ngOnInit(): void {
    if (this.dataUser == 'ipd') {
      this.http.navRouter('/ipd/ap-med');
      this.test = false;
    }
  }
  public test = {}; // กำหนด object ของชื่อ css class
  clickCount = 0;

}
