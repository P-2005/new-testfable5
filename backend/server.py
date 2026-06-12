from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Parv Malav Gallery API")
api_router = APIRouter(prefix="/api")


class FavoriteCreate(BaseModel):
    visitor_id: str
    artwork_id: str


@api_router.get("/")
async def root():
    return {"message": "Gallery API is live"}


# ---------- Analytics: artwork views ----------
@api_router.post("/artworks/{artwork_id}/view")
async def track_view(artwork_id: str):
    doc = await db.artwork_views.find_one_and_update(
        {"artwork_id": artwork_id},
        {
            "$inc": {"views": 1},
            "$set": {"last_viewed": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return {"artwork_id": artwork_id, "views": doc["views"]}


@api_router.get("/analytics/views")
async def get_view_analytics():
    docs = await db.artwork_views.find({}, {"_id": 0}).to_list(200)
    return {"views": docs}


# ---------- Favorites ----------
@api_router.get("/favorites/{visitor_id}")
async def get_favorites(visitor_id: str):
    docs = await db.favorites.find({"visitor_id": visitor_id}, {"_id": 0}).to_list(500)
    return {"artwork_ids": [d["artwork_id"] for d in docs]}


@api_router.post("/favorites")
async def add_favorite(fav: FavoriteCreate):
    await db.favorites.update_one(
        {"visitor_id": fav.visitor_id, "artwork_id": fav.artwork_id},
        {
            "$set": {
                "visitor_id": fav.visitor_id,
                "artwork_id": fav.artwork_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )
    return {"ok": True}


@api_router.delete("/favorites/{visitor_id}/{artwork_id}")
async def remove_favorite(visitor_id: str, artwork_id: str):
    await db.favorites.delete_one({"visitor_id": visitor_id, "artwork_id": artwork_id})
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
