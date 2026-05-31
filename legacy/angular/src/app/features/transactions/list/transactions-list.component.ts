import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '@core/services/transaction.service';
import { TransactionFormComponent } from '../form/transaction-form.component';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html', 
  standalone: true,
  imports: [CommonModule, TransactionFormComponent],

})
export class TransactionsListComponent implements OnInit {
  // Khai báo rõ kiểu Transaction[]
  transactions: any[] = [];
  showForm = false;

  constructor(private txService: TransactionService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.txService
      .list()
      .subscribe((data: any[]) => this.transactions = data);
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onCreated() {
    this.showForm = false;
    this.load();
  }
}
