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
import { AtmsComponent } from './pages/sent-drug/sent-drug.component';
import { IpdComponent } from './pages/ipd/ipd.component';
import { OpdComponent } from './pages/opd/opd.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingModule } from 'ngx-loading';

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
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0.3)',
      fullScreenBackdrop: false,
      backdropBorderRadius: '0px',
      primaryColour: '#3f51b5',
      secondaryColour: '#3f51b5',
      tertiaryColour: '#3f51b5',
    }),
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
