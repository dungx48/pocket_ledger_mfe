import { Routes } from '@angular/router';
import { LoginComponent } from '@shared/login/login.component';
import { TransactionsListComponent } from '@features/transactions/list/transactions-list.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'transactions', component: TransactionsListComponent },
  { path: '**', redirectTo: '' }
];
