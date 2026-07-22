import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AiVoiceService } from '../../services/ai-voice.service';

interface DocumentRecord {
  id: string;
  name: string;
  clientName: string;
  category: 'Legal Document' | 'Tax Document' | 'Address Proof' | 'Financial Document';
  uploadedOn: string;
  expiryDate: string;
  status: 'Active' | 'Pending' | 'Expired';
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedCategory: string = 'All';
  selectedStatus: string = 'All';

  isUploadModalOpen: boolean = false;
  isViewModalOpen: boolean = false;
  selectedDoc: DocumentRecord | null = null;

  documents: DocumentRecord[] = [
    { id: 'DOC001', name: 'Certificate of Incorporation', clientName: 'ABC Corporation', category: 'Legal Document', uploadedOn: '10 May 2026', expiryDate: '10 May 2030', status: 'Active' },
    { id: 'DOC002', name: 'PAN Card', clientName: 'ABC Corporation', category: 'Tax Document', uploadedOn: '10 May 2026', expiryDate: 'N/A', status: 'Active' },
    { id: 'DOC003', name: 'Board Resolution', clientName: 'ABC Corporation', category: 'Legal Document', uploadedOn: '11 May 2026', expiryDate: 'N/A', status: 'Pending' },
    { id: 'DOC004', name: 'Address Proof', clientName: 'John Doe', category: 'Address Proof', uploadedOn: '12 May 2026', expiryDate: '12 May 2027', status: 'Active' },
    { id: 'DOC005', name: 'Financial Statement 2024', clientName: 'XYZ Pvt Ltd', category: 'Financial Document', uploadedOn: '14 May 2026', expiryDate: '31 Dec 2026', status: 'Active' }
  ];

  uploadForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    docType: new FormControl('Legal Document', Validators.required),
    docName: new FormControl('', Validators.required),
    expiryDate: new FormControl('')
  });

  constructor(private router: Router, public voiceService: AiVoiceService) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }
  }

  get filteredDocuments(): DocumentRecord[] {
    return this.documents.filter(doc => {
      const matchesSearch = !this.searchQuery ||
        doc.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doc.clientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = this.selectedCategory === 'All' || doc.category === this.selectedCategory;
      const matchesStatus = this.selectedStatus === 'All' || doc.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  // View Document Handler
  viewDocument(doc: DocumentRecord) {
    this.selectedDoc = doc;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedDoc = null;
  }

  // Download Document Handler
  downloadDocument() {
    if (!this.selectedDoc) return;

    const fileContent = `==================================================
DOCUMENT DETAILS - ${this.selectedDoc.name.toUpperCase()}
==================================================
Document ID : ${this.selectedDoc.id}
Client Name : ${this.selectedDoc.clientName}
Category    : ${this.selectedDoc.category}
Uploaded On : ${this.selectedDoc.uploadedOn}
Expiry Date : ${this.selectedDoc.expiryDate}
Status      : ${this.selectedDoc.status}
==================================================
This is an automated export from KYC CLM System.
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${this.selectedDoc.id}_${this.selectedDoc.name.replace(/\s+/g, '_')}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
    this.uploadForm.reset({ docType: 'Legal Document' });
  }

  onUploadSubmit() {
    if (this.uploadForm.valid) {
      const newDoc: DocumentRecord = {
        id: `DOC00${this.documents.length + 1}`,
        name: this.uploadForm.value.docName!,
        clientName: this.uploadForm.value.clientName!,
        category: this.uploadForm.value.docType as any,
        uploadedOn: '23 May 2026',
        expiryDate: this.uploadForm.value.expiryDate || 'N/A',
        status: 'Pending'
      };
      this.documents.unshift(newDoc);
      this.closeUploadModal();
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
