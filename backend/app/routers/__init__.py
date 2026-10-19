from app.routers.auth import router as auth_router
from app.routers.listings import router as listings_router
from app.routers.orders import router as orders_router
from app.routers.pricing import router as pricing_router
from app.routers.pooling import router as pooling_router
from app.routers.transporter import router as transporter_router
from app.routers.admin import router as admin_router
from app.routers.notifications import router as notifications_router
from app.routers.voice import router as voice_router

__all__ = [
    "auth_router",
    "listings_router",
    "orders_router",
    "pricing_router",
    "pooling_router",
    "transporter_router",
    "admin_router",
    "notifications_router",
    "voice_router",
]
