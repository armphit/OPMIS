import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MianNavComponent } from './mian-nav/mian-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DrugDeviceComponent } from './pages/drug-device/drug-device.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavModule } from './components/nav/nav.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MaterialModules } from './materialModule';
import { AtmsComponent } from './pages/atms/atms.component';
import { IpdComponent } from './pages/ipd/ipd.component';
import { OpdComponent } from './pages/opd/opd.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    MianNavComponent,
    DrugDeviceComponent,
    AtmsComponent,
    IpdComponent,
    OpdComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    HttpClientModule,
    NavModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatGridListModule,
    MaterialModules,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
