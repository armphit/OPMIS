import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from '../services/http.service';

@Injectable({
  providedIn: 'root',
})
export class OpdGuard implements CanActivate {
  private notfoundPath: string = '/notfound';
  constructor(public service: HttpService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (
      JSON.parse(sessionStorage.getItem('userLogin') || '{}').role == 'opd' ||
      JSON.parse(sessionStorage.getItem('userLogin') || '{}').role == 'admin' ||
      JSON.parse(sessionStorage.getItem('userLogin') || '{}').role == 'officer'
    ) {
      return true;
    } else {
      this.service.navRouter(this.notfoundPath);
      return false;
    }
  }
}
