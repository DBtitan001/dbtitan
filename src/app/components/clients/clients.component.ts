import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Client {
  id: string;
  name: string;
  type: 'Corporate' | 'Individual';
  riskRating: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'KYC Review' | 'Onboarding';
  onboardedOn: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {
  searchQuery: string = '';

  allClients: Client[] = [
    { id: 'C0001', name: 'ABC Corporation', type: 'Corporate', riskRating: 'High', status: 'Active', onboardedOn: '10 May 2026' },
    { id: 'C0002', name: 'John Doe', type: 'Individual', riskRating: 'Low', status: 'Active', onboardedOn: '12 May 2026' },
    { id: 'C0003', name: 'XYZ Pvt Ltd', type: 'Corporate', riskRating: 'Medium', status: 'Active', onboardedOn: '14 May 2026' },
    { id: 'C0004', name: 'Global Solutions', type: 'Corporate', riskRating: 'High', status: 'KYC Review', onboardedOn: '15 May 2026' },
    { id: 'C0005', name: 'Jane Smith', type: 'Individual', riskRating: 'Low', status: 'Active', onboardedOn: '16 May 2026' },
    { id: 'C0006', name: 'Tech Innovations', type: 'Corporate', riskRating: 'Medium', status: 'Onboarding', onboardedOn: '17 May 2026' },
    { id: 'C0007', name: 'Michael Brown', type: 'Individual', riskRating: 'Low', status: 'Active', onboardedOn: '18 May 2026' },
    { id: 'C0008', name: 'Alpha Ventures', type: 'Corporate', riskRating: 'High', status: 'KYC Review', onboardedOn: '19 May 2026' }
  ];

  // Dynamic filter property
  get filteredClients(): Client[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.allClients;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.allClients.filter(c =>
      c.id.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.type.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query)
    );
  }
}
