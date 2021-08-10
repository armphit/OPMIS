import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpdRoutingModule } from './ipd-routing.module';
import { ApMedComponent } from './ap-med/ap-med.component';
import { MaterialModules } from 'src/app/materialModule';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [ApMedComponent],
  imports: [
    CommonModule,
    IpdRoutingModule,
    MaterialModules,
    MatTableExporterModule,
  ],
  providers: [],
})
export class IpdModule {}
