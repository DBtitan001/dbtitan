package com.dbtitan.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false, unique = true)
    private String clientId;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_type")
    private String clientType; // 'Corporate' or 'Individual'

    @Column(name = "risk_rating")
    private String riskRating; // 'High', 'Medium', 'Low'

    @Column(name = "status")
    private String status; // 'Active', 'KYC Review', 'Onboarding'

    @Column(name = "onboarded_on")
    private String onboardedOn;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}