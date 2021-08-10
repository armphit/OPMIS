import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OpdRoutingModule } from './opd-routing.module';
import { OpdComponent } from './opd.component';
import { ElMedComponent } from './el-med/el-med.component';
import { MaterialModules } from 'src/app/materialModule';
import { SeMedComponent } from './se-med/se-med.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [ElMedComponent, SeMedComponent],
  imports: [
    CommonModule,
    OpdRoutingModule,
    MaterialModules,
    MatTableExporterModule,
  ],
  providers: [],
})
export class OpdModule {}
