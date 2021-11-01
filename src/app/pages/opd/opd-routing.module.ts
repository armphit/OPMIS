import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllDrugComponent } from './all-drug/all-drug.component';
import { DrugAppointComponent } from './drug-appoint/drug-appoint.component';
import { ElMedComponent } from './el-med/el-med.component';
import { OpdComponent } from './opd.component';
import { OtherMedComponent } from './other-med/other-med.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PharmacistStatisticsComponent } from './pharmacist-statistics/pharmacist-statistics.component';
import { ReportPharComponent } from './report-phar/report-phar.component';
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
        path: 'pharmacist-statistics',
        component: PharmacistStatisticsComponent,
      },
      {
        path: 'patient-list',
        component: PatientListComponent,
      },
      {
        path: 'other-med',
        component: OtherMedComponent,
      },
      {
        path: 'drug-appoint',
        component: DrugAppointComponent,
      },
      {
        path: 'drug',
        component: AllDrugComponent,
      },

      {
        path: 'report-phar',
        component: ReportPharComponent,
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
