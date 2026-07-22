package com.dbtitan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDto {
    private long totalClients;
    private long onboardingCount;
    private long kycReviewCount;
    private long alertsCount;

    // Lifecycle distribution
    private Map<String, Long> lifecycleOverview;

    // Alerts distribution
    private long highRiskClients;
    private long kycOverdue;
    private long documentExpiry;
}