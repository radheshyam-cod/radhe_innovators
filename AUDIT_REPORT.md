# GeneDose.ai – Full Technical and Clinical Audit Report

**Date:** 2026-02-19  
**Scope:** Verification of implementation (no assumptions).  
**Standard:** Strict; missing, incomplete, hardcoded, mocked, or incorrectly delegated logic is marked as failed.

---

## 1. VCF PARSING ENGINE

**STATUS: ✓ Implemented correctly (with noted gaps)**

**Evidence:**

| Requirement | Implementation | File:Function |
|-------------|----------------|---------------|
| Accepts VCF v4.2 | `_FILEFORMAT_RE` matches `##fileformat=VCFv4.1` or `VCFv4.2`; non-matching header raises `VCFValidationError` | `backend/services/vcf_processor.py`:`_strict_validate_header` |
| 5MB limit | Enforced in `_save_uploaded_bytes` via `settings.max_file_size_mb` and in `main.py` (5*1024*1024) | `vcf_processor.py`:`_save_uploaded_bytes`; `main.py` |
| Validates header (##fileformat=VCFv4.x) | Explicit check; rejects if missing or not v4.1/v4.2 | `vcf_processor.py`:`_strict_validate_header` (lines 196–203) |
| Genome build (GRCh38 required) | `##reference=` parsed; GRCh38/hg38 accepted; GRCh37 triggers liftover; unknown build raises | `vcf_processor.py`:`_strict_validate_header` (204–216) |
| Missing INFO tags | `info = {k: rec.info.get(k) for k in rec.info.keys()}`; only present keys; no direct key access that would throw | `vcf_processor.py`:`_extract_supported_gene_variants_strict` (349–365) |
| Extracts GENE, STAR, RS | rsID from `rec.id`; `gene_info`: `GENE` and `STAR` from `info.get("GENE")`, `info.get("STAR")` | `vcf_processor.py` (352–365); RS = ID column (rsID) |
| bgzip support | `pysam.BGZFile` for `.gz`; normalization outputs `.vcf.gz`; tabix index | `vcf_processor.py` (184–185, 263–264, 287–304) |
| Rejects malformed VCFs | Header/reference/format errors raise `VCFValidationError`; open/fetch errors propagated | `vcf_processor.py` (221, 310–312, 384) |
| Normalizes indels (left-aligned) | `bcftools norm --fasta-ref` used; fails if bcftools fails | `vcf_processor.py`:`_normalize_left_align` (262–284) |
| No mock parsing | Real pysam/bcftools/tabix; no synthetic or mock VCF parsing | Entire `vcf_processor.py` |

**Risk level:** Low  

**What must be fixed:** None for the listed requirements. Optional: document that `reference_fasta_path` must be set or normalization will raise `ToolingUnavailableError`.

---

## 2. GENE DETECTION LOGIC

**STATUS: ✓ Implemented correctly**

**Evidence:**

| Check | Implementation | File:Function |
|-------|----------------|---------------|
| All 6 genes (CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD) | `SUPPORTED_GENE_REGIONS` and PharmCAT/CPIC usage for all six | `vcf_processor.py` (65–73); `star_allele_caller.py` (56–100); `cpic_engine.py` |
| Variant-to-star allele mapping | Delegated to PharmCAT (Docker); no in-app variant→allele table; allele definitions in PharmCAT | `star_allele_caller.py`:`_run_pharmcat_docker`, `_parse_pharmcat_diplotype` |
| Diplotype calling | PharmCAT output parsed to `DiplotypeCall` (e.g. `*1/*4`); `_parse_pharmcat_diplotype` | `star_allele_caller.py`:`call_diplotype_strict`, `_parse_pharmcat_diplotype` (206–223) |
| Activity score | `ACTIVITY_SCORES` per gene; `calculate_activity_score`; CYP2D6 CNV duplication handled | `star_allele_caller.py` (56–100, 256–275) |
| Phenotype mapping (PM, IM, NM, RM, URM) | `PHENOTYPE_RANGES` with poor/intermediate/normal/ultrarapid; `determine_phenotype` by score | `star_allele_caller.py` (102–136, 277–291) |
| No hardcoded phenotype | Phenotype from activity score + ranges; CYP2D6 “unknown” when CNV unavailable | `star_allele_caller.py`:`determine_phenotype` (277–291) |

**Risk level:** Low  

**What must be fixed:** None. Reliance on PharmCAT is explicit; no fallback to wild-type.

---

## 3. DRUG-SPECIFIC RISK ENGINE

**STATUS: ✓ Implemented correctly**

**Evidence:**

| Requirement | Implementation | File:Function |
|-------------|----------------|---------------|
| Safe / Adjust / Toxic / Ineffective / Unknown | `RiskCategory` enum; `CPICRule` and `CPIC_RULES` map phenotype → risk_label | `backend/models/analysis.py`; `backend/services/cpic_engine.py` (57–58, 36–48) |
| Drug-specific gene logic | One primary gene per drug (e.g. codeine→CYP2D6); rules keyed by gene and drug | `main.py` (162–170); `cpic_engine.py` (58–330) |
| No LLM deciding risk | Risk from `cpic_engine.get_recommendations`; LLM only used in `rag_explainer.generate_explanation` for narrative | `main.py` (196–203, 205–223); `rag_explainer.py` |
| CPIC-based rule table | `CPIC_RULES`: gene → drug → phenotype → `CPICRule` (risk_label, severity, dose_adjustment, contraindication, citations) | `cpic_engine.py` (57–330) |
| Severity (none, low, moderate, high, critical) | `SeverityLevel` enum; each rule has `severity`; returned on `Recommendation.severity` | `cpic_engine.py` (27–33, 36–48, 372); `models/analysis.py` (70) |
| CODEINE, WARFARIN, CLOPIDOGREL, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL | All six present in `CPIC_RULES` and in `supported_drugs` in `main.py` | `cpic_engine.py`; `main.py` (137) |

**Risk level:** Low  

**What must be fixed:** None. Rules are structured and deterministic; no LLM in risk path.

---

## 4. LLM EXPLANATION LAYER

**STATUS: ✓ Implemented correctly**

**Evidence:**

| Requirement | Implementation | File:Function |
|-------------|----------------|---------------|
| LLM only for narrative explanation | `rag_explainer.generate_explanation` called after `cpic_engine.get_recommendations`; recommendation text passed in, not generated by LLM | `main.py` (205–223) |
| Recommendations not from LLM | Recommendations come from `cpic_engine.get_recommendations`; LLM receives `recommendation_text` and is instructed not to modify risk/dose | `main.py` (196–203); `rag_explainer.py` prompt (e.g. “DO NOT MODIFY”) |
| Variant rsIDs in prompt | `rsids` from `detected_variants`; passed to `_generate_llm_explanation` and into prompt | `rag_explainer.py` (93–95, 151–152, prompt text) |
| Biological mechanism in prompt | Prompt asks for “biological mechanism (enzyme function, variant impact)” and JSON `biological_mechanism` | `rag_explainer.py` (prompt construction and response parsing) |
| RAG retrieval grounding | `_retrieve_guideline_context` from `guideline_cache` (cpic_guidelines.json); context injected into prompt; `_validate_grounding` enforces minimum grounding score | `rag_explainer.py` (88–91, 125–137, 110–116) |
| CPIC citation in explanation | Prompt requires CPIC citations; `guideline_context.get("citations")`; grounding check | `rag_explainer.py` (prompt, 122) |
| LLM does not set risk classification | Risk and severity come from CPIC engine only; LLM output is not used for risk_label, dose, or severity | `main.py` (245–249, 256–264) |

**Risk level:** Low  

**What must be fixed:** None. If RAG/LLM fails, the API returns 500 (no silent template fallback).

---

## 5. JSON OUTPUT SCHEMA COMPLIANCE

**STATUS: ✓ Implemented correctly**

**Evidence:**

| Required key / shape | Implementation | File |
|----------------------|----------------|------|
| patient_id, drug, timestamp | On `CDSResponse`; timestamp from `datetime.utcnow()` | `backend/models/cds_response.py` (86–97); `main.py` (241–243) |
| risk_assessment.risk_label, confidence_score, severity | `RiskAssessment` model; confidence from diplotype; severity from `rec.severity` | `cds_response.py` (37–40); `main.py` (245–249) |
| pharmacogenomic_profile.primary_gene, diplotype, phenotype, detected_variants | `PharmacogenomicProfile` and `DetectedVariant` (rsid, chrom, pos, ref, alt) | `cds_response.py` (42–57); `main.py` (251–255) |
| clinical_recommendation | `ClinicalRecommendation` (recommendation_text, action, dose_adjustment, contraindication, evidence_level, citations) | `cds_response.py` (60–67); `main.py` (256–264) |
| llm_generated_explanation | `LLMGeneratedExplanation` (explanation_text, biological_mechanism, variant_rsids_mentioned, cpic_citations, grounding_score) | `cds_response.py` (69–75); `main.py` (265–271) |
| quality_metrics.vcf_parsing_success, variant_call_quality, missing_annotations_handled | Set from `vcf_data` and quality; all three fields present | `cds_response.py` (77–82); `main.py` (237–239, 273–277) |
| ISO timestamp | `datetime` with `json_encoders = {datetime: lambda v: v.isoformat()}` | `cds_response.py` (96–97) |
| Numeric confidence_score | `Field(..., ge=0.0, le=1.0)` on `RiskAssessment` | `cds_response.py` (39) |

**Risk level:** Low  

**What must be fixed:** None. Output matches the specified schema.

---

## 6. DRUG–GENE COVERAGE VALIDATION

**STATUS: ⚠ PARTIAL – FLAG**

**Evidence:**

| Check | Status | Detail |
|-------|--------|--------|
| Gene filtering | ✓ | `get_recommendations(primary_gene, phenotype, requested_drugs)` filters by drug list | `cpic_engine.py` (377–395) |
| RxNorm ID mapping | ✗ | No RxNorm fields or lookup in codebase | Grep: no RxNorm |
| ATC ID mapping | ✗ | No ATC fields or lookup in codebase | Grep: no ATC |
| Extend beyond 6 core drugs | ✗ | Drug list and rules are static: `CPIC_RULES` and `supported_drugs` hardcoded; no DB or config-driven extension | `main.py` (137); `cpic_engine.py` (57–330) |

**Risk level:** Moderate  

**What must be fixed:**  
- Add RxNorm (and optionally ATC) to drug metadata if EHR/interoperability is required.  
- Add a way to extend supported drugs (e.g. config or DB) instead of code-only changes.

---

## 7. WEB INTERFACE COMPLIANCE

**STATUS: ✓ Implemented correctly (one bug)**

**Evidence:**

| Requirement | Implementation | File |
|-------------|----------------|-------|
| Drag-and-drop VCF upload | `useDropzone` with accept .vcf, .vcf.gz; onDrop triggers upload | `src/components/UploadZone.tsx` |
| File size limit indicator | `maxFileSize` prop; message “Maximum file size: X MB”; validation before upload | `UploadZone.tsx` |
| VCF validation feedback | Backend errors surfaced via `onError`; `validationError` state and inline error UI | `UploadZone.tsx` (113–119, error block) |
| Drug input | Single-drug select (dropdown) with all 6 drugs; `apiEndpoint={...?drug=${selectedDrug}}` | `src/app/analysis/page.tsx` (79–96, 106) |
| Risk color coding | SeverityBadge and risk-based styling; `getRiskColor` in utils | `SeverityBadge`; `src/lib/utils.ts` |
| Expandable detailed sections | Results shown in sections (Risk, Profile, Recommendation, LLM explanation) | `analysis/page.tsx` (128–260) |
| JSON download button | “Download JSON” calls `downloadJSON(analysisResult, ...)` | `analysis/page.tsx` (39–41, 132–137) |
| Copy-to-clipboard | “Copy to Clipboard” uses `copyToClipboard(JSON.stringify(analysisResult, null, 2))` | `analysis/page.tsx` (44–52, 138–143); `lib/utils.ts` |
| User-friendly error handling | Error state and message displayed; “Analysis Failed” block | `analysis/page.tsx` (111–126) |

**Bug:** In `UploadZone`, `formData.append('drug', 'codeine')` is hardcoded; the backend receives `drug` from the query string (`apiEndpoint` includes `?drug=${selectedDrug}`), so behavior is correct, but the form body is misleading. Prefer setting drug from the URL or a prop and removing the hardcoded `'codeine'`.

**Risk level:** Low  

**What must be fixed:** Remove or correct the hardcoded `drug` in FormData so the frontend clearly reflects the selected drug.

---

## 8. ERROR HANDLING & EDGE CASES

**STATUS: ✓ Implemented correctly (handlers not wired)**

**Evidence:**

| Scenario | Backend behavior | File / note |
|----------|------------------|-------------|
| VCF missing required gene region | `_extract_supported_gene_variants_strict`: zero variants in region → `VCFValidationError` with message | `vcf_processor.py` (337–344) |
| Drug not supported | `drug_lower not in supported_drugs` → HTTP 400 with list of supported drugs | `main.py` (136–142) |
| Variant not classified | PharmCAT failure → `PharmCATFailureError` → HTTP 500; no phenotype → `get_recommendation` returns None → HTTP 404 | `main.py` (179–183, 198–201) |
| Multiple drugs input | Single-drug API; no batch. Multiple drugs require multiple requests. Documented in `EdgeCaseHandler.handle_multiple_drugs` but not used in route | `main.py`; `backend/core/edge_cases.py` (44–52) |
| Corrupted VCF | Open/parse errors become `VCFValidationError` or propagate; no silent swallow | `vcf_processor.py` (221, 310–312) |
| LLM fails | `RAGRetrievalError` or `LLMGenerationError` → HTTP 500 with message | `main.py` (217–222) |
| CNV unavailable (CYP2D6) | `phenotype == "unknown"` → HTTP 422 with explicit message | `main.py` (189–194) |

**Gap:** `EdgeCaseHandler` in `backend/core/edge_cases.py` defines structured responses for unsupported drug, multiple drugs, missing variant, etc., but the API does not import or call it; errors are raised directly in `main.py`. Behavior is correct; the handler module is redundant unless used for consistent error payloads.

**Risk level:** Low  

**What must be fixed:** Either wire `EdgeCaseHandler` into the API for consistent error bodies or remove/deprecate it to avoid confusion.

---

## 9. SECURITY & ARCHITECTURE

**STATUS: ✓ Implemented correctly**

**Evidence:**

| Check | Implementation | File |
|-------|----------------|-------|
| No genomic data in localStorage | No `localStorage` or `sessionStorage` in `src` | Grep over `src` |
| Backend validation | File size and extension in `main.py`; VCF format/build/size in `vcf_processor`; drug allowlist | `main.py` (131–150); `vcf_processor.py` |
| PHI-safe design | `sanitize_phi` hashes identifiers; audit log uses sanitized values for “patient”/“name” keys | `main.py` (78–94) |
| Role-based access | `require_clinician_or_above` on `/api/cds/analyze`; `get_current_user` / `require_*` from `core.security` | `main.py` (115); `backend/core/security.py` |
| No clinical decision purely AI-based | Risk, severity, and recommendation come from CPIC engine; LLM only generates explanation from fixed recommendation | `main.py` (196–203, 245–264) |

**Risk level:** Low  

**What must be fixed:** None for the listed items.

---

# FINAL OUTPUT

## Overall production readiness score: **88/100**

- **Deductions:**  
  - Drug list and rules are static (no RxNorm/ATC, no extensibility): −6  
  - Edge case handler not integrated: −2  
  - UploadZone formData drug hardcoded: −2  
  - Dependency on external tools (PharmCAT Docker, bcftools, reference FASTA): −2 (operational risk)

---

## Top 5 clinical risks

1. **PharmCAT/Docker dependency** – If PharmCAT is down or misconfigured, all gene calling fails. Mitigation: strict failure (no fallback) is correct; ensure deployment and monitoring of PharmCAT.
2. **Empty or missing cpic_guidelines.json** – RAG retrieval fails for all gene–drug pairs; LLM step returns 500. Mitigation: ensure `data/cpic/cpic_guidelines.json` is populated for all supported pairs.
3. **CYP2D6 CNV unavailable** – Phenotype forced to “unknown” and API returns 422; no silent wild-type. Acceptable; document for users.
4. **Reference genome path** – If `reference_fasta_path` is wrong or missing, normalization fails. Operational/config risk only.
5. **No RxNorm/ATC** – Limits EHR and formulary integration; not a direct patient-safety bug but a coverage/compliance gap.

---

## Top 5 engineering risks

1. **Static drug list and CPIC rules** – Adding a drug or updating rules requires code change and release; no DB or config-driven extension.
2. **EdgeCaseHandler unused** – Documented edge-case responses exist but are not used; risk of inconsistent or outdated error contracts.
3. **UploadZone drug in FormData** – Hardcoded `'codeine'` in form body while backend uses query param; confusing and fragile if API later reads body.
4. **Tooling dependency** – bcftools, tabix, CrossMap, Docker must be installed and configured; no in-app fallback.
5. **LLM_API_KEY optional at init** – Service starts without key; LLM calls fail at request time. Consider failing fast at startup if CDS explanations are required.

---

## Immediate refactor priorities

1. **Drug and rule extensibility** – Move supported drugs and/or CPIC rules to config or DB; add versioning and auditability.
2. **RxNorm (and optionally ATC)** – Add drug identifiers for interoperability if required by stakeholders.
3. **Frontend drug parameter** – Pass selected drug into UploadZone (or derive from `apiEndpoint`) and set `formData.append('drug', selectedDrug)` (or stop sending drug in body if only query is used).
4. **Edge case integration** – Either use `EdgeCaseHandler` in `main.py` for error responses or remove the module and document that API errors are the single source of truth.
5. **Config validation at startup** – Validate `reference_fasta_path`, and optionally `LLM_API_KEY`, so misconfiguration fails fast.

---

**End of audit.**
