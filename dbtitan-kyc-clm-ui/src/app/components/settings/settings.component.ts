import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiVoiceService } from '../../services/ai-voice.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  currentUser = 'Admin User';
  activeTab: 'profile' | 'security' | 'notifications' | 'system' = 'profile';
  saveSuccessMessage: string = '';

  // Popover States
  isProfileMenuOpen = false;
  isNotificationOpen = false;
  isSearchOpen = false;

  // Forms
  profileForm = new FormGroup({
    fullName: new FormControl('Admin User', Validators.required),
    email: new FormControl('admin@kycclm.com', [Validators.required, Validators.email]),
    role: new FormControl('System Administrator'),
    department: new FormControl('Compliance & Operations')
  });

  securityForm = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    twoFactorAuth: new FormControl(true)
  });

  notificationForm = new FormGroup({
    emailAlerts: new FormControl(true),
    highRiskNotifications: new FormControl(true),
    expiryReminders: new FormControl(true),
    weeklySummaryReport: new FormControl(false)
  });

  constructor(
    private router: Router,
    private eRef: ElementRef,
    public voiceService: AiVoiceService
  ) {
    // Reset popover states whenever a route change completes
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
        if (parsed.username) {
          this.currentUser = parsed.username;
          this.profileForm.patchValue({ fullName: parsed.username });
        }
      } catch (e) {}
    }
  }

  // Close menus when clicking outside component bounds
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  closeAllMenus() {
    this.isProfileMenuOpen = false;
    this.isNotificationOpen = false;
    this.isSearchOpen = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isProfileMenuOpen = false;
  }

  setTab(tab: 'profile' | 'security' | 'notifications' | 'system') {
    this.activeTab = tab;
    this.saveSuccessMessage = '';
  }

  saveSettings() {
    this.saveSuccessMessage = 'Settings saved successfully!';
    setTimeout(() => this.saveSuccessMessage = '', 3000);
  }

  logout(event?: Event) {
    if (event) event.stopPropagation();
    this.closeAllMenus();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
