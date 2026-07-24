import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiVoiceService } from '../../services/ai-voice.service';
import { DocumentService, DocumentEntity } from '../../services/document.service';
import { ClientService, Client } from '../../services/client.service';

interface DocumentRecord {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  category: 'Legal Document' | 'Tax Document' | 'Address Proof' | 'Financial Document' | 'Identity Proof';
  uploadedOn: string;
  expiryDate: string;
  status: 'Active' | 'Pending' | 'Expired' | 'Verified';
  fileName?: string;
  fileType?: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  currentUser = 'Admin User';
  searchQuery: string = '';
  selectedCategory: string = 'All';
  selectedStatus: string = 'All';

  // Popover and Modal states
  isProfileMenuOpen = false;
  isNotificationOpen = false;
  isUploadModalOpen = false;
  isViewModalOpen = false;
  selectedDoc: DocumentRecord | null = null;

  // File Upload State
  selectedFile: File | null = null;

  documents: DocumentRecord[] = [];
  availableClients: Client[] = []; // Registered clients list for upload selector
  isLoading = false;

  // Form updated to control clientId instead of plain string clientName
  uploadForm = new FormGroup({
    clientId: new FormControl('', Validators.required),
    docType: new FormControl('Legal Document', Validators.required),
    docName: new FormControl('', Validators.required),
    expiryDate: new FormControl('')
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eRef: ElementRef,
    public voiceService: AiVoiceService,
    private documentService: DocumentService,
    private clientService: ClientService
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => this.closeAllMenus());
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) this.currentUser = parsed.username;
      } catch (e) {}
    }

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
    });

    this.loadDocumentsFromBackend();
    this.loadClientsForDropdown();
  }

  // Load registered clients list to populate upload dropdown
  loadClientsForDropdown(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients: Client[]) => {
        this.availableClients = clients;
        if (clients.length > 0) {
          this.uploadForm.patchValue({ clientId: clients[0].clientId });
        }
      },
      error: (err: unknown) => console.error('Failed to fetch clients list for dropdown:', err)
    });
  }

  loadDocumentsFromBackend(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (entities: any[]) => {
        console.log('Raw Data received from Backend:', entities);
        if (Array.isArray(entities)) {
          this.documents = entities.map((e: any) => this.mapEntityToRecord(e));
        }
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to fetch documents from backend:', err);
        this.isLoading = false;
      }
    });
  }

  // Defensive Mapper: Traverses the nested entity.client object or fallback properties
  private mapEntityToRecord(entity: any): DocumentRecord {
    const clientObj = entity.client || {};
    return {
      id: entity.documentId || entity.document_id || (entity.id ? `DOC-${entity.id}` : 'DOC-UNKNOWN'),
      name: entity.documentName || entity.document_name || 'Untitled Document',
      clientId: clientObj.clientId || entity.clientId || entity.client_id || 'N/A',
      clientName: clientObj.clientName || entity.clientName || entity.client_name || 'N/A',
      category: (entity.documentType || entity.document_type || 'Legal Document') as DocumentRecord['category'],
      uploadedOn: entity.uploadedOn || entity.uploaded_on || 'N/A',
      expiryDate: entity.expiryDate || entity.expiry_date || 'N/A',
      status: (entity.status || 'Pending') as DocumentRecord['status'],
      fileName: entity.fileName || entity.file_name,
      fileType: entity.fileType || entity.file_type
    };
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

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  closeAllMenus(): void {
    this.isProfileMenuOpen = false;
    this.isNotificationOpen = false;
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationOpen = false;
  }

  viewDocument(doc: DocumentRecord): void {
    this.selectedDoc = doc;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedDoc = null;
  }

  // Real File Download Handler (fetches binary blob from Spring Boot)
  downloadDocument(): void {
    if (!this.selectedDoc) return;

    this.documentService.downloadFile(this.selectedDoc.id).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        const downloadName = this.selectedDoc?.fileName
          || `${this.selectedDoc?.id}_${this.selectedDoc?.name.replace(/\s+/g, '_')}`;

        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      },
      error: (err: unknown) => console.error('Error downloading document:', err)
    });
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
    this.selectedFile = null;
    this.uploadForm.reset({
      clientId: this.availableClients[0]?.clientId || '',
      docType: 'Legal Document'
    });
  }

  // Handle local File Selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Auto-populate Document Title field if empty
      if (!this.uploadForm.get('docName')?.value) {
        this.uploadForm.patchValue({
          docName: this.selectedFile.name.replace(/\.[^/.]+$/, '')
        });
      }
    }
  }

  // Upload Form Submission (Sends file + valid clientId to Spring Boot)
  onUploadSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      const formVal = this.uploadForm.value;

      this.documentService.uploadDocumentWithFile(
        this.selectedFile,
        formVal.clientId!, // Passes valid registered Client ID
        formVal.docType!,
        formVal.docName!,
        formVal.expiryDate || 'N/A'
      ).subscribe({
        next: (savedEntity: any) => {
          this.documents.unshift(this.mapEntityToRecord(savedEntity));
          this.closeUploadModal();
        },
        error: (err: unknown) => {
          alert('Upload Error: Selected client was not found or is invalid in database.');
          console.error('Error uploading file to backend:', err);
        }
      });
    }
  }


  logout(event?: Event): void {
    if (event) event.stopPropagation();
    this.closeAllMenus();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
