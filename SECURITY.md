# Security & Environment Configuration Guide

ResearchScope enforces a **Zero-Secrets-in-Source-Control** architecture. Sensitive credentials, database passwords, and third-party API keys are never hardcoded into source files or tracked in Git.

---

## 1. Secrets Management Architecture

All sensitive credentials and external endpoints are externalized using standard 12-factor application principles:

| Secret / Config Key | Environment Variable | Default (Local Dev) | Description |
| :--- | :--- | :--- | :--- |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/researchscope_db...` | MySQL connection string |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | `root` | MySQL user |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | *(empty string)* | MySQL password |
| `ai.assistant.gemini-api-key` | `GEMINI_API_KEY` | *(empty string)* | Google Gemini LLM API key |
| `ai.assistant.openai-api-key` | `OPENAI_API_KEY` | *(empty string)* | OpenAI API key |
| `scholarly.openalex.mailto` | `OPENALEX_MAILTO` | *(empty string)* | Polite pool contact email for OpenAlex |
| `scholarly.semanticscholar.api-key` | `SEMANTIC_SCHOLAR_API_KEY` | *(empty string)* | Semantic Scholar partner API key |
| `server.port` | `PORT` | `8081` | Spring Boot HTTP port |
| `VITE_API_BASE_URL` | `VITE_API_BASE_URL` | `http://localhost:8081/api` | Frontend REST base URL |

---

## 2. Local Development Setup

1. Copy the configuration template:
   ```bash
   cp .env.example .env
   ```
2. Populate `.env` with your actual local credentials:
   ```env
   SPRING_DATASOURCE_PASSWORD=your_actual_password
   GEMINI_API_KEY=your_gemini_key_here
   ```
3. `.gitignore` is pre-configured to ignore all `.env*` files (except `.env.example`), ensuring your secrets are never committed.

---

## 3. GitHub & CI/CD Deployment

When pushing to GitHub or deploying via CI/CD, store credentials in **GitHub Encrypted Secrets**:

1. Navigate to your GitHub repository: **Settings > Secrets and variables > Actions**.
2. Add the following encrypted repository secrets:
   - `SPRING_DATASOURCE_PASSWORD`
   - `SPRING_DATASOURCE_URL`
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
   - `SEMANTIC_SCHOLAR_API_KEY`
3. Reference them securely in your GitHub Actions workflows:
   ```yaml
   env:
     SPRING_DATASOURCE_PASSWORD: ${{ secrets.SPRING_DATASOURCE_PASSWORD }}
     GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
   ```

---

## 4. Container & Production Deployment (Docker / Kubernetes)

### Docker Compose
Mount secrets using environment variables or Docker Secrets:
```yaml
version: '3.8'
services:
  backend:
    image: researchscope-backend:latest
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/researchscope_db?useSSL=false
      - SPRING_DATASOURCE_USERNAME=research_user
      - SPRING_DATASOURCE_PASSWORD_FILE=/run/secrets/db_password
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    secrets:
      - db_password
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Kubernetes Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: researchscope-secrets
type: Opaque
stringData:
  SPRING_DATASOURCE_PASSWORD: "production_password_here"
  GEMINI_API_KEY: "production_gemini_key_here"
```

---

## 5. Property-Level Ciphertext Encryption (Jasypt Option)

If your enterprise deployment requires storing encrypted ciphertext directly within YAML configuration files:

1. Spring Boot supports **Jasypt (`jasypt-spring-boot-starter`)**.
2. Values can be encrypted into ciphertexts formatted as:
   ```yaml
   spring:
     datasource:
       password: ENC(f8b34v6K2Lz1a9...)
   ```
3. The decryption master key is passed at runtime via environment variable or JVM option:
   ```bash
   java -Djasypt.encryptor.password=YourMasterKey -jar researchscope.jar
   ```

---

## 6. Pre-Push Verification Checklist

Before running `git push`:
- [ ] Run `git status` to verify no `.env`, `.pem`, `*.key`, or unignored credentials are staged.
- [ ] Run `git diff --cached` to review changes and ensure no secrets or test passwords appear in code.
- [ ] Verify that `.env.example` contains only placeholder values.
