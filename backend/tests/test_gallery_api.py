"""Backend API tests for Parv Malav Gallery."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gallery-immerse-3.preview.emergentagent.com").rstrip("/")
# Fallback: read from frontend .env if not in env
if "preview.emergentagent.com" not in BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def visitor_id():
    return f"TEST_visitor_{uuid.uuid4().hex[:10]}"


# ------ Health ------
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "message" in r.json()


# ------ Analytics: views ------
class TestViews:
    def test_view_increments(self, api):
        artwork_id = f"TEST_art_{uuid.uuid4().hex[:8]}"
        r1 = api.post(f"{BASE_URL}/api/artworks/{artwork_id}/view")
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["artwork_id"] == artwork_id
        assert d1["views"] == 1

        r2 = api.post(f"{BASE_URL}/api/artworks/{artwork_id}/view")
        assert r2.status_code == 200
        assert r2.json()["views"] == 2

        r3 = api.post(f"{BASE_URL}/api/artworks/{artwork_id}/view")
        assert r3.json()["views"] == 3

    def test_analytics_views_lists(self, api):
        artwork_id = f"TEST_art_{uuid.uuid4().hex[:8]}"
        api.post(f"{BASE_URL}/api/artworks/{artwork_id}/view")
        r = api.get(f"{BASE_URL}/api/analytics/views")
        assert r.status_code == 200
        data = r.json()
        assert "views" in data
        assert isinstance(data["views"], list)
        ids = [d["artwork_id"] for d in data["views"]]
        assert artwork_id in ids
        # Verify no _id leaked
        for doc in data["views"]:
            assert "_id" not in doc


# ------ Favorites ------
class TestFavorites:
    def test_empty_favorites(self, api, visitor_id):
        r = api.get(f"{BASE_URL}/api/favorites/{visitor_id}")
        assert r.status_code == 200
        assert r.json()["artwork_ids"] == []

    def test_add_favorite_and_persist(self, api, visitor_id):
        payload = {"visitor_id": visitor_id, "artwork_id": "smash-club"}
        r = api.post(f"{BASE_URL}/api/favorites", json=payload)
        assert r.status_code == 200
        assert r.json()["ok"] is True

        # Verify GET reflects added favorite
        r2 = api.get(f"{BASE_URL}/api/favorites/{visitor_id}")
        assert r2.status_code == 200
        assert "smash-club" in r2.json()["artwork_ids"]

    def test_add_favorite_idempotent(self, api, visitor_id):
        payload = {"visitor_id": visitor_id, "artwork_id": "elo-engine"}
        api.post(f"{BASE_URL}/api/favorites", json=payload)
        api.post(f"{BASE_URL}/api/favorites", json=payload)
        api.post(f"{BASE_URL}/api/favorites", json=payload)
        r = api.get(f"{BASE_URL}/api/favorites/{visitor_id}")
        assert r.json()["artwork_ids"].count("elo-engine") == 1

    def test_remove_favorite(self, api, visitor_id):
        api.post(f"{BASE_URL}/api/favorites", json={"visitor_id": visitor_id, "artwork_id": "about"})
        # Confirm present
        r1 = api.get(f"{BASE_URL}/api/favorites/{visitor_id}")
        assert "about" in r1.json()["artwork_ids"]
        # Delete
        rd = api.delete(f"{BASE_URL}/api/favorites/{visitor_id}/about")
        assert rd.status_code == 200
        assert rd.json()["ok"] is True
        # Verify removed
        r2 = api.get(f"{BASE_URL}/api/favorites/{visitor_id}")
        assert "about" not in r2.json()["artwork_ids"]

    def test_remove_nonexistent_favorite(self, api, visitor_id):
        # Should still succeed gracefully
        r = api.delete(f"{BASE_URL}/api/favorites/{visitor_id}/nonexistent")
        assert r.status_code == 200

    def test_multiple_favorites(self, api, visitor_id):
        for aid in ["smash-club", "elo-engine", "languages"]:
            api.post(f"{BASE_URL}/api/favorites", json={"visitor_id": visitor_id, "artwork_id": aid})
        r = api.get(f"{BASE_URL}/api/favorites/{visitor_id}")
        ids = r.json()["artwork_ids"]
        assert set(ids) >= {"smash-club", "elo-engine", "languages"}
