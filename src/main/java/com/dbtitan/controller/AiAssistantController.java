package com.dbtitan.controller;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.DocumentEntity;
import com.dbtitan.repository.ClientRepository;
import com.dbtitan.repository.DocumentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
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
        String rawText = request.getPrompt() != null ? request.getPrompt() : request.getQuery();
        String query = rawText != null ? rawText.trim().toLowerCase() : "";
        String context = request.getContext() != null ? request.getContext().trim().toLowerCase() : "";

        System.out.println("AI Assistant Query: '" + query + "' | Context: '" + context + "'");

        List<DocumentEntity> allDocs = documentRepository.findAll();
        List<ClientEntity> allClients = clientRepository.findAll();

        String reply;

        // -------------------------------------------------------------
        // 1. REPORTS SCREEN CONTEXT
        // -------------------------------------------------------------
        if ("reports".equalsIgnoreCase(context) || query.contains("report")) {

            // A. Check if asking about RISK / RISK ASSESSMENT
            if (query.contains("risk") || query.contains("assessment") || query.contains("management")) {
                long highRiskCount = allClients.stream()
                        .filter(c -> "High".equalsIgnoreCase(c.getRiskRating()))
                        .count();
                reply = "Filtering Reports for Risk Assessment. You currently have " + highRiskCount +
                        " high-risk client(s) flagged in the database requiring priority analysis.";

                // B. Check if asking about COMPLIANCE
            } else if (query.contains("compliance")) {
                reply = "Filtering Reports for Compliance. Showing all audit-ready compliance overview reports.";

                // C. Check if asking about AUDIT
            } else if (query.contains("audit")) {
                reply = "Filtering Reports for Audit Trail. Accessing system activity and change history logs.";

                // D. Check if asking about ONBOARDING
            } else if (query.contains("onboarding")) {
                long onboardingClients = allClients.stream()
                        .filter(c -> "Pending".equalsIgnoreCase(c.getStatus()) || "In Progress".equalsIgnoreCase(c.getStatus()))
                        .count();
                reply = "Filtering Reports for Client Onboarding. There are " + onboardingClients +
                        " client(s) currently undergoing onboarding review.";

                // E. Check if query mentions a SPECIFIC CLIENT
            } else {
                Optional<ClientEntity> matchedClient = findClientInQuery(allClients, query);
                if (matchedClient.isPresent()) {
                    ClientEntity client = matchedClient.get();
                    List<DocumentEntity> clientDocs = allDocs.stream()
                            .filter(d -> d.getClient() != null && client.getClientId().equalsIgnoreCase(d.getClient().getClientId()))
                            .collect(Collectors.toList());

                    reply = "Client Report for " + client.getClientName() + " (ID: " + client.getClientId() + "): " +
                            "Risk rating is " + client.getRiskRating() + " with " + clientDocs.size() + " attached document(s).";
                } else {
                    reply = "Report Analytics: Displaying reports repository for " + allClients.size() +
                            " clients and " + allDocs.size() + " registered documents.";
                }
            }

            // -------------------------------------------------------------
            // 2. DOCUMENTS SCREEN CONTEXT
            // -------------------------------------------------------------
        } else if ("documents".equalsIgnoreCase(context) || query.contains("document") || query.contains("file")) {

            Optional<ClientEntity> matchedClient = findClientInQuery(allClients, query);
            if (matchedClient.isPresent()) {
                ClientEntity client = matchedClient.get();
                List<DocumentEntity> clientDocs = allDocs.stream()
                        .filter(d -> d.getClient() != null && client.getClientId().equalsIgnoreCase(d.getClient().getClientId()))
                        .collect(Collectors.toList());

                if (!clientDocs.isEmpty()) {
                    String docNames = clientDocs.stream()
                            .map(DocumentEntity::getDocumentName)
                            .collect(Collectors.joining(", "));
                    reply = "Client " + client.getClientName() + " has " + clientDocs.size() +
                            " document(s) uploaded in repository: " + docNames + ".";
                } else {
                    reply = "Client " + client.getClientName() + " is registered, but has 0 uploaded documents.";
                }
            } else {
                long total = allDocs.size();
                long verified = allDocs.stream().filter(d -> "Verified".equalsIgnoreCase(d.getStatus()) || "Active".equalsIgnoreCase(d.getStatus())).count();
                long pending = allDocs.stream().filter(d -> "Pending".equalsIgnoreCase(d.getStatus())).count();

                reply = "Document Repository: " + total + " total documents stored. " +
                        verified + " verified active and " + pending + " pending review.";
            }

            // -------------------------------------------------------------
            // 3. DEFAULT DASHBOARD / GENERAL SUMMARY
            // -------------------------------------------------------------
        } else {
            Optional<ClientEntity> matchedClient = findClientInQuery(allClients, query);
            if (matchedClient.isPresent()) {
                ClientEntity client = matchedClient.get();
                reply = "Client Summary for " + client.getClientName() + ": Status is " + client.getStatus() +
                        " and Risk Rating is " + client.getRiskRating() + ".";
            } else {
                reply = "System Summary: You currently have " + allClients.size() + " clients and " +
                        allDocs.size() + " documents stored in database.";
            }
        }

        return ResponseEntity.ok(Map.of(
                "response", reply,
                "summary", reply
        ));
    }

    /**
     * Helper to search for client names in query string
     */
    private Optional<ClientEntity> findClientInQuery(List<ClientEntity> clients, String query) {
        return clients.stream().filter(c -> {
            if (c.getClientName() == null) return false;
            String cName = c.getClientName().toLowerCase();
            String cId = c.getClientId() != null ? c.getClientId().toLowerCase() : "";

            if (query.contains(cName) || (!cId.isEmpty() && query.contains(cId))) {
                return true;
            }

            List<String> nameTokens = Arrays.stream(cName.split("\\s+"))
                    .filter(word -> word.length() > 2 && !word.equals("corporation") && !word.equals("pvt") && !word.equals("ltd") && !word.equals("inc"))
                    .collect(Collectors.toList());

            return nameTokens.stream().anyMatch(query::contains);
        }).findFirst();
    }

    @Data
    public static class AiQueryRequest {
        private String query;
        private String prompt;
        private String context;
    }
}