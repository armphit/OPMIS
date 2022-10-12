import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { NavModule } from './components/nav/nav.module';

import { ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MaterialModules } from './materialModule';
import { IpdComponent } from './pages/ipd/ipd.component';
import { OpdComponent } from './pages/opd/opd.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingModule } from 'ngx-loading';
import { LoginComponent } from './pages/login/login.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { ManageSystemComponent } from './pages/manage-system/manage-system.component';
import { SearchDrugComponent } from './pages/search-drug/search-drug.component';
import { CheckInComponent } from './pages/check-in/check-in.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { ManageUserComponent } from './pages/manage-user/manage-user.component';

@NgModule({
  declarations: [
    AppComponent,
    IpdComponent,
    OpdComponent,
    LoginComponent,
    NotfoundComponent,
    ManageSystemComponent,
    SearchDrugComponent,
    CheckInComponent,
    ManageUserComponent,
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
    MatTableExporterModule,
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
