import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-kyc-review',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './kyc-review.component.html',
  styleUrls: ['./kyc-review.component.scss']
})
export class KycReviewComponent {
  activeTab = 'Documents';

  documents = [
    { name: 'Certificate of Incorporation', type: 'Legal Document', uploadedOn: '10 May 2026', status: 'Verified' },
    { name: 'Memorandum & Articles', type: 'Legal Document', uploadedOn: '10 May 2026', status: 'Verified' },
    { name: 'PAN Card', type: 'Tax Document', uploadedOn: '10 May 2026', status: 'Verified' },
    { name: 'Board Resolution', type: 'Legal Document', uploadedOn: '11 May 2026', status: 'Pending' },
    { name: 'Address Proof', type: 'Address Proof', uploadedOn: '11 May 2026', status: 'Pending' }
  ];
}
