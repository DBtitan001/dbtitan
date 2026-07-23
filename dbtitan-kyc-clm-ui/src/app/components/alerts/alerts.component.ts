import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent {
  filter = 'All';

  alerts = [
    { id: 'ALRT001', type: 'High Risk', client: 'ABC Corporation', severity: 'High', desc: 'Client risk rating is high', date: '23 May 2026', status: 'Open' },
    { id: 'ALRT002', type: 'KYC Overdue', client: 'John Doe', severity: 'Medium', desc: 'KYC review overdue', date: '22 May 2026', status: 'Open' },
    { id: 'ALRT003', type: 'Document Expiry', client: 'XYZ Pvt Ltd', severity: 'Medium', desc: 'Document will expire in 15 days', date: '22 May 2026', status: 'Open' },
    { id: 'ALRT004', type: 'High Risk', client: 'Global Solutions', severity: 'High', desc: 'Adverse media hit found', date: '21 May 2026', status: 'Open' },
    { id: 'ALRT005', type: 'KYC Overdue', client: 'Tech Innovations', severity: 'Medium', desc: 'KYC review overdue', date: '21 May 2026', status: 'In Progress' }
  ];
}
