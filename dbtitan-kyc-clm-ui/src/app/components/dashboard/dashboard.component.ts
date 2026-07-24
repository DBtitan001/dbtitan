import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
export class DashboardComponent implements OnInit, OnDestroy {
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

  private voiceSubscription?: Subscription;

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
    this.listenToVoiceCommands();
  }

  ngOnDestroy(): void {
    if (this.voiceSubscription) {
      this.voiceSubscription.unsubscribe();
    }
  }

  /**
   * Listens for spoken voice transcripts on the Dashboard
   */
  private listenToVoiceCommands(): void {
    // Set active context to 'dashboard'
    this.voiceService.setContext('dashboard');

    this.voiceSubscription = this.voiceService.recognizedText$.subscribe((transcript: string) => {
      if (!transcript) return;

      console.log('Voice Command Received on Dashboard:', transcript);
      const lowerText = transcript.toLowerCase();

      // Navigation & Dashboard specific action handling
      if (lowerText.includes('show clients') || lowerText.includes('go to clients')) {
        this.router.navigate(['/clients']);
      } else if (lowerText.includes('show reports') || lowerText.includes('open reports')) {
        this.router.navigate(['/reports']);
      } else if (lowerText.includes('show documents') || lowerText.includes('open documents')) {
        this.router.navigate(['/documents']);
      } else if (lowerText.includes('search for') || lowerText.includes('find client')) {
        const query = transcript.replace(/search for|find client|search/gi, '').trim();
        if (query) {
          this.topSearchQuery = query;
          this.onGlobalSearch();
        }
      }
    });
  }

  loadDashboardData(): void {
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
      error: (err: unknown) => console.error('Failed to load metrics:', err)
    });
  }

  // Header Handlers
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) this.topSearchQuery = '';
  }

  toggleNotifications(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false;
  }

  onGlobalSearch(): void {
    if (this.topSearchQuery.trim()) {
      this.router.navigate(['/clients'], { queryParams: { q: this.topSearchQuery } });
    }
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.unread = false);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
