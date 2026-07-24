package com.dbtitan.repository;

import com.dbtitan.entity.ClientEntity;
import com.dbtitan.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<ReportEntity, Long> {

    Optional<ReportEntity> findByReportId(String reportId);

    List<ReportEntity> findByClient(ClientEntity client);

    List<ReportEntity> findByClient_ClientId(String clientId);
}