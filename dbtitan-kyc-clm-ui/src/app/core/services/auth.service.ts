import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://dbtitan-backend-406358130353.asia-south1.run.app/api/auth'; // Replace with your API URL
  private tokenKey = 'auth_token';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (this.isBrowser && response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  isAuthenticated(): boolean {
    if (this.isBrowser) {
      const token = localStorage.getItem(this.tokenKey);
      return !!token;
    }
    return false;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
  }
}
