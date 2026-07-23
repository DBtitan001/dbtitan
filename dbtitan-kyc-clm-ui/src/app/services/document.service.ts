import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentEntity {
  id?: number;
  documentId?: string;
  clientId?: string;
  clientName?: string;
  documentName: string;
  documentType: string;
  status?: string;
  uploadedOn?: string;
  expiryDate?: string;
  fileName?: string;
  fileType?: string;
  createdAt?: string;
  client?: any; // Mapped Client entity reference
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/documents
   * Fetch all documents from the backend
   */
  getAllDocuments(): Observable<DocumentEntity[]> {
    return this.http.get<DocumentEntity[]>(this.apiUrl);
  }

  /**
   * GET /api/documents/search?clientName=...
   * Search documents by client name
   */
  searchByClientName(clientName: string): Observable<DocumentEntity[]> {
    return this.http.get<DocumentEntity[]>(`${this.apiUrl}/search?clientName=${encodeURIComponent(clientName)}`);
  }

  /**
   * POST /api/documents/upload
   * Upload actual file with metadata as multipart/form-data.
   * Sends 'clientId' required by Spring Boot @RequestParam("clientId")
   */
  uploadDocumentWithFile(
    file: File,
    clientId: string,
    documentType: string,
    documentName: string,
    expiryDate: string
  ): Observable<DocumentEntity> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', clientId); // FIXED: Sends clientId instead of clientName
    formData.append('documentType', documentType);
    formData.append('documentName', documentName);
    formData.append('expiryDate', expiryDate || 'N/A');

    return this.http.post<DocumentEntity>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * GET /api/documents/{documentId}/download
   * Download raw binary file data from Spring Boot
   */
  downloadFile(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * PUT /api/documents/{documentId}/status?status=...
   * Update verification status of a document
   */
  updateStatus(documentId: string, status: string): Observable<DocumentEntity> {
    return this.http.put<DocumentEntity>(`${this.apiUrl}/${documentId}/status?status=${encodeURIComponent(status)}`, {});
  }

  /**
   * DELETE /api/documents/{documentId}
   * Delete document by document ID
   */
  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
  }
}
