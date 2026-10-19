from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    action_link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VoiceCommandRequest(BaseModel):
    text: str
    language: str = "en-IN"  # en-IN, te-IN, hi-IN
    role: Optional[str] = "farmer"

class VoiceCommandResponse(BaseModel):
    interpreted_intent: str
    confidence: float
    detected_entities: dict
    response_text: str
    spoken_text: str
    action_payload: Optional[dict] = None
    confirmation_required: bool = False
    language: str
