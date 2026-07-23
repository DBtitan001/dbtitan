package com.dbtitan.controller;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.DocumentEntity;
import com.dbtitan.repository.ClientRepository;
import com.dbtitan.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:4200") // Allows Angular frontend requests
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;

    /**
     * GET /api/documents
     * Fetch all documents from the database
     */
    @GetMapping
    public ResponseEntity<List<DocumentEntity>> getAllDocuments() {
        List<DocumentEntity> documents = documentRepository.findAll();
        return ResponseEntity.ok(documents);
    }

    /**
     * GET /api/documents/{documentId}
     * Fetch a specific document metadata by its unique document ID (e.g., DOC-1001)
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentEntity> getDocumentById(@PathVariable String documentId) {
        return documentRepository.findByDocumentId(documentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/documents/client/{clientId}
     * Fetch all documents associated with a specific client ID (e.g., C0001)
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<DocumentEntity>> getDocumentsByClientId(@PathVariable String clientId) {
        // Querying through the mapped Client relationship
        ClientEntity client = clientRepository.findByClientId(clientId).orElse(null);
        if (client == null) {
            return ResponseEntity.notFound().build();
        }
        List<DocumentEntity> documents = documentRepository.findByClient(client);
        return ResponseEntity.ok(documents);
    }

    /**
     * GET /api/documents/search?clientName=ABC Corporation
     * Fetch all documents for a client by client name (partial or exact match)
     */
    @GetMapping("/search")
    public ResponseEntity<List<DocumentEntity>> getDocumentsByClientName(
            @RequestParam String clientName) {

        List<DocumentEntity> documents = documentRepository
                .findByClient_ClientNameContainingIgnoreCase(clientName.trim());

        return ResponseEntity.ok(documents);
    }

    /**
     * POST /api/documents/upload
     * Upload actual file (PDF, Excel, Word, Text, Images) alongside form metadata.
     * Enforces strict check: Client MUST exist in the database!
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("clientId") String clientId, // Expecting valid Client ID from frontend
            @RequestParam("documentType") String documentType,
            @RequestParam("documentName") String documentName,
            @RequestParam(value = "expiryDate", required = false) String expiryDate
    ) throws IOException {

        // 1. VALIDATE CLIENT EXISTENCE IN POSTGRESQL
        ClientEntity existingClient = clientRepository.findByClientId(clientId)
                .orElse(null);

        if (existingClient == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Client ID '" + clientId + "' does not exist in the database. Upload rejected.");
        }

        // 2. GENERATE DOCUMENT ID & BUILD ENTITY
        long count = documentRepository.count() + 1;
        String generatedDocId = "DOC-" + (1000 + count);

        DocumentEntity docEntity = DocumentEntity.builder()
                .documentId(generatedDocId)
                .client(existingClient) // Set Foreign Key relationship
                .documentName(documentName)
                .documentType(documentType)
                .status("Pending")
                .uploadedOn(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .expiryDate(expiryDate != null && !expiryDate.isEmpty() ? expiryDate : "N/A")
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileData(file.getBytes()) // Stores binary content directly into PostgreSQL
                .createdAt(LocalDateTime.now())
                .build();

        DocumentEntity savedDoc = documentRepository.save(docEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDoc);
    }

    /**
     * GET /api/documents/{documentId}/download
     * Download or view the raw file bytes stored in PostgreSQL
     */
    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String documentId) {
        return documentRepository.findByDocumentId(documentId)
                .map(doc -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                        .contentType(MediaType.parseMediaType(doc.getFileType() != null ? doc.getFileType() : "application/octet-stream"))
                        .body(doc.getFileData()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/documents/{documentId}/status
     * Update verification status of a document (e.g., 'Verified', 'Rejected')
     */
    @PutMapping("/{documentId}/status")
    public ResponseEntity<DocumentEntity> updateDocumentStatus(
            @PathVariable String documentId,
            @RequestParam String status) {

        return documentRepository.findByDocumentId(documentId)
                .map(doc -> {
                    doc.setStatus(status);
                    DocumentEntity updatedDoc = documentRepository.save(doc);
                    return ResponseEntity.ok(updatedDoc);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/documents/{documentId}
     * Delete a document by its document ID
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String documentId) {
        return documentRepository.findByDocumentId(documentId)
                .map(doc -> {
                    documentRepository.delete(doc);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}