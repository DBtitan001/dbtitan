import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface Client {
  clientId: string;
  clientName: string;
  clientType: 'Corporate' | 'Individual';
  riskRating: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'KYC Review' | 'Onboarding';
  onboardedOn: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  searchQuery: string = '';
  allClients: Client[] = [];
  isLoading: boolean = true;

  private apiUrl = 'https://dbtitan-backend-406358130353.asia-south1.run.app/api/clients';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchClientsFromBackend();
  }

  fetchClientsFromBackend(): void {
    this.isLoading = true;
    this.http.get<Client[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.allClients = data;
        this.isLoading = false;
      },
      error: () => {
        // Fallback to initial seeds if PostgreSQL isn't returning data
        this.allClients = [
          { clientId: 'C0001', clientName: 'ABC Corporation', clientType: 'Corporate', riskRating: 'High', status: 'Active', onboardedOn: '10 May 2026' },
          { clientId: 'C0002', clientName: 'John Doe', clientType: 'Individual', riskRating: 'Low', status: 'Active', onboardedOn: '12 May 2026' },
          { clientId: 'C0003', clientName: 'XYZ Pvt Ltd', clientType: 'Corporate', riskRating: 'Medium', status: 'Active', onboardedOn: '14 May 2026' },
          { clientId: 'C0004', clientName: 'Global Solutions', clientType: 'Corporate', riskRating: 'High', status: 'KYC Review', onboardedOn: '15 May 2026' },
          { clientId: 'C0005', clientName: 'Jane Smith', clientType: 'Individual', riskRating: 'Low', status: 'Active', onboardedOn: '16 May 2026' },
          { clientId: 'C0006', clientName: 'Tech Innovations', clientType: 'Corporate', riskRating: 'Medium', status: 'Onboarding', onboardedOn: '17 May 2026' },
          { clientId: 'C0007', clientName: 'Michael Brown', clientType: 'Individual', riskRating: 'Low', status: 'Active', onboardedOn: '18 May 2026' },
          { clientId: 'C0008', clientName: 'Alpha Ventures', clientType: 'Corporate', riskRating: 'High', status: 'KYC Review', onboardedOn: '19 May 2026' }
        ];
        this.isLoading = false;
      }
    });
  }

  get filteredClients(): Client[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.allClients;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.allClients.filter(c =>
      c.clientId.toLowerCase().includes(query) ||
      c.clientName.toLowerCase().includes(query) ||
      c.clientType.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query)
    );
  }
}
