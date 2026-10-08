"""
Gemini Service
Wraps the Google Gemini API (google-genai SDK) with retry + model fallback.
"""

import time
from google import genai
from google.genai import types
from app.config import settings

# Models confirmed working on this API key
FALLBACK_MODELS = [
    "gemini-3.8-flash",      # primary — latest recommended by API
    "gemini-3.5-flash",      # fallback 1 — stable
    "gemini-3.5-flash-lite", # fallback 2 — lightweight
]


class GeminiService:
    """
    Service for interacting with the Gemini API.
    Automatically retries and falls back to alternative models on 503.
    """

    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.active_model = None   # set on first successful call

    def _try_generate(self, model_name: str, prompt: str, temperature: float) -> str:
        """Attempt a single generate call for a given model."""
        response = self.client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=8192,
            ),
        )
        return response.text

    def generate(self, prompt: str, temperature: float = 0.7) -> str:
        """
        Generates text, trying each fallback model with up to 2 retries.
        """
        errors = []

        for model_name in FALLBACK_MODELS:
            for attempt in range(2):          # 2 attempts per model
                try:
                    text = self._try_generate(model_name, prompt, temperature)
                    self.active_model = model_name
                    return text
                except Exception as e:
                    err_str = str(e)
                    errors.append(f"{model_name} attempt {attempt+1}: {err_str}")

                    if "503" in err_str or "UNAVAILABLE" in err_str:
                        if attempt == 0:
                            time.sleep(2)  # short wait then try next model
                        continue
                    else:
                        break  # non-retriable, skip to next model

        raise RuntimeError(
            "All Gemini models failed.\n" + "\n".join(errors[-4:])
        )

    def generate_structured(self, prompt: str) -> str:
        """Low-temperature generation for structured/analytical outputs."""
        return self.generate(prompt, temperature=0.2)

    def test_connection(self) -> dict:
        """Ping Gemini to verify the API key and connectivity."""
        test_prompt = (
            "You are an investment planning assistant. "
            "Respond with exactly one sentence confirming you are ready to help."
        )
        response_text = self.generate(test_prompt, temperature=0.1)
        return {
            "status": "connected",
            "model": self.active_model,
            "response": response_text,
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
gemini_service = GeminiService()
