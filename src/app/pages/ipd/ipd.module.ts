import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpdRoutingModule } from './ipd-routing.module';
import { ApMedComponent } from './ap-med/ap-med.component';
import { MaterialModules } from 'src/app/materialModule';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DrugManageComponent } from './drug-manage/drug-manage.component';
import { FloorStockComponent } from './floor-stock/floor-stock.component';
import { PatientManageComponent } from './patient-manage/patient-manage.component';
import { ReportipdTableComponent } from './patient-manage/reportipd-table/reportipd-table.component';

@NgModule({
  declarations: [ApMedComponent, DrugManageComponent, FloorStockComponent, PatientManageComponent, ReportipdTableComponent],
  imports: [
    CommonModule,
    IpdRoutingModule,
    MaterialModules,
    MatTableExporterModule,
  ],
  providers: [],
})
export class IpdModule {}
