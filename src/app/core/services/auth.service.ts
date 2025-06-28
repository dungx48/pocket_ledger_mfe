import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

interface LoginResp { access_token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://15.235.185.158:5001'; // thay bằng URL thực
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<LoginResp>(
      `${this.apiUrl}/auth/token`,
      { username, password }
    ).pipe(
      tap(res => localStorage.setItem('token', res.access_token))
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
