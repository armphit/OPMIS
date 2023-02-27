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
import { AllDrugComponent } from './all-drug/all-drug.component';
import { TemperatureMonitorComponent } from './temperature-monitor/temperature-monitor.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxImageCompressService } from 'ngx-image-compress';

import { ReportPharComponent } from './report-phar/report-phar.component';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { ReportDispenseComponent } from './report-dispense/report-dispense.component';
// import { CheckMedComponent } from './check-med/check-med.component';
import { DetailMedComponent } from './detail-med/detail-med.component';

@NgModule({
  declarations: [
    ElMedComponent,
    SeMedComponent,
    PharmacistStatisticsComponent,
    PatientListComponent,
    OtherMedComponent,
    DrugAppointComponent,
    AllDrugComponent,
    TemperatureMonitorComponent,

    ReportPharComponent,
    ReportDispenseComponent,
    // CheckMedComponent,
    DetailMedComponent,
  ],
  imports: [
    CommonModule,
    OpdRoutingModule,
    MaterialModules,
    MatTableExporterModule,
    NgApexchartsModule,
    GalleryModule,
    LightboxModule,
  ],
  providers: [NgxImageCompressService],
})
export class OpdModule {}
