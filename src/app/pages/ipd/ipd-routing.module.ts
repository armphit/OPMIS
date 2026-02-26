import { DrugManageComponent } from './drug-manage/drug-manage.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApMedComponent } from './ap-med/ap-med.component';
import { IpdComponent } from './ipd.component';
import { FloorStockComponent } from './floor-stock/floor-stock.component';

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
        path: 'med-manage',
        component: DrugManageComponent,
      },
        {
        path: 'floor-stock',
        component:FloorStockComponent,
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
