from fastapi import APIRouter, Depends
from app.schemas.notification import VoiceCommandRequest, VoiceCommandResponse
from app.services.voice_service import VoiceService

router = APIRouter(prefix="/api/voice", tags=["Krishi Voice Assistant"])

@router.get("/languages")
def get_supported_languages():
    """
    Returns configurable language registry for Speech-to-Text and Text-to-Speech synthesis.
    """
    return VoiceService.get_supported_languages()

@router.post("/process-command", response_model=VoiceCommandResponse)
def process_voice_command(payload: VoiceCommandRequest):
    """
    Parses multilingual audio transcription or text commands (English, Telugu, Hindi)
    and maps them to actionable platform intents with confirmation safeguards.
    """
    return VoiceService.parse_command(payload)
