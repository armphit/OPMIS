import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-opd',
  templateUrl: './opd.component.html',
  styleUrls: ['./opd.component.scss'],
})
export class OpdComponent implements OnInit {
  constructor(private http: HttpService) {}

  private unsubscribe$: Subject<void> = new Subject<void>();
  private timer: any;
  private readonly TIMEOUT_DURATION: number = 3600000; // 5 seconds
  private isMouseMoving: boolean = false;
  ngOnInit() {}
  onMouseMove() {
    // if (this.location.path() !== '/login') {
    this.isMouseMoving = true;
    // Reset timer on mouse movement
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // Do something when mouse hasn't moved for 5 seconds

      this.http.alertLog('error', 'Session expired');
      sessionStorage.removeItem('userLogin');
      this.http.navRouter('/login');
    }, this.TIMEOUT_DURATION);
    // }
  }

  onMouseLeave() {
    // if (this.location.path() !== '/login') {
    this.isMouseMoving = false;
    // }
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
