import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { TransactionService } from '@core/services/transaction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  standalone: true,
  imports: [CommonModule, TransactionFormComponent, ReactiveFormsModule],

})
export class TransactionFormComponent implements OnInit {
  @Output() created = new EventEmitter<void>();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private txService: TransactionService
  ) { }

  ngOnInit(): void {
    // Khởi tạo form sau khi fb đã được inject
    this.form = this.fb.group({
      amount: [null, Validators.required],
      description: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.txService.create(this.form.value).subscribe(() => {
      this.created.emit();
      // Reset form, giữ lại giá trị date mặc định của ngày hôm nay
      this.form.reset({
        amount: null,
        description: '',
        date: new Date().toISOString().substring(0, 10)
      });
    });
  }
}
