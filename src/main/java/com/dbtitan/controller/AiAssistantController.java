package com.dbtitan.controller;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.DocumentEntity;
import com.dbtitan.repository.ClientRepository;
import com.dbtitan.repository.DocumentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AiAssistantController {

    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askAi(@RequestBody AiQueryRequest request) {
        String query = request.getQuery() != null ? request.getQuery().trim().toLowerCase() : "";
        String reply;

        // Fetch current live data from PostgreSQL
        List<DocumentEntity> allDocs = documentRepository.findAll();
        List<ClientEntity> allClients = clientRepository.findAll();

        // Check if query mentions any known client name in the DB (e.g. Airtel, ABC Corporation, John Doe)
        Optional<ClientEntity> matchedClient = allClients.stream()
                .filter(c -> c.getClientName() != null && query.contains(c.getClientName().toLowerCase()))
                .findFirst();

        // 1. QUERY FOR SPECIFIC CLIENT DETAILS/DOCUMENTS
        if (matchedClient.isPresent()) {
            ClientEntity client = matchedClient.get();
            List<DocumentEntity> clientDocs = allDocs.stream()
                    .filter(d -> d.getClient() != null && client.getClientId().equalsIgnoreCase(d.getClient().getClientId()))
                    .collect(Collectors.toList());

            if (!clientDocs.isEmpty()) {
                String docDetails = clientDocs.stream()
                        .map(d -> d.getDocumentName() + " (" + d.getStatus() + ")")
                        .collect(Collectors.joining(", "));
                reply = "Client " + client.getClientName() + " (ID: " + client.getClientId() + ") has " +
                        clientDocs.size() + " document(s) uploaded: " + docDetails + ".";
            } else {
                reply = "Client " + client.getClientName() + " is registered with status " + client.getStatus() +
                        ", but has no uploaded documents yet.";
            }

            // 2. GENERAL DOCUMENT QUERY
        } else if (query.contains("document") || query.contains("file") || query.contains("passport") || query.contains("proof")) {
            long total = allDocs.size();
            long pending = allDocs.stream().filter(d -> "Pending".equalsIgnoreCase(d.getStatus())).count();
            long verified = allDocs.stream().filter(d -> "Verified".equalsIgnoreCase(d.getStatus()) || "Active".equalsIgnoreCase(d.getStatus())).count();

            reply = "There are currently " + total + " total documents in the database. " +
                    verified + " are verified or active, and " + pending + " are pending review.";

            // 3. GENERAL CLIENT QUERY
        } else if (query.contains("client") || query.contains("company") || query.contains("customer")) {
            long totalClients = allClients.size();
            long highRisk = allClients.stream().filter(c -> "High".equalsIgnoreCase(c.getRiskRating())).count();

            reply = "You currently have " + totalClients + " clients onboarded in the system, with " +
                    highRisk + " rated as high risk.";

            // 4. FALLBACK GENERAL SUMMARY
        } else {
            reply = "I checked the database. You currently have " + allClients.size() + " clients and " +
                    allDocs.size() + " documents stored in the system.";
        }

        return ResponseEntity.ok(Map.of("summary", reply));
    }

    @Data
    public static class AiQueryRequest {
        private String query;
    }
}