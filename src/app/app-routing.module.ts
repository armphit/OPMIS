import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { MianNavComponent } from './mian-nav/mian-nav.component';
import { DrugDeviceComponent } from './pages/drug-device/drug-device.component';
import { AtmsComponent } from './pages/atms/atms.component';

const routes: Routes = [
  {
    path: '',
    component: NavComponent,
    children: [
      {
        path: 'drug-device',
        component: DrugDeviceComponent,
      },
      {
        path: 'atms',
        component: AtmsComponent,
      },
      {
        path: '',
        redirectTo: 'pages/drug-device',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
