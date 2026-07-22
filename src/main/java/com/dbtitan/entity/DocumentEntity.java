package com.dbtitan.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false, unique = true)
    private String documentId;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "document_type")
    private String documentType; // e.g., 'Legal Document', 'Tax Document'

    @Column(name = "status")
    private String status; // e.g., 'Verified', 'Pending', 'Active'

    @Column(name = "uploaded_on")
    private String uploadedOn;

    @Column(name = "expiry_date")
    private String expiryDate;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}