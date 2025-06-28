import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResp {
  access_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    // FastAPI OAuth2PasswordRequestForm chỉ nhận x-www-form-urlencoded
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);
    
    return this.http
      .post<LoginResp>(
        `${this.apiUrl}/auth/token`,
        body.toString(),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        }
      )
      .pipe(
        tap(res => {
          // lưu token
          localStorage.setItem('token', res.access_token);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
