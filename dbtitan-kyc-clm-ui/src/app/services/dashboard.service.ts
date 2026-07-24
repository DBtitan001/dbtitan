import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardAnalytics {
  totalClients: number;
  onboardingCount: number;
  kycReviewCount: number;
  alertsCount: number;
  lifecycleOverview: { [key: string]: number };
  highRiskClients: number;
  kycOverdue: number;
  documentExpiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://dbtitan-backend-406358130353.asia-south1.run.app/api/dashboard/analytics';

  constructor(private http: HttpClient) {}

  getAnalytics(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(this.apiUrl);
  }
}
