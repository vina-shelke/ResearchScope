package com.researchscope.repository;

import com.researchscope.entity.SourceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SourceRecordRepository extends JpaRepository<SourceRecord, String> {

    List<SourceRecord> findByPaperId(String paperId);

    Optional<SourceRecord> findByProviderNameAndExternalId(String providerName, String externalId);
}
