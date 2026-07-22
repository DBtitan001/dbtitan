package com.dbtitan.repository;

import com.dbtitan.entity.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<ClientEntity, Long> {

    // Find a client by exact Client ID (e.g., "C0001")
    Optional<ClientEntity> findByClientId(String clientId);

    // Search client by exact or partial name (case-insensitive)
    Optional<ClientEntity> findByClientNameIgnoreCase(String clientName);
}