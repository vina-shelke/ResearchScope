USE researchscope_db;

-- 1. Users table for researcher accounts
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'RESEARCHER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-seed default demo researcher so workspace is immediately usable out of the box
INSERT IGNORE INTO users (id, email, username, password_hash, role)
VALUES ('user_demo', 'researcher@researchscope.edu', 'Dr. Elena Vance', 'sha256_mock_hash', 'RESEARCHER');

-- 2. Research Projects table
CREATE TABLE IF NOT EXISTS research_projects (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-seed an initial default project for the demo researcher
INSERT IGNORE INTO research_projects (id, user_id, title, description)
VALUES ('proj_default', 'user_demo', 'Generative AI & LLM Literature Review', 'Primary literature review on LLMs, educational applications, and adversarial robustness.');

-- 3. Stored procedure to safely add columns to saved_papers
DROP PROCEDURE IF EXISTS upgrade_saved_papers;
DELIMITER $$
CREATE PROCEDURE upgrade_saved_papers()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'researchscope_db' AND TABLE_NAME = 'saved_papers' AND COLUMN_NAME = 'user_id'
    ) THEN
        ALTER TABLE saved_papers ADD COLUMN user_id VARCHAR(100) DEFAULT 'user_demo';
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'researchscope_db' AND TABLE_NAME = 'saved_papers' AND COLUMN_NAME = 'project_id'
    ) THEN
        ALTER TABLE saved_papers ADD COLUMN project_id VARCHAR(100) NULL;
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'researchscope_db' AND TABLE_NAME = 'saved_papers' AND COLUMN_NAME = 'reading_status'
    ) THEN
        ALTER TABLE saved_papers ADD COLUMN reading_status VARCHAR(50) DEFAULT 'UNREAD';
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'researchscope_db' AND TABLE_NAME = 'saved_papers' AND COLUMN_NAME = 'tags'
    ) THEN
        ALTER TABLE saved_papers ADD COLUMN tags VARCHAR(500) NULL;
    END IF;
END$$
DELIMITER ;

CALL upgrade_saved_papers();
DROP PROCEDURE IF EXISTS upgrade_saved_papers;

-- 4. Saved Searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    query_text VARCHAR(500) NOT NULL,
    filters_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_search_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Saved Comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    paper_ids_json TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comp_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Saved Research Gap Analyses table
CREATE TABLE IF NOT EXISTS saved_gap_analyses (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    topic_query VARCHAR(255) NOT NULL,
    gaps_data_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_gap_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
