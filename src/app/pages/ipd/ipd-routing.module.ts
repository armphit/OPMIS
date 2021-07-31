import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApMedComponent } from './ap-med/ap-med.component';
import { IpdComponent } from './ipd.component';

const routes: Routes = [
  {
    path: '',
    component: IpdComponent,
    children: [
      {
        path: 'ap-med',
        component: ApMedComponent,
      },
      {
        path: '',
        redirectTo: '/ipd/ap-med',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/ipd',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IpdRoutingModule {}
