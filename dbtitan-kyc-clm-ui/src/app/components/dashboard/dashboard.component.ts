import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AiVoiceService } from '../../services/ai-voice.service';
import { DashboardService, DashboardAnalytics } from '../../services/dashboard.service';

interface RecentActivity {
  activity: string;
  type: string;
  status: 'Pending' | 'Completed' | 'In Progress';
  dateTime: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser = 'Admin User';

  // Top Bar Dropdown States
  isSearchOpen = false;
  isNotificationOpen = false;
  isProfileMenuOpen = false;
  topSearchQuery = '';

  // Metrics & Data
  totalClients = '0';
  onboardingCount = '0';
  kycReviewCount = '0';
  alertsCount = '0';

  highRiskClients = 0;
  kycOverdue = 0;
  documentExpiry = 0;

  notifications = [
    { id: 1, title: 'High Risk Alert', message: 'ABC Corporation flagged for review', time: '10 mins ago', unread: true },
    { id: 2, title: 'Document Expiry', message: 'Global Solutions document expiring soon', time: '1 hour ago', unread: true }
  ];

  activities: RecentActivity[] = [
    { activity: 'ABC Corporation', type: 'KYC Review', status: 'Pending', dateTime: '23 May 2026 10:30 AM' },
    { activity: 'John Doe', type: 'Document Upload', status: 'Completed', dateTime: '23 May 2026 09:45 AM' },
    { activity: 'XYZ Pvt Ltd', type: 'Onboarding', status: 'In Progress', dateTime: '23 May 2026 09:15 AM' },
    { activity: 'Global Solutions', type: 'Risk Assessment', status: 'Completed', dateTime: '23 May 2026 08:50 AM' }
  ];

  constructor(
    private router: Router,
    public voiceService: AiVoiceService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getAnalytics().subscribe({
      next: (data: DashboardAnalytics) => {
        this.totalClients = data.totalClients.toLocaleString();
        this.onboardingCount = data.onboardingCount.toLocaleString();
        this.kycReviewCount = data.kycReviewCount.toLocaleString();
        this.alertsCount = data.alertsCount.toLocaleString();

        this.highRiskClients = data.highRiskClients;
        this.kycOverdue = data.kycOverdue;
        this.documentExpiry = data.documentExpiry;
      },
      error: (err) => console.error('Failed to load metrics:', err)
    });
  }

  // Header Handlers
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) this.topSearchQuery = '';
  }

  toggleNotifications() {
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false;
  }

  onGlobalSearch() {
    if (this.topSearchQuery.trim()) {
      this.router.navigate(['/clients'], { queryParams: { q: this.topSearchQuery } });
    }
  }

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.unread = false);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
