import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpdRoutingModule } from './ipd-routing.module';
import { ApMedComponent } from './ap-med/ap-med.component';
import { MaterialModules } from 'src/app/materialModule';
import { MatTableExporterModule } from 'mat-table-exporter';

@NgModule({
  declarations: [ApMedComponent],
  imports: [
    CommonModule,
    IpdRoutingModule,
    MaterialModules,
    MatTableExporterModule,
  ],
})
export class IpdModule {}
