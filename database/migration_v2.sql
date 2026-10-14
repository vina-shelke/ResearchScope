-- Incremental Database Migration v2 for ResearchScope
-- Safe and non-destructive: preserves existing tables and records

USE researchscope_db;

-- 1. Extend papers table with rich scholarly metadata
ALTER TABLE papers 
    ADD COLUMN IF NOT EXISTS is_open_access BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS paper_type VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS publisher VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS is_retracted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Extend authors table with identifiers
ALTER TABLE authors 
    ADD COLUMN IF NOT EXISTS orcid VARCHAR(50) NULL;

-- 3. Extend institutions table with identifiers & type
ALTER TABLE institutions 
    ADD COLUMN IF NOT EXISTS ror_id VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS institution_type VARCHAR(100) NULL;

-- 4. Create saved_papers table for bookmarking & personal collections
CREATE TABLE IF NOT EXISTS saved_papers (
    id VARCHAR(100) PRIMARY KEY,
    paper_id VARCHAR(100) NOT NULL,
    collection_name VARCHAR(150) DEFAULT 'Favorites',
    notes TEXT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_saved_paper (paper_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create source_records table for provider-specific tracking
CREATE TABLE IF NOT EXISTS source_records (
    id VARCHAR(100) PRIMARY KEY,
    paper_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    url VARCHAR(500) NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    INDEX idx_source_paper (paper_id),
    INDEX idx_source_external (external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create ingestion_jobs table for logging background ingestion history
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id VARCHAR(100) PRIMARY KEY,
    query_term VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    papers_found INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create paper_references table for explicit citation/reference linkages
CREATE TABLE IF NOT EXISTS paper_references (
    paper_id VARCHAR(100) NOT NULL,
    referenced_paper_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (paper_id, referenced_paper_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (referenced_paper_id) REFERENCES papers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
