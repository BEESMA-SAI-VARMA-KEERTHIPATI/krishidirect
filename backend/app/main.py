from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed import seed_database
from app.routers import (
    auth_router,
    listings_router,
    orders_router,
    pricing_router,
    pooling_router,
    transporter_router,
    admin_router,
    notifications_router,
    voice_router,
)

# Initialize database tables and demo seed
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"[STARTUP] Seeding check note: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="KrishiDirect: Functional AI-Powered Agricultural Marketplace connecting farmers directly with buyers, reducing intermediary loss, and optimizing logistics.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(orders_router)
app.include_router(pricing_router)
app.include_router(pooling_router)
app.include_router(transporter_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(voice_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": "sqlite_connected" if settings.DATABASE_URL.startswith("sqlite") else "postgres_connected",
        "demo_mode": settings.DEMO_MODE,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
