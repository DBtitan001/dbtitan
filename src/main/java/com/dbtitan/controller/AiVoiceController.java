package com.dbtitan.controller;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.DocumentEntity;
import com.dbtitan.repository.ClientRepository;
import com.dbtitan.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AiVoiceController {

    private final ClientRepository clientRepository;
    private final DocumentRepository documentRepository;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askAi(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        Map<String, String> response = new HashMap<>();

        if (userQuery == null || userQuery.trim().isEmpty()) {
            response.put("summary", "I didn't capture any audio. Please try speaking again.");
            return ResponseEntity.badRequest().body(response);
        }

        String queryLower = userQuery.toLowerCase().trim();

        // 1. Search database for matching client by ID or Name
        Optional<ClientEntity> matchedClient = clientRepository.findAll().stream()
                .filter(client -> queryLower.contains(client.getClientId().toLowerCase()) ||
                        queryLower.contains(client.getClientName().toLowerCase()))
                .findFirst();

        if (matchedClient.isPresent()) {
            ClientEntity client = matchedClient.get();
            List<DocumentEntity> docs = documentRepository.findByClientId(client.getClientId());

            if (docs.isEmpty()) {
                response.put("summary", "Client " + client.getClientName() + " (ID: " + client.getClientId() +
                        ") was found in the database, but currently has no documents uploaded.");
                return ResponseEntity.ok(response);
            }

            // 2. Count statuses dynamically
            long verifiedCount = docs.stream()
                    .filter(d -> "Verified".equalsIgnoreCase(d.getStatus()) || "Active".equalsIgnoreCase(d.getStatus()))
                    .count();
            long pendingCount = docs.stream()
                    .filter(d -> "Pending".equalsIgnoreCase(d.getStatus()))
                    .count();

            // 3. Build voice summary string
            StringBuilder summary = new StringBuilder();
            summary.append("Client ").append(client.getClientName()).append(" has ").append(docs.size()).append(" total document");
            if (docs.size() > 1) summary.append("s");
            summary.append(" in the database. ");

            if (verifiedCount > 0) {
                summary.append(verifiedCount).append(" verified. ");
            }
            if (pendingCount > 0) {
                summary.append(pendingCount).append(" pending review. ");
            }

            response.put("summary", summary.toString());
            return ResponseEntity.ok(response);
        }

        // 4. Fallback if no specific client name or ID was matched
        long totalDocs = documentRepository.count();
        long totalClients = clientRepository.count();

        response.put("summary", "I couldn't find a specific client matching '" + userQuery + "' in the database. " +
                "Overall, there are " + totalDocs + " total documents across " + totalClients + " clients in PostgreSQL.");
        return ResponseEntity.ok(response);
    }
}