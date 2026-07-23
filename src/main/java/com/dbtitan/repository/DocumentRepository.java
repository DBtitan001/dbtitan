package com.dbtitan.repository;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    // Find document by unique business ID (e.g. DOC-1001)
    Optional<DocumentEntity> findByDocumentId(String documentId);

    // Find all documents belonging to a Client entity
    List<DocumentEntity> findByClient(ClientEntity client);

    // Find all documents by client's business ID (e.g. C0001)
    List<DocumentEntity> findByClient_ClientId(String clientId);

    // Exact match by client's name through relationship
    List<DocumentEntity> findByClient_ClientName(String clientName);

    // Case-insensitive partial match by client's name (e.g. "ABC" matches "ABC Corporation")
    List<DocumentEntity> findByClient_ClientNameContainingIgnoreCase(String clientName);
}