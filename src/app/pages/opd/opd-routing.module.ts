import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ElMedComponent } from './el-med/el-med.component';
import { OpdComponent } from './opd.component';
import { SeMedComponent } from './se-med/se-med.component';

const routes: Routes = [
  {
    path: '',
    component: OpdComponent,
    children: [
      {
        path: 'el-med',
        component: ElMedComponent,
      },
      {
        path: 'se-med',
        component: SeMedComponent,
      },
      {
        path: '',
        redirectTo: '/opd/el-med',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/opd',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpdRoutingModule {}
