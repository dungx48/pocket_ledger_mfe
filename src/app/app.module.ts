import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from '@shared/login/login.component';
import { TransactionsListComponent } from '@features/transactions/list/transactions-list.component';
import { TransactionFormComponent } from '@features/transactions/form/transaction-form.component';

import { AuthInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthGuard } from '@core/guards/auth.guard';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,

    // Import các standalone component
    AppComponent,
    LoginComponent,
    TransactionsListComponent,
    TransactionFormComponent
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
