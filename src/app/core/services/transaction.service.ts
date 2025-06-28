import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Transaction {
  id?: string;
  amount: number;
  description: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://15.235.185.158:5001/transactions';
  constructor(private http: HttpClient) {}

  list(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  create(tx: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, tx);
  }
}
