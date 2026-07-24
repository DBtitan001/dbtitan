package com.dbtitan.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_id", nullable = false, unique = true)
    private String reportId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "category")
    private String category; // Compliance, Risk Assessment, Client Onboarding, Audit

    @Column(name = "generated_date")
    private String generatedDate;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "format")
    private String format; // PDF, Excel, CSV

    @Column(name = "status")
    private String status; // Ready, Generating

    // --- FOREIGN KEY RELATIONSHIP TO CLIENT ---
    // Nullable because system-wide reports might not belong to a specific client
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", referencedColumnName = "client_id", nullable = true)
    private ClientEntity client;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}