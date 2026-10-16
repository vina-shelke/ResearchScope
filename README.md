# ResearchScope — Advanced Research Paper Intelligence & Analytics Platform

ResearchScope is an academic research intelligence and analytics platform designed to collect, deduplicate, analyze, and synthesize scholarly literature from multiple authoritative providers (**OpenAlex**, **Crossref**, and **Semantic Scholar**).

---

## 🔬 System Overview & Architecture

ResearchScope combines a high-performance **Spring Boot 3 (Java 21)** backend with an academic-grade **React** interface and a normalized **MySQL** database.

```
                           ┌───────────────────────────┐
                           │      React Frontend       │
                           │   (Dashboard, Search,     │
                           │    AI Assistant, Library) │
                           └─────────────┬─────────────┘
                                         │ REST API / JSON
                                         ▼
                           ┌───────────────────────────┐
                           │ Spring Boot 3 Application │
                           │  - Multi-Field Filtering  │
                           │  - DOI Normalization      │
                           │  - Grounded RAG Assistant │
                           │  - Ingestion Job Tracker  │
                           └──────┬─────────────┬──────┘
                                  │             │
                    ┌─────────────┘             └─────────────┐
                    ▼                                         ▼
      ┌───────────────────────────┐             ┌───────────────────────────┐
      │   Academic API Adapters   │             │      MySQL Database       │
      │  - OpenAlex               │             │  - Papers, Authors        │
      │  - Crossref               │             │  - Institutions, Topics   │
      │  - Semantic Scholar       │             │  - Citations, Library     │
      └───────────────────────────┘             └───────────────────────────┘
```

---

## ✨ Key Modules & Capabilities

### 1. 🔍 Advanced Scholarly Search & DOI Resolution
- **DOI Normalization Engine**: Automatically cleanses input queries by stripping prefix protocols (`https://doi.org/`, `http://doi.org/`, `doi:`), trimming whitespace, and standardizing casing to guarantee instant resolution.
- **Batched Entity Loading (Zero N+1 Queries)**: Papers, authors, institutions, topics, and country affiliations are batch-loaded via SQL `IN (...)` queries, cutting database roundtrips by over 95%.
- **Multi-Field Filtering & Sorting**: Filter by query, author, institution, publication year, minimum citation count, Open Access availability, and publication type. Sort dynamically by relevance, publication date, citation count, or title.

### 2. 📊 Research Intelligence Dashboard
- **Aggregate vs. Query Metrics**: Real-time 6-metric summary: Total Papers, Total Authors, Total Institutions, Total Countries, Total Citations, and Verified Open Access Papers.
- **Global Country Output Distribution**: Interactive ranking of leading research nations with publication counts.
- **Top Contributing Institutions**: Ranked research centers with country affiliations and publication counts.
- **Interactive Topic Taxonomy**: Click-to-filter topic badges that dynamically populate the Search explorer.
- **Publication & Citation Trends**: Longitudinal analysis over publication years.

### 3. 🌐 Connected Research Exploration
- **Author Intelligence**: Full profile breakdown, ORCID links (`https://orcid.org/{orcid}`), citation sums, and co-authorship graphs.
- **Institutional Mapping**: Research affiliation tracking, ROR identifiers (`https://ror.org/{ror_id}`), and interactive modals displaying all affiliated publications.
- **Topic Analytics**: Direct topic drilldown with year-by-year trends, top authors, and institutional leaders.
- **Citation & Reference Linkages**: Indexed reference chains allowing traversal of prior and cited literature.

### 4. 🛡️ Data Quality & Deduplication Pipeline
- **Dual-Pass Duplicate Detection**:
  1. *Primary*: Normalized DOI matching across all ingestion streams.
  2. *Secondary*: Normalized Title + First Author Surname + Publication Year fuzzy matching.
- **Non-Destructive Metadata Merging**: When matching records arrive from different providers, existing records are enriched rather than overwritten—preserving abstracts, citations, venues, Open Access flags, PDF URLs, and ORCIDs.
- **Idempotency**: Repeated queries never create duplicate papers, authors, or institutional records.

### 5. ✦ AI Research Assistant (Retrieval-Augmented Generation)
- **Academic Grounding**: Answers research inquiries using strictly retrieved database papers as factual evidence.
- **Transparent Citations**: Synthesizes responses with bracketed citations (`[1]`, `[2]`), explicit author years, and clickable citation cards linking directly to the full paper record.
- **Structured Synthesis Output**:
  - *Executive Summary*: High-level domain overview.
  - *Key Findings & Evidence*: Direct synthesis of empirical findings linked to cited papers.
  - *Methodologies & Academic Context*: Approaches and experimental setups observed.
  - *Research Implications & Future Directions*: Critical research gaps and next steps.
- **Fallback Resilience**: Supports Google Gemini or OpenAI API keys; gracefully falls back to an intelligent local synthesis engine when API keys are absent.

### 6. ⚙️ Ingestion Job Tracking & Provider Resilience
- **Asynchronous Job Management**: Trigger background data collection without blocking UI threads (`POST /api/ingestion/jobs?q=...`).
- **Audit Logging**: Real-time tracking of job state (`PROCESSING`, `COMPLETED`, `FAILED`), papers discovered, records inserted, duplicates merged, and processing duration.
- **Resilient Adapters**: Configured with 6-second connect / 12-second read timeouts, polite mailto headers (`User-Agent`), rate-limit backoffs, and optional Semantic Scholar API keys.

### 7. 📚 Personal Research Library & Exports
- **Organized Collections**: Save papers with customizable labels (e.g., *Favorites*, *Literature Review*, *Methodology*).
- **Scholarly Notes**: Maintain personal annotations and research notes per paper.
- **Citation Exports**:
  - Instant **BibTeX** export per paper or across entire collections.
  - Instant **CSV** export containing full bibliographical metadata.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.4.3 | Spring Data JPA, Hibernate ORM, Maven, HikariCP |
| **Frontend** | React 18, Vite | Lucide Icons, Pure CSS Modular Academic Design |
| **Database** | MySQL 8.0+ | UTF-8, InnoDB, relational schema with composite keys |
| **Testing** | JUnit 5, Mockito | Comprehensive unit and integration test coverage |
| **APIs** | REST / OpenAPI | Swagger UI, JSON serialization via Jackson |

---

## 🚀 Getting Started

### Prerequisites
- **Java**: OpenJDK 21 or later
- **Maven**: 3.9+
- **Node.js**: 18+ and npm 9+
- **MySQL**: 8.0 or compatible instance running locally on port `3306`

### Database Setup
1. Create the MySQL database:
   ```sql
   CREATE DATABASE IF NOT EXISTS researchscope_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Configure credentials in `backend/src/main/resources/application.properties` or via environment variables:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/researchscope_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

### Running the Backend
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The Spring Boot backend will start on **`http://localhost:8081`**.

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React development server will start on **`http://localhost:3000`**.

Alternatively, build the production frontend to be served directly from Spring Boot:
```bash
cd frontend
npm run build
cp -r dist/* ../backend/src/main/resources/static/
```

---

## 🧪 Running Automated Tests

Run the full automated test suite covering deduplication, normalization, export formatting, and AI synthesis:
```bash
cd backend
mvn test
```

### Verified Test Cases:
- `DuplicateDetectionServiceTest`:
  - `testDoiNormalization()`: Verifies URL stripping and prefix removal.
  - `testDetectDuplicateByDoi()`: Verifies exact DOI deduplication.
  - `testDetectDuplicateByTitleAuthorYear()`: Verifies fuzzy matching and non-destructive ORCID enrichment.
- `PaperServiceTest`:
  - `testNormalizeDoi()`: Validates DOI formatting.
  - `testGenerateBibtex()`: Verifies valid BibTeX syntax and bib-key generation.
  - `testGenerateCsv()`: Verifies CSV header and data escaping.
- `AiResearchServiceTest`:
  - `testSynthesizeLocalAnswer()`: Validates grounded synthesis structure and citation markers.
  - `testAskQuestionValidation()`: Verifies input validation and boundaries.

---

## 📖 Key REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/papers` | Search & filter papers (with pagination, sort, and DOI normalization) |
| `GET` | `/api/papers/{id}` | Retrieve comprehensive paper record with authors, institutions, topics |
| `GET` | `/api/papers/{id}/export/bibtex` | Export individual paper in BibTeX format |
| `GET` | `/api/papers/export/csv` | Export filtered papers to CSV |
| `GET` | `/api/research-landscape` | Retrieve global or topic-specific metrics, country output & trends |
| `POST` | `/api/ai/ask` | Submit research question to grounded RAG Assistant |
| `GET` | `/api/ai/suggested-prompts` | Retrieve curated research inquiry suggestions |
| `POST` | `/api/ingestion/jobs?q={query}` | Trigger asynchronous ingestion job across external providers |
| `GET` | `/api/ingestion/jobs` | Retrieve audit history of ingestion jobs |
| `GET` | `/api/institutions` | List research institutions with affiliated paper counts & ROR |
| `GET` | `/api/topics/{id}/analytics` | Retrieve detailed topic analytics and trends |
| `POST` | `/api/saved-papers/{paperId}` | Bookmark paper to personal library |
| `GET` | `/api/saved-papers` | Retrieve all saved papers with notes and collections |

---

## 📜 License
Academic and Research Use Only. Built with data provided by OpenAlex, Crossref, and Semantic Scholar.
