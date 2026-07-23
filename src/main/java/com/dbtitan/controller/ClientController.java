package com.dbtitan.controller;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;

    /**
     * GET /api/clients
     * Fetch all clients
     */
    @GetMapping
    public ResponseEntity<List<ClientEntity>> getAllClients() {
        return ResponseEntity.ok(clientRepository.findAll());
    }

    /**
     * POST /api/clients
     * Create and save a new client
     */
    @PostMapping
    public ResponseEntity<ClientEntity> createClient(@RequestBody ClientEntity client) {
        long count = clientRepository.count() + 1;

        if (client.getClientId() == null || client.getClientId().isEmpty()) {
            client.setClientId("C" + String.format("%04d", count));
        }

        if (client.getOnboardedOn() == null || client.getOnboardedOn().isEmpty()) {
            client.setOnboardedOn(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }

        if (client.getCreatedAt() == null) {
            client.setCreatedAt(LocalDateTime.now());
        }

        ClientEntity savedClient = clientRepository.save(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
    }
}