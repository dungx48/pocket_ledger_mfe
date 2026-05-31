/* src\app\features\transactions\transactions.module.ts */

import { NgModule } from '@angular/core';
import { TransactionFormComponent } from './form/transaction-form.component';
import { TransactionsListComponent } from './list/transactions-list.component';

@NgModule({
  imports: [
    TransactionFormComponent,
    TransactionsListComponent,
  ],
  exports: [
    TransactionFormComponent,
    TransactionsListComponent,
  ]
})
export class TransactionsModule { }
