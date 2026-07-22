import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface DocumentItem {
  name: string;
  type: string;
  uploadedOn: string;
  status: 'Verified' | 'Pending' | 'Rejected';
}

interface ReviewHistoryItem {
  date: string;
  reviewer: string;
  action: string;
  comments: string;
}

@Component({
  selector: 'app-kyc-review',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './kyc-review.component.html',
  styleUrls: ['./kyc-review.component.scss']
})
export class KycReviewComponent implements OnInit {
  activeTab: 'documents' | 'risk' | 'pep' | 'history' = 'documents';

  // Client Info
  client = {
    name: 'ABC Corporation',
    id: 'C0001',
    type: 'Corporate',
    riskRating: 'High'
  };

  // Documents Tab Data
  documents: DocumentItem[] = [
    { name: 'Certificate of Incorporation', type: 'Legal Document', uploadedOn: '10 May 2026', status: 'Verified' },
    { name: 'Memorandum & Articles', type: 'Legal Document', uploadedOn: '10 May 2026', status: 'Verified' },
    { name: 'PAN Card', type: 'Tax Document', uploadedOn: '10 May 2026', status: 'Verified' },
    { name: 'Board Resolution', type: 'Legal Document', uploadedOn: '11 May 2026', status: 'Pending' },
    { name: 'Address Proof', type: 'Address Proof', uploadedOn: '11 May 2026', status: 'Pending' }
  ];

  // Risk Assessment Tab Data
  riskScores = {
    geographicRisk: 'High (Offshore Operations)',
    industryRisk: 'Medium (Financial Tech)',
    structureRisk: 'High (Complex Beneficial Ownership)',
    overallScore: 78,
    calculatedRating: 'High Risk'
  };

  // PEP & Sanctions Tab Data
  pepSanctions = {
    pepMatch: false,
    sanctionMatch: false,
    adverseMediaMatch: true,
    details: 'One adverse media record found regarding tax inquiry in 2022. Cleared by compliance.'
  };

  // Review History Tab Data
  reviewHistory: ReviewHistoryItem[] = [
    { date: '10 May 2026 10:30 AM', reviewer: 'Compliance System', action: 'Initial Screening', comments: 'Automated document extraction completed.' },
    { date: '11 May 2026 02:15 PM', reviewer: 'John Analyst', action: 'Document Verification', comments: 'Verified Corp Incorporation and Tax ID.' },
    { date: '15 May 2026 09:00 AM', reviewer: 'Risk Engine', action: 'Risk Score Calculated', comments: 'Overall risk score set to 78 (High).' }
  ];

  // Modals & Forms State
  isViewDocModalOpen = false;
  selectedDoc: DocumentItem | null = null;

  isActionModalOpen = false;
  actionType: 'Approve' | 'Reject' | 'Request Info' = 'Approve';

  actionForm = new FormGroup({
    remarks: new FormControl('', Validators.required),
    infoRequested: new FormControl('')
  });

  actionSuccessMessage = '';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  setTab(tab: 'documents' | 'risk' | 'pep' | 'history') {
    this.activeTab = tab;
  }

  // Document View Handlers
  viewDocument(doc: DocumentItem) {
    this.selectedDoc = doc;
    this.isViewDocModalOpen = true;
  }

  closeViewDocModal() {
    this.isViewDocModalOpen = false;
    this.selectedDoc = null;
  }

  // Review Decision Action Handlers
  openActionModal(type: 'Approve' | 'Reject' | 'Request Info') {
    this.actionType = type;
    this.actionForm.reset();
    this.isActionModalOpen = true;
  }

  closeActionModal() {
    this.isActionModalOpen = false;
  }

  submitDecision() {
    if (this.actionForm.valid) {
      const remarks = this.actionForm.value.remarks!;
      const newHistory: ReviewHistoryItem = {
        date: new Date().toLocaleString(),
        reviewer: 'Admin User',
        action: `Decision: ${this.actionType}`,
        comments: remarks
      };

      this.reviewHistory.unshift(newHistory);
      this.actionSuccessMessage = `Client KYC successfully set to: ${this.actionType}`;
      this.closeActionModal();

      setTimeout(() => {
        this.actionSuccessMessage = '';
      }, 4000);
    }
  }
}
