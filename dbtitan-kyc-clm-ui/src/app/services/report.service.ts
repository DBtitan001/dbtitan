import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportEntity {
  id?: number;
  reportId: string;
  title: string;
  category: string;
  generatedDate: string;
  generatedBy: string;
  format: string;
  status: string;
  client?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  /**
   * Fetch all report entities directly from PostgreSQL
   */
  getAllReports(): Observable<ReportEntity[]> {
    return this.http.get<ReportEntity[]>(this.apiUrl);
  }

  /**
   * Generate & register a wizard report in database
   */
  createWizardReport(clientId: string, generatedBy: string): Observable<ReportEntity> {
    return this.http.post<ReportEntity>(
      `${this.apiUrl}/generate-wizard?clientId=${clientId}&generatedBy=${encodeURIComponent(generatedBy)}`,
      {}
    );
  }

  /**
   * Stream raw PDF blob from backend by reportId
   */
  downloadReportFile(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${reportId}`, {
      responseType: 'blob'
    });
  }
}
