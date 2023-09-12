import { Component, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavComponent {
  menuList: any = null;
  public dataUser = JSON.parse(sessionStorage.getItem('userLogin') || '{}');

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  @ViewChild('drawer') public drawer!: MatDrawer;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private http: HttpService
  ) {
    this.menuList = [
      {
        text: 'Customer',
        icon: 'people',
        routerLink: '/customer/manage',
      },
      {
        text: 'Supplier',
        icon: 'supervised_user_circle',
        routerLink: '/supplier/manage',
      },
      {
        text: 'Suit',
        icon: 'inventory_2',
        children: [
          {
            text: 'Category',
            icon: 'category',
            routerLink: '/product/category',
          },
          {
            text: 'Sub Category',
            icon: 'layers',
            routerLink: '/product/sub-category',
          },
          {
            text: 'Product',
            icon: 'all_inbox',
            routerLink: '/product/manage',
          },
        ],
      },
    ];
  }

  panelIpd: boolean = false;
  panelOpd: boolean = false;
  test: boolean = false;

  ngOnInit(): void {
    this.dataUser.role == 'opd'
      ? (this.panelOpd = true)
      : this.dataUser.role == 'ipd'
      ? (this.panelIpd = true)
      : '';
  }

  signOut(): void {
    this.http.alertLog('error', 'Logout Success');
    sessionStorage.removeItem('userLogin');
    this.http.navRouter('/login');
  }

  togglePanel() {
    if (window.innerWidth < 600) {
      this.drawer.toggle();
    }

    this.panelIpd = false;
    this.panelOpd = false;
  }
  ex() {
    this.drawer.toggle();
  }

  togglePanel2() {
    // if (window.innerWidth < 600) {
    //   this.drawer.toggle();
    // }
    this.panelIpd = true;
    this.panelOpd = false;
  }

  togglePanel3() {
    // if (window.innerWidth < 600) {
    //   this.drawer.toggle();
    // }
    this.panelIpd = false;
    this.panelOpd = true;
  }

  checkinnerWidth() {
    if (window.innerWidth < 600) {
      this.drawer.toggle();
    }
  }
  testActive(e: any) {
    console.log(e);
  }
}
