import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ClientService, Client } from '../../services/client.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    HttpClientModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  searchQuery: string = '';
  allClients: Client[] = [];
  isLoading: boolean = true;
  isAddModalOpen: boolean = false;

  // Reactive Form for Add Client Modal
  clientForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    clientType: new FormControl<'Corporate' | 'Individual'>('Corporate', Validators.required),
    riskRating: new FormControl<'High' | 'Medium' | 'Low'>('Low', Validators.required),
    status: new FormControl<'Active' | 'KYC Review' | 'Onboarding'>('Onboarding', Validators.required)
  });

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.fetchClientsFromBackend();
  }

  // Fetch clients list from Spring Boot API
  fetchClientsFromBackend(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (data: any[]) => {
        if (Array.isArray(data)) {
          this.allClients = data.map((item: any) => this.mapEntityToClient(item));
        }
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to fetch clients from backend:', err);
        // Fallback seed data if database connection fails
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

  // Defensive Mapper: Normalizes camelCase / snake_case response fields
  private mapEntityToClient(item: any): Client {
    const rawRisk = item.riskRating || item.risk_rating || 'Low';
    const cleanedRisk = rawRisk.replace(' Risk', '') as Client['riskRating'];

    return {
      clientId: item.clientId || item.client_id || (item.id ? `C000${item.id}` : 'C0000'),
      clientName: item.clientName || item.client_name || 'Unnamed Client',
      clientType: (item.clientType || item.client_type || 'Corporate') as Client['clientType'],
      riskRating: cleanedRisk,
      status: (item.status || 'Onboarding') as Client['status'],
      onboardedOn: item.onboardedOn || item.onboarded_on || 'N/A'
    };
  }

  // Live filter query handler
  get filteredClients(): Client[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.allClients;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.allClients.filter(c =>
      (c.clientId && c.clientId.toLowerCase().includes(query)) ||
      (c.clientName && c.clientName.toLowerCase().includes(query)) ||
      (c.clientType && c.clientType.toLowerCase().includes(query)) ||
      (c.status && c.status.toLowerCase().includes(query))
    );
  }

  // Modal Dialog Handlers
  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.clientForm.reset({
      clientType: 'Corporate',
      riskRating: 'Low',
      status: 'Onboarding'
    });
  }

  // Submit new client to Spring Boot /api/clients
  onAddClientSubmit(): void {
    if (this.clientForm.valid) {
      const formVal = this.clientForm.value;

      // Ensure risk rating string is cleaned before POSTing
      const cleanRiskRating = (formVal.riskRating || 'Low').replace(' Risk', '') as Client['riskRating'];

      const newClient: Partial<Client> = {
        clientName: formVal.clientName!.trim(),
        clientType: formVal.clientType!,
        riskRating: cleanRiskRating,
        status: formVal.status!
      };

      console.log('Posting new client payload:', newClient);

      this.clientService.createClient(newClient).subscribe({
        next: (savedData: any) => {
          const mappedClient = this.mapEntityToClient(savedData);
          this.allClients.unshift(mappedClient); // Instantly display new record at top
          this.closeAddModal();
        },
        error: (err: unknown) => console.error('Error saving client to database:', err)
      });
    }
  }
}
