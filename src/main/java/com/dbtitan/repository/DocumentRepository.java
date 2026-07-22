package com.dbtitan.repository;

import com.dbtitan.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    // Fetch all documents belonging to a specific Client ID
    List<DocumentEntity> findByClientId(String clientId);

    // Find a document by its unique Document ID (e.g., "DOC001")
    Optional<DocumentEntity> findByDocumentId(String documentId);

    // Count active or verified documents for a given client
    long countByClientIdAndStatus(String clientId, String status);
}