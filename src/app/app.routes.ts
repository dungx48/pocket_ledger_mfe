import { Routes } from '@angular/router';
import { TransactionsComponent } from './features/transactions/transactions.component';

export const routes: Routes = [
  { path: 'transactions', component: TransactionsComponent },
  { path: '', redirectTo: '/transactions', pathMatch: 'full' },
  { path: '**', redirectTo: '/transactions' }
];
