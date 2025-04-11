import { Component } from '@angular/core';
import {
  MatDateFormats,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { HttpService } from './services/http.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'opmis2';
  private unsubscribe$: Subject<void> = new Subject<void>();
  private timer: any;
  private readonly TIMEOUT_DURATION: number = 900000; // 5 seconds
  private isMouseMoving: boolean = false;
  constructor(public http: HttpService, private location: Location) {}
  ngOnInit() {}
  onMouseMove() {
    if (this.location.path() !== '/login') {
      this.isMouseMoving = true;
      // Reset timer on mouse movement
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        // Do something when mouse hasn't moved for 5 seconds

        this.http.alertLog('error', 'Session expired');
        sessionStorage.removeItem('userLogin');
        this.http.navRouter('/login');
      }, this.TIMEOUT_DURATION);
    }
  }

  onMouseLeave() {
    if (this.location.path() !== '/login') {
      this.isMouseMoving = false;
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
