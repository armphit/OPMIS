import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { AuthGuard } from './guard/auth.guard';
import { IpdGuard } from './guard/ipd.guard';
import { OpdGuard } from './guard/opd.guard';
import { MianNavComponent } from './mian-nav/mian-nav.component';
import { DrugDeviceComponent } from './pages/drug-device/drug-device.component';
import { LoginComponent } from './pages/login/login.component';
import { ManageSystemComponent } from './pages/manage-system/manage-system.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';

const routes: Routes = [
  {
    path: '',
    component: NavComponent,
    canActivate: [AuthGuard],
    children: [
      // {
      //   path: 'drug-device',
      //   component: DrugDeviceComponent,
      // },
      {
        path: 'manage-system',
        component: ManageSystemComponent,
      },
      {
        path: '',
        redirectTo: 'manage-system',
        pathMatch: 'full',
      },

      {
        path: 'ipd',
        canActivate: [IpdGuard],
        loadChildren: () =>
          import('./pages/ipd/ipd.module').then((m) => m.IpdModule),
      },
      {
        path: 'opd',
        canActivate: [OpdGuard],
        loadChildren: () =>
          import('./pages/opd/opd.module').then((m) => m.OpdModule),
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
