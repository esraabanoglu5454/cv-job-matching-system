import os
from typing import List, Dict, Any
import requests


UDEMY_AFFILIATE_BASE_URL = os.getenv("UDEMY_AFFILIATE_BASE_URL", "").rstrip("/")
UDEMY_AFFILIATE_CLIENT_ID = os.getenv("UDEMY_AFFILIATE_CLIENT_ID", "")
UDEMY_AFFILIATE_CLIENT_SECRET = os.getenv("UDEMY_AFFILIATE_CLIENT_SECRET", "")
UDEMY_AFFILIATE_BEARER_TOKEN = os.getenv("UDEMY_AFFILIATE_BEARER_TOKEN", "")


def _get_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/json",
    }

    if UDEMY_AFFILIATE_BEARER_TOKEN:
        headers["Authorization"] = f"Bearer {UDEMY_AFFILIATE_BEARER_TOKEN}"

    return headers


def normalize_udemy_course(raw: Dict[str, Any], skill: str) -> Dict[str, Any]:
    instructors = raw.get("visible_instructors") or raw.get("instructors") or []
    instructor_name = ""
    if instructors and isinstance(instructors, list):
        first = instructors[0]
        instructor_name = first.get("display_name") or first.get("name") or ""

    image_url = (
        raw.get("image_480x270")
        or raw.get("image_304x171")
        or raw.get("image_240x135")
        or raw.get("image")
        or ""
    )

    rating = (
        raw.get("rating")
        or raw.get("avg_rating")
        or raw.get("rating_avg")
        or None
    )

    review_count = (
        raw.get("num_reviews")
        or raw.get("reviews_count")
        or 0
    )

    price = None
    price_detail = raw.get("price_detail") or {}
    if isinstance(price_detail, dict):
        price = price_detail.get("price_string") or price_detail.get("amount_string")

    if not price:
        price = raw.get("price") or raw.get("list_price") or "Fiyat bilgisi yok"

    url = raw.get("url") or raw.get("landing_page_url") or ""
    if url.startswith("/"):
        url = f"https://www.udemy.com{url}"

    return {
        "skill": skill,
        "title": raw.get("title", "Udemy Course"),
        "url": url,
        "image": image_url,
        "provider": "Udemy",
        "rating": rating,
        "review_count": review_count,
        "price": price,
        "instructor": instructor_name,
        "headline": raw.get("headline") or raw.get("description") or "",
    }


def search_udemy_courses(skill: str, page_size: int = 4) -> List[Dict[str, Any]]:
    """
    Not:
    - Buradaki endpoint/path'i kendi affiliate hesabındaki gerçek dokümana göre eşleştir.
    - Aşağıdaki '/courses/' yolu tipik örnek akış içindir.
    """
    if not UDEMY_AFFILIATE_BASE_URL:
        return []

    endpoint = f"{UDEMY_AFFILIATE_BASE_URL}/courses/"
    params = {
        "search": skill,
        "page_size": page_size,
    }

    response = requests.get(
        endpoint,
        headers=_get_headers(),
        params=params,
        timeout=20,
    )
    response.raise_for_status()

    payload = response.json()
    results = payload.get("results", []) if isinstance(payload, dict) else []

    normalized = []
    for item in results:
        try:
            normalized.append(normalize_udemy_course(item, skill))
        except Exception:
            continue

    return normalized