import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AiVoiceService } from '../../services/ai-voice.service';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: 'Client Management' | 'KYC Review' | 'Document Repository' | 'User Access' | 'System';
  ipAddress: string;
  dateTime: string;
  status: 'Success' | 'Failed' | 'Warning';
  details: string;
}

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss']
})
export class AuditTrailComponent implements OnInit {
  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedModule: string = 'All';
  selectedStatus: string = 'All';

  isDetailModalOpen: boolean = false;
  selectedLog: AuditLog | null = null;

  auditLogs: AuditLog[] = [
    { id: 'LOG-1008', user: 'Admin User', action: 'Approved KYC Assessment', module: 'KYC Review', ipAddress: '192.168.1.45', dateTime: '22 Jul 2026 11:30 AM', status: 'Success', details: 'KYC status for ABC Corporation (C0001) updated from Pending to Active.' },
    { id: 'LOG-1007', user: 'Compliance Officer', action: 'Uploaded Document', module: 'Document Repository', ipAddress: '192.168.1.52', dateTime: '22 Jul 2026 10:15 AM', status: 'Success', details: 'Uploaded Certificate of Incorporation (DOC001) for ABC Corporation.' },
    { id: 'LOG-1006', user: 'John Doe (Client)', action: 'Failed Login Attempt', module: 'User Access', ipAddress: '103.22.41.12', dateTime: '22 Jul 2026 09:40 AM', status: 'Failed', details: 'Invalid credentials entered 3 times consecutively.' },
    { id: 'LOG-1005', user: 'Risk Manager', action: 'Modified Risk Rating', module: 'Client Management', ipAddress: '192.168.1.88', dateTime: '21 Jul 2026 04:20 PM', status: 'Warning', details: 'Risk score adjusted from Medium to High for Global Solutions (C0004).' },
    { id: 'LOG-1004', user: 'System Worker', action: 'Automated Expiry Scan', module: 'System', ipAddress: '127.0.0.1', dateTime: '21 Jul 2026 00:00 AM', status: 'Success', details: 'Scanned 1,200 documents. Flagged 15 document expiry alerts.' }
  ];

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

  get filteredLogs(): AuditLog[] {
    return this.auditLogs.filter(log => {
      const matchesSearch = !this.searchQuery ||
        log.user.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesModule = this.selectedModule === 'All' || log.module === this.selectedModule;
      const matchesStatus = this.selectedStatus === 'All' || log.status === this.selectedStatus;

      return matchesSearch && matchesModule && matchesStatus;
    });
  }

  viewLogDetails(log: AuditLog) {
    this.selectedLog = log;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedLog = null;
  }

  exportLogs() {
    const header = 'Log ID,User,Action,Module,IP Address,Date & Time,Status\n';
    const rows = this.filteredLogs.map(l =>
      `"${l.id}","${l.user}","${l.action}","${l.module}","${l.ipAddress}","${l.dateTime}","${l.status}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Audit_Trail_Export_${new Date().toISOString().slice(0, 10)}.csv`;

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
