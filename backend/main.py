from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
import httpx

app = FastAPI(title="NutriSmart Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
db = {
    "profile": {},
    "meals": [] 
}

class Profile(BaseModel):
    name: str
    age: int
    weight: float
    height: float
    goal: str
    targetCalories: Optional[int] = None

class FoodItem(BaseModel):
    id: Optional[str] = None
    name: str
    brand: Optional[str] = ""
    image: Optional[str] = ""
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: Optional[str] = "100g"
    mealType: str
    date: str
    mood: Optional[str] = "😐"

@app.post("/profile")
def save_profile(profile: Profile):
    db["profile"] = profile.dict()
    return {"message": "Profile saved", "profile": db["profile"]}

@app.get("/profile")
def get_profile():
    return db.get("profile", {})

@app.post("/log-meal")
def log_meal(food: FoodItem):
    db["meals"].append(food.dict())
    return {"message": "Meal logged successfully"}

@app.get("/daily-log")
def get_daily_log(target_date: str):
    daily_meals = [m for m in db["meals"] if m["date"] == target_date]
    total_cals = sum(m["calories"] for m in daily_meals)
    total_protein = sum(m["protein"] for m in daily_meals)
    total_carbs = sum(m["carbs"] for m in daily_meals)
    total_fat = sum(m["fat"] for m in daily_meals)
    
    return {
        "date": target_date,
        "meals": daily_meals,
        "totals": {
            "calories": total_cals,
            "protein": total_protein,
            "carbs": total_carbs,
            "fat": total_fat
        }
    }

@app.get("/suggestions")
def get_suggestions(target_date: str):
    daily_meals = [m for m in db["meals"] if m["date"] == target_date]
    
    if not daily_meals:
        return {"suggestions": [
            {"original": "Any Snack", "alternative": "Mixed Nuts", "reason": "Rich in healthy fats and keeps you full longer."}
        ]}

    suggestions = []
    
    high_cal = [m for m in daily_meals if m["calories"] > 400]
    low_protein = [m for m in daily_meals if m["protein"] < 5 and m["calories"] > 150]
    high_carb = [m for m in daily_meals if m["carbs"] > 50]

    if high_cal:
        suggestions.append({
            "original": high_cal[0]["name"],
            "alternative": "Grilled Chicken Salad",
            "reason": "Lower in calories while keeping you full and satisfied."
        })
    if low_protein:
        suggestions.append({
            "original": low_protein[0]["name"],
            "alternative": "Greek Yogurt or Cottage Cheese",
            "reason": "A great source of protein to support your muscles."
        })
    if high_carb:
        suggestions.append({
            "original": high_carb[0]["name"],
            "alternative": "Zucchini Noodles or Cauliflower Rice",
            "reason": "A low-carb alternative that tastes great."
        })
        
    defaults = [
        {"original": "Potato Chips", "alternative": "Air-popped Popcorn", "reason": "Lower in calories and higher in fiber."},
        {"original": "Sugary Drinks", "alternative": "Water with Lemon", "reason": "Zero calories and refreshing."},
    ]
    for d in defaults:
        if len(suggestions) < 3 and d not in suggestions:
            suggestions.append(d)

    return {"suggestions": suggestions}

@app.get("/weekly-summary")
def get_weekly_summary(today: str):
    from datetime import datetime
    end_date = datetime.strptime(today, "%Y-%m-%d")
    
    summary = []
    for i in range(7):
        curr_date = (end_date - timedelta(days=6-i)).strftime("%Y-%m-%d")
        daily_cals = sum(m["calories"] for m in db["meals"] if m["date"] == curr_date)
        summary.append({
            "date": curr_date,
            "calories": daily_cals
        })
        
    return {"summary": summary}

@app.get("/api/food/search")
async def search_food(query: str):
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=10"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for item in data.get("products", []):
                nutriments = item.get("nutriments", {})
                results.append({
                    "id": item.get("id"),
                    "name": item.get("product_name", "Unknown Food"),
                    "brand": item.get("brands", "Unknown Brand"),
                    "image": item.get("image_front_thumb_url", ""),
                    "calories": nutriments.get("energy-kcal_100g", 0),
                    "protein": nutriments.get("proteins_100g", 0),
                    "carbs": nutriments.get("carbohydrates_100g", 0),
                    "fat": nutriments.get("fat_100g", 0),
                    "serving_size": item.get("serving_size", "100g")
                })
            return {"results": results}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
