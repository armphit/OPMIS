import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { MianNavComponent } from './mian-nav/mian-nav.component';
import { DrugDeviceComponent } from './pages/drug-device/drug-device.component';
import { AtmsComponent } from './pages/sent-drug/sent-drug.component';

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
        path: 'tsd',
        component: AtmsComponent,
      },
      {
        path: '',
        redirectTo: 'pages/drug-device',
        pathMatch: 'full',
      },

      {
        path: 'ipd',
        loadChildren: () =>
          import('./pages/ipd/ipd.module').then((m) => m.IpdModule),
      },
      {
        path: 'opd',
        loadChildren: () =>
          import('./pages/opd/opd.module').then((m) => m.OpdModule),
      },
      // {
      //   path: 'teacher',
      //   canActivate: [TeacherGuard],
      //   loadChildren: () =>
      //     import('./components/teacher/teacher.module').then(
      //       (m) => m.TeacherModule
      //     ),
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
