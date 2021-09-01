import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OpdRoutingModule } from './opd-routing.module';
import { OpdComponent } from './opd.component';
import { ElMedComponent } from './el-med/el-med.component';
import { MaterialModules } from 'src/app/materialModule';
import { SeMedComponent } from './se-med/se-med.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { PharmacistStatisticsComponent } from './pharmacist-statistics/pharmacist-statistics.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { OtherMedComponent } from './other-med/other-med.component';
import { DrugAppointComponent } from './drug-appoint/drug-appoint.component';

@NgModule({
  declarations: [ElMedComponent, SeMedComponent, PharmacistStatisticsComponent, PatientListComponent, OtherMedComponent, DrugAppointComponent],
  imports: [
    CommonModule,
    OpdRoutingModule,
    MaterialModules,
    MatTableExporterModule,
  ],
  providers: [],
})
export class OpdModule {}
