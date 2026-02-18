import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ ReactiveFormsModule ]
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/transactions']),
      error: () => this.errorMsg = 'Đăng nhập thất bại'
    });
  }
}
