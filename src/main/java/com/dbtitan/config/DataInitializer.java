package com.dbtitan.config;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.DocumentEntity;
import com.dbtitan.repository.ClientRepository;
import com.dbtitan.repository.DocumentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ClientRepository clientRepository, DocumentRepository documentRepository) {
        return args -> {
            // Seed clients if missing or incomplete
            if (clientRepository.count() < 8) {
                clientRepository.deleteAll(); // Clear to re-seed cleanly

                List<ClientEntity> clients = List.of(
                        ClientEntity.builder().clientId("C0001").clientName("ABC Corporation").clientType("Corporate").riskRating("High").status("Active").build(),
                        ClientEntity.builder().clientId("C0002").clientName("John Doe").clientType("Individual").riskRating("Low").status("Active").build(),
                        ClientEntity.builder().clientId("C0003").clientName("XYZ Pvt Ltd").clientType("Corporate").riskRating("Medium").status("Active").build(),
                        ClientEntity.builder().clientId("C0004").clientName("Global Solutions").clientType("Corporate").riskRating("High").status("KYC Review").build(),
                        ClientEntity.builder().clientId("C0005").clientName("Jane Smith").clientType("Individual").riskRating("Low").status("Active").build(),
                        ClientEntity.builder().clientId("C0006").clientName("Tech Innovations").clientType("Corporate").riskRating("Medium").status("Onboarding").build(),
                        ClientEntity.builder().clientId("C0007").clientName("Michael Brown").clientType("Individual").riskRating("Low").status("Active").build(),
                        ClientEntity.builder().clientId("C0008").clientName("Alpha Ventures").clientType("Corporate").riskRating("High").status("KYC Review").build()
                );

                clientRepository.saveAll(clients);
                System.out.println("✅ Successfully seeded 8 clients into PostgreSQL!");
            }
        };
    }
}