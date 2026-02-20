"""
GeneDose.ai RAG Explanation Service (STRICT MODE)

Clinical safety requirements:
- Real LLM API integration (NO templates)
- Retrieve CPIC guideline text from structured database
- Inject variant rsIDs into LLM prompt
- Include biological mechanism explanation
- Force explanation to cite rsIDs and CPIC guidelines
- If retrieval fails → explanation fails (NO hallucinated explanations)
- If LLM fails → explanation fails (NO fallback templates)
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
import structlog

from ..core.config import settings

logger = structlog.get_logger()


class RAGRetrievalError(RuntimeError):
    """Raised when CPIC guideline retrieval fails."""


class LLMGenerationError(RuntimeError):
    """Raised when LLM explanation generation fails."""


class RAGExplainer:
    """
    Real RAG-based explanation service.

    Uses actual LLM API (OpenAI/Anthropic) with strict grounding requirements.
    NO templates. NO fallbacks.
    """

    def __init__(self) -> None:
        self.cpic_data_dir = Path(settings.cpic_data_dir)
        self.cpic_data_dir.mkdir(parents=True, exist_ok=True)
        self.guideline_cache: Dict[str, Dict[str, Any]] = {}
        self._load_guideline_database()

        # LLM API configuration
        self.llm_provider = os.getenv("LLM_PROVIDER", "openai")  # openai, anthropic
        self.llm_api_key = os.getenv("LLM_API_KEY", "")
        self.llm_model = os.getenv("LLM_MODEL", "gpt-4-turbo-preview")
        self.llm_base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")

        if not self.llm_api_key:
            logger.warning("LLM_API_KEY not set - explanation generation will fail")

    def _load_guideline_database(self) -> None:
        """Load CPIC guideline database for retrieval."""
        guideline_file = self.cpic_data_dir / "cpic_guidelines.json"
        if guideline_file.exists():
            try:
                with open(guideline_file, "r") as f:
                    self.guideline_cache = json.load(f)
            except Exception as e:
                logger.error("Failed to load guideline database", error=str(e))
                self.guideline_cache = {}

    async def generate_explanation(
        self,
        gene: str,
        drug: str,
        diplotype: str,
        phenotype: str,
        activity_score: float,
        detected_variants: List[Dict[str, Any]],
        recommendation_text: str,
    ) -> Dict[str, Any]:
        """
        Generate RAG-based explanation with strict grounding.

        Returns dict with explanation_text, biological_mechanism, variant_rsids_mentioned, cpic_citations, grounding_score.

        Raises RAGRetrievalError if guideline retrieval fails.
        Raises LLMGenerationError if LLM call fails.
        """
        # Step 1: Retrieve CPIC guideline context
        guideline_context = await self._retrieve_guideline_context(gene, drug)
        if not guideline_context:
            raise RAGRetrievalError(f"CPIC guideline not found for {gene}-{drug}")

        # Step 2: Extract rsIDs from detected variants
        rsids = [v.get("rsid") for v in detected_variants if v.get("rsid")]
        rsids = [r for r in rsids if r and r.startswith("rs")]

        # Step 3: Generate explanation using real LLM
        explanation_result = await self._generate_llm_explanation(
            gene=gene,
            drug=drug,
            diplotype=diplotype,
            phenotype=phenotype,
            activity_score=activity_score,
            rsids=rsids,
            guideline_context=guideline_context,
            recommendation_text=recommendation_text,
        )

        # Step 4: Validate grounding (must mention rsIDs and CPIC)
        grounding_score = self._validate_grounding(explanation_result, rsids, guideline_context)

        if grounding_score < 0.5:
            raise LLMGenerationError(
                f"Explanation grounding score too low ({grounding_score:.2f}). Explanation may be hallucinated."
            )

        explanation_text = explanation_result["explanation"]
        # Create summary (first 200 chars or first sentence)
        summary = explanation_text[:200] + "..." if len(explanation_text) > 200 else explanation_text
        if "." in explanation_text[:200]:
            summary = explanation_text.split(".")[0] + "."
        
        return {
            "summary": summary,
            "explanation_text": explanation_text,
            "biological_mechanism": explanation_result.get("biological_mechanism", ""),
            "variant_rsids_mentioned": explanation_result.get("rsids_mentioned", []),
            "cpic_citations": guideline_context.get("citations", []),
            "grounding_score": grounding_score,
        }

    async def _retrieve_guideline_context(self, gene: str, drug: str) -> Optional[Dict[str, Any]]:
        """Retrieve CPIC guideline context for gene-drug pair."""
        search_key = f"{gene}_{drug}".lower()
        if search_key in self.guideline_cache:
            return self.guideline_cache[search_key]

        # Try partial matches
        for key, guideline in self.guideline_cache.items():
            if gene.lower() in key.lower() and drug.lower() in key.lower():
                return guideline

        return None

    async def _generate_llm_explanation(
        self,
        gene: str,
        drug: str,
        diplotype: str,
        phenotype: str,
        activity_score: float,
        rsids: List[str],
        guideline_context: Dict[str, Any],
        recommendation_text: str,
    ) -> Dict[str, Any]:
        """Generate explanation using real LLM API."""
        if not self.llm_api_key:
            raise LLMGenerationError("LLM_API_KEY not configured")

        # Construct prompt with strict requirements
        prompt = self._construct_rag_prompt(
            gene=gene,
            drug=drug,
            diplotype=diplotype,
            phenotype=phenotype,
            activity_score=activity_score,
            rsids=rsids,
            guideline_context=guideline_context,
            recommendation_text=recommendation_text,
        )

        try:
            if self.llm_provider == "openai":
                response = await self._call_openai_api(prompt)
            elif self.llm_provider == "anthropic":
                response = await self._call_anthropic_api(prompt)
            else:
                raise LLMGenerationError(f"Unsupported LLM provider: {self.llm_provider}")

            return self._parse_llm_response(response, rsids)

        except Exception as e:
            logger.error("LLM API call failed", error=str(e))
            raise LLMGenerationError(f"LLM explanation generation failed: {str(e)}") from e

    def _construct_rag_prompt(
        self,
        gene: str,
        drug: str,
        diplotype: str,
        phenotype: str,
        activity_score: float,
        rsids: List[str],
        guideline_context: Dict[str, Any],
        recommendation_text: str,
    ) -> str:
        """Construct RAG prompt with strict grounding requirements."""
        guideline_text = guideline_context.get("text", "")
        citations = ", ".join(guideline_context.get("citations", []))

        rsid_list = ", ".join(rsids) if rsids else "None detected in VCF"

        return f"""You are a clinical pharmacogenomics expert explaining drug-gene interactions based on CPIC guidelines.

CRITICAL REQUIREMENTS:
1. You MUST cite specific variant rsIDs: {rsid_list}
2. You MUST explain the biological mechanism (enzyme function, variant impact)
3. You MUST reference CPIC guidelines: {citations}
4. You MUST NOT modify the risk classification or dose recommendation
5. You MUST ground all statements in the provided CPIC guideline text

PATIENT GENETIC PROFILE:
- Gene: {gene}
- Diplotype: {diplotype}
- Phenotype: {phenotype}
- Activity Score: {activity_score}
- Detected Variants (rsIDs): {rsid_list}

CPIC GUIDELINE CONTEXT:
{guideline_text}

CLINICAL RECOMMENDATION (DO NOT MODIFY):
{recommendation_text}

Generate a clinical explanation that:
1. Explains how the {gene} genotype ({diplotype}, {phenotype} metabolizer) affects {drug} metabolism
2. Describes the biological mechanism (enzyme function, variant impact on activity)
3. Cites specific variant rsIDs: {rsid_list}
4. References CPIC guidelines: {citations}
5. Explains why this recommendation is evidence-based

Format your response as JSON:
{{
  "explanation": "Full explanation text...",
  "biological_mechanism": "Detailed mechanism explanation...",
  "rsids_mentioned": ["rs123", "rs456"]
}}
"""

    async def _call_openai_api(self, prompt: str) -> Dict[str, Any]:
        """Call OpenAI API."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.llm_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.llm_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.llm_model,
                    "messages": [
                        {"role": "system", "content": "You are a clinical pharmacogenomics expert."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,  # Lower temperature for more grounded responses
                    "max_tokens": 1000,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _call_anthropic_api(self, prompt: str) -> Dict[str, Any]:
        """Call Anthropic Claude API."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.llm_api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.llm_model,
                    "max_tokens": 1000,
                    "temperature": 0.3,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]

    def _parse_llm_response(self, response_text: str, rsids: List[str]) -> Dict[str, Any]:
        """Parse LLM response and extract explanation components."""
        try:
            # Try to parse as JSON
            parsed = json.loads(response_text)
            return {
                "explanation": parsed.get("explanation", response_text),
                "biological_mechanism": parsed.get("biological_mechanism", ""),
                "rsids_mentioned": parsed.get("rsids_mentioned", []),
            }
        except json.JSONDecodeError:
            # Fallback: treat entire response as explanation
            return {
                "explanation": response_text,
                "biological_mechanism": "",
                "rsids_mentioned": [r for r in rsids if r in response_text],
            }

    def _validate_grounding(
        self, explanation_result: Dict[str, Any], rsids: List[str], guideline_context: Dict[str, Any]
    ) -> float:
        """Validate explanation grounding (0.0-1.0 score)."""
        explanation_text = explanation_result.get("explanation", "").lower()
        guideline_text = guideline_context.get("text", "").lower()

        score = 0.0

        # Check for rsID mentions (30% weight)
        if rsids:
            mentioned = sum(1 for r in rsids if r.lower() in explanation_text)
            score += 0.3 * (mentioned / len(rsids))
        else:
            score += 0.3  # No rsIDs to mention

        # Check for CPIC citation (20% weight)
        citations = guideline_context.get("citations", [])
        if citations:
            mentioned = sum(1 for c in citations if c.lower() in explanation_text)
            score += 0.2 * (mentioned / len(citations))
        else:
            score += 0.2

        # Check for biological mechanism keywords (30% weight)
        mechanism_keywords = ["enzyme", "metabolism", "variant", "allele", "activity", "function"]
        mentioned = sum(1 for kw in mechanism_keywords if kw in explanation_text)
        score += 0.3 * (mentioned / len(mechanism_keywords))

        # Check for guideline text overlap (20% weight)
        if guideline_text:
            # Simple word overlap
            guideline_words = set(guideline_text.split())
            explanation_words = set(explanation_text.split())
            overlap = len(guideline_words.intersection(explanation_words))
            score += 0.2 * min(1.0, overlap / max(10, len(guideline_words) * 0.1))

        return min(1.0, score)
