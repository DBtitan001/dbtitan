import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AiVoiceService } from '../../services/ai-voice.service';

interface OffboardingRecord {
  id: string;
  clientName: string;
  clientType: 'Corporate' | 'Individual';
  reason: 'Contract Terminated' | 'Compliance Non-Compliance' | 'Client Requested' | 'Dormant Account';
  initiatedBy: string;
  initiatedDate: string;
  status: 'Pending Approval' | 'In Progress' | 'Completed';
}

@Component({
  selector: 'app-offboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './offboarding.component.html',
  styleUrls: ['./offboarding.component.scss']
})
export class OffboardingComponent implements OnInit {
  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedStatus: string = 'All';

  isInitiateModalOpen: boolean = false;
  selectedRecord: OffboardingRecord | null = null;

  records: OffboardingRecord[] = [
    { id: 'OFF-001', clientName: 'Omega Holdings', clientType: 'Corporate', reason: 'Contract Terminated', initiatedBy: 'Risk Manager', initiatedDate: '20 Jul 2026', status: 'In Progress' },
    { id: 'OFF-002', clientName: 'Sarah Jenkins', clientType: 'Individual', reason: 'Client Requested', initiatedBy: 'Account Manager', initiatedDate: '18 Jul 2026', status: 'Completed' },
    { id: 'OFF-003', clientName: 'Apex Capital Partners', clientType: 'Corporate', reason: 'Compliance Non-Compliance', initiatedBy: 'Compliance Officer', initiatedDate: '15 Jul 2026', status: 'Pending Approval' },
    { id: 'OFF-004', clientName: 'Delta Systems Inc', clientType: 'Corporate', reason: 'Dormant Account', initiatedBy: 'System Auto-Rule', initiatedDate: '10 Jul 2026', status: 'Completed' }
  ];

  offboardForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    clientType: new FormControl('Corporate', Validators.required),
    reason: new FormControl('Contract Terminated', Validators.required),
    notes: new FormControl('')
  });

  constructor(
    private router: Router,
    public voiceService: AiVoiceService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }
  }

  get filteredRecords(): OffboardingRecord[] {
    return this.records.filter(rec => {
      const matchesSearch = !this.searchQuery ||
        rec.clientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        rec.id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.selectedStatus === 'All' || rec.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  openInitiateModal() {
    this.isInitiateModalOpen = true;
  }

  closeInitiateModal() {
    this.isInitiateModalOpen = false;
    this.offboardForm.reset({ clientType: 'Corporate', reason: 'Contract Terminated' });
  }

  onInitiateSubmit() {
    if (this.offboardForm.valid) {
      const newRecord: OffboardingRecord = {
        id: `OFF-00${this.records.length + 1}`,
        clientName: this.offboardForm.value.clientName!,
        clientType: this.offboardForm.value.clientType as any,
        reason: this.offboardForm.value.reason as any,
        initiatedBy: this.currentUser,
        initiatedDate: '22 Jul 2026',
        status: 'Pending Approval'
      };
      this.records.unshift(newRecord);
      this.closeInitiateModal();
    }
  }

  exportOffboardingData() {
    const header = 'Offboard ID,Client Name,Client Type,Reason,Initiated By,Initiated Date,Status\n';
    const rows = this.filteredRecords.map(r =>
      `"${r.id}","${r.clientName}","${r.clientType}","${r.reason}","${r.initiatedBy}","${r.initiatedDate}","${r.status}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Offboarding_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
