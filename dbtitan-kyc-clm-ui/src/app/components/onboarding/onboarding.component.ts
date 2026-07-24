import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiVoiceService } from '../../services/ai-voice.service';

interface OnboardingCase {
  id: string;
  clientName: string;
  clientType: 'Corporate' | 'Individual';
  stage: 'Document Collection' | 'KYC Screening' | 'Risk Rating' | 'Final Approval';
  assignedTo: string;
  startDate: string;
  status: 'In Progress' | 'Completed' | 'Pending Info';
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedStage: string = 'All';

  // Dropdown & Popover States
  isProfileMenuOpen = false;
  isNotificationOpen = false;
  isNewCaseModalOpen = false;

  cases: OnboardingCase[] = [
    { id: 'ONB-2001', clientName: 'XYZ Pvt Ltd', clientType: 'Corporate', stage: 'Document Collection', assignedTo: 'John Analyst', startDate: '20 Jul 2026', status: 'In Progress' },
    { id: 'ONB-2002', clientName: 'Apex Capital', clientType: 'Corporate', stage: 'KYC Screening', assignedTo: 'Compliance Officer', startDate: '18 Jul 2026', status: 'Pending Info' },
    { id: 'ONB-2003', clientName: 'Sarah Jenkins', clientType: 'Individual', stage: 'Final Approval', assignedTo: 'Risk Manager', startDate: '15 Jul 2026', status: 'In Progress' }
  ];

  onboardForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    clientType: new FormControl('Corporate', Validators.required),
    assignedTo: new FormControl('John Analyst', Validators.required)
  });

  constructor(
    private router: Router,
    private eRef: ElementRef,
    public voiceService: AiVoiceService
  ) {
    // Clear popover menus on route changes
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

  get filteredCases(): OnboardingCase[] {
    return this.cases.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.clientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStage = this.selectedStage === 'All' || c.stage === this.selectedStage;

      return matchesSearch && matchesStage;
    });
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

  openNewCaseModal() {
    this.isNewCaseModalOpen = true;
  }

  closeNewCaseModal() {
    this.isNewCaseModalOpen = false;
    this.onboardForm.reset({ clientType: 'Corporate', assignedTo: 'John Analyst' });
  }

  onCaseSubmit() {
    if (this.onboardForm.valid) {
      const newCase: OnboardingCase = {
        id: `ONB-200${this.cases.length + 1}`,
        clientName: this.onboardForm.value.clientName!,
        clientType: this.onboardForm.value.clientType as any,
        stage: 'Document Collection',
        assignedTo: this.onboardForm.value.assignedTo!,
        startDate: '23 Jul 2026',
        status: 'In Progress'
      };
      this.cases.unshift(newCase);
      this.closeNewCaseModal();
    }
  }

  logout(event?: Event) {
    if (event) event.stopPropagation();
    this.closeAllMenus();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
