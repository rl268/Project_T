from fastapi import APIRouter

router = APIRouter()

@router.get("/search")
async def search_food(query: str):
    """Skeleton endpoint for food search"""
    return {"message": f"Food search endpoint placeholder for query: {query}"}
