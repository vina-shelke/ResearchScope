-- ResearchScope Relational Schema (MySQL 8.x / 9.x compatible)

CREATE DATABASE IF NOT EXISTS researchscope_db;
USE researchscope_db;

-- 1. Country Entity
CREATE TABLE IF NOT EXISTS countries (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Institution Entity
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(100) PRIMARY KEY,
    openalex_id VARCHAR(150),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10),
    paper_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Author Entity
CREATE TABLE IF NOT EXISTS authors (
    id VARCHAR(100) PRIMARY KEY,
    openalex_id VARCHAR(150),
    name VARCHAR(255) NOT NULL,
    paper_count INT DEFAULT 0,
    citation_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Author-Institution Relationship
CREATE TABLE IF NOT EXISTS author_institutions (
    author_id VARCHAR(100) NOT NULL,
    institution_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (author_id, institution_id),
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Topic Entity
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(150),
    paper_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Paper Entity
CREATE TABLE IF NOT EXISTS papers (
    id VARCHAR(100) PRIMARY KEY,
    doi VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    abstract_text TEXT,
    publication_year INT,
    publication_date VARCHAR(50),
    venue VARCHAR(255),
    citation_count INT DEFAULT 0,
    source VARCHAR(100),
    source_id VARCHAR(255),
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_papers_doi (doi),
    INDEX idx_papers_year (publication_year),
    INDEX idx_papers_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Paper-Author Join Table
CREATE TABLE IF NOT EXISTS paper_authors (
    paper_id VARCHAR(100) NOT NULL,
    author_id VARCHAR(100) NOT NULL,
    author_order INT DEFAULT 0,
    PRIMARY KEY (paper_id, author_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Paper-Institution Join Table
CREATE TABLE IF NOT EXISTS paper_institutions (
    paper_id VARCHAR(100) NOT NULL,
    institution_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (paper_id, institution_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Paper-Topic Join Table
CREATE TABLE IF NOT EXISTS paper_topics (
    paper_id VARCHAR(100) NOT NULL,
    topic_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (paper_id, topic_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Paper-Country Join Table
CREATE TABLE IF NOT EXISTS paper_countries (
    paper_id VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    PRIMARY KEY (paper_id, country_code),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Paper-Citation Relationship (Paper A cites Paper B)
CREATE TABLE IF NOT EXISTS paper_citations (
    citing_paper_id VARCHAR(100) NOT NULL,
    cited_paper_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (citing_paper_id, cited_paper_id),
    FOREIGN KEY (citing_paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (cited_paper_id) REFERENCES papers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Related Papers Relationship
CREATE TABLE IF NOT EXISTS related_papers (
    paper_id VARCHAR(100) NOT NULL,
    related_paper_id VARCHAR(100) NOT NULL,
    similarity_score DOUBLE DEFAULT 0.0,
    PRIMARY KEY (paper_id, related_paper_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (related_paper_id) REFERENCES papers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
