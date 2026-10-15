
"""Online translation utilities for CivicTrack."""

import requests

API_URL = "https://api.mymemory.translated.net/get"

SUPPORTED_LANGUAGES = {"en", "ta", "hi", "te"}
MAX_TEXT_BYTES = 450


def _split_text(text):
    """Split long text into chunks below the API's text-size limit."""
    words = text.split()
    chunks = []
    current = ""

    for word in words:
        if len(word.encode("utf-8")) > MAX_TEXT_BYTES:
            raise ValueError("A single word is too long to translate.")

        candidate = f"{current} {word}".strip()

        if len(candidate.encode("utf-8")) > MAX_TEXT_BYTES:
            chunks.append(current)
            current = word
        else:
            current = candidate

    if current:
        chunks.append(current)

    return chunks


def _translate_chunk(text, source_language, target_language):
    """Translate one text chunk using MyMemory."""
    try:
        response = requests.get(
            API_URL,
            params={
                "q": text,
                "langpair": f"{source_language}|{target_language}",
            },
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()

    except (requests.RequestException, ValueError) as exc:
        raise RuntimeError(
            "Translation service is unavailable. "
            "Check your internet connection and retry."
        ) from exc

    if str(data.get("responseStatus")) != "200":
        detail = data.get("responseDetails") or "Translation request failed."
        raise RuntimeError(detail)

    result = data.get("responseData", {}).get("translatedText", "")
    result = result.strip() if isinstance(result, str) else ""

    error_messages = (
        "INVALID SOURCE LANGUAGE",
        "INVALID TARGET LANGUAGE",
        "PLEASE SELECT TWO DISTINCT LANGUAGES",
    )

    if not result or any(
        message in result.upper() for message in error_messages
    ):
        raise RuntimeError(
            "The translation service could not translate this language pair."
        )

    return result


def translate_text(statement, source_language="auto", target_language="en"):
    """Translate text online between English, Tamil, Hindi and Telugu."""
    if not isinstance(statement, str) or not statement.strip():
        raise ValueError("Statement is required.")

    # The API needs a specified source language.
    # Treat 'auto' as English for this project by default.
    source_language = (
        "en" if source_language in (None, "", "auto")
        else source_language.lower()
    )
    target_language = target_language.lower()

    if source_language not in SUPPORTED_LANGUAGES:
        raise ValueError("Unsupported source language.")

    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError("Unsupported target language.")

    text = statement.strip()

    if source_language == target_language:
        return text

    chunks = _split_text(text)

    if not chunks:
        raise ValueError("Statement is required.")

    translations = [
        _translate_chunk(chunk, source_language, target_language)
        for chunk in chunks
    ]

    return " ".join(translations)
