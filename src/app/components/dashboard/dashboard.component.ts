import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface RecentActivity {
  activity: string;
  type: string;
  status: 'Pending' | 'Completed' | 'In Progress';
  dateTime: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser = 'Admin User';

  // Metric Cards
  totalClients = '12,458';
  onboardingCount = '234';
  kycReviewCount = '89';
  alertsCount = '56';

  // Recent Activities Data
  activities: RecentActivity[] = [
    { activity: 'ABC Corporation', type: 'KYC Review', status: 'Pending', dateTime: '23 May 2026 10:30 AM' },
    { activity: 'John Doe', type: 'Document Upload', status: 'Completed', dateTime: '23 May 2026 09:45 AM' },
    { activity: 'XYZ Pvt Ltd', type: 'Onboarding', status: 'In Progress', dateTime: '23 May 2026 09:15 AM' },
    { activity: 'Global Solutions', type: 'Risk Assessment', status: 'Completed', dateTime: '23 May 2026 08:50 AM' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) {
          this.currentUser = parsed.username;
        }
      } catch (e) {
        // Fallback to default user string
      }
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
