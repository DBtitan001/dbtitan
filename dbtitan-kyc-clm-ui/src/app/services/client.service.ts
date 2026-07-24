import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id?: number;
  clientId?: string;
  clientName: string;
  clientType: 'Corporate' | 'Individual';
  riskRating: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'KYC Review' | 'Onboarding';
  onboardedOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'https://dbtitan-backend-406358130353.asia-south1.run.app/api/clients';

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }
}
