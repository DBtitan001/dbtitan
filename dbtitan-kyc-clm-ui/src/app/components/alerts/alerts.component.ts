import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiVoiceService } from '../../services/ai-voice.service';

interface AlertItem {
  id: string;
  type: string;
  clientName: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  dateRaised: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  currentUser = 'Admin User';
  activeTab: 'All' | 'High Risk' | 'KYC Overdue' | 'Document Expiry' = 'All';

  isProfileMenuOpen = false;
  isNotificationOpen = false;

  alerts: AlertItem[] = [
    { id: 'ALRT001', type: 'High Risk', clientName: 'ABC Corporation', severity: 'High', description: 'Client risk rating is high', dateRaised: '23 May 2026', status: 'Open' },
    { id: 'ALRT002', type: 'KYC Overdue', clientName: 'John Doe', severity: 'Medium', description: 'KYC review overdue', dateRaised: '22 May 2026', status: 'Open' },
    { id: 'ALRT003', type: 'Document Expiry', clientName: 'XYZ Pvt Ltd', severity: 'Medium', description: 'Document will expire in 15 days', dateRaised: '22 May 2026', status: 'Open' },
    { id: 'ALRT004', type: 'High Risk', clientName: 'Global Solutions', severity: 'High', description: 'Adverse media hit found', dateRaised: '21 May 2026', status: 'Open' },
    { id: 'ALRT005', type: 'KYC Overdue', clientName: 'Tech Innovations', severity: 'Medium', description: 'KYC review overdue', dateRaised: '21 May 2026', status: 'In Progress' }
  ];

  constructor(
    private router: Router,
    private eRef: ElementRef,
    public voiceService: AiVoiceService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAllMenus();
    });
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }
  }

  get filteredAlerts(): AlertItem[] {
    if (this.activeTab === 'All') return this.alerts;
    return this.alerts.filter(a => a.type === this.activeTab);
  }

  setTab(tab: 'All' | 'High Risk' | 'KYC Overdue' | 'Document Expiry') {
    this.activeTab = tab;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  closeAllMenus() {
    this.isProfileMenuOpen = false;
    this.isNotificationOpen = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false;
  }

  logout(event?: Event) {
    if (event) event.stopPropagation();
    this.closeAllMenus();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
