import re
from typing import Dict, Any, List
from app.schemas.notification import VoiceCommandRequest, VoiceCommandResponse

# Configurable language registry
SUPPORTED_VOICE_LANGUAGES = {
    "en-IN": {
        "code": "en-IN",
        "name": "English (India)",
        "native_name": "English",
        "tts_voice": "en-IN",
        "supports_stt": True,
        "supports_tts": True
    },
    "te-IN": {
        "code": "te-IN",
        "name": "Telugu",
        "native_name": "తెలుగు",
        "tts_voice": "te-IN",
        "supports_stt": True,
        "supports_tts": True
    },
    "hi-IN": {
        "code": "hi-IN",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "tts_voice": "hi-IN",
        "supports_stt": True,
        "supports_tts": True
    }
}

class VoiceService:
    @staticmethod
    def get_supported_languages() -> List[Dict[str, Any]]:
        return list(SUPPORTED_VOICE_LANGUAGES.values())

    @staticmethod
    def parse_command(req: VoiceCommandRequest) -> VoiceCommandResponse:
        raw_text = req.text.strip().lower()
        lang = req.language
        
        # 1. Price Inquiry Intent
        if any(w in raw_text for w in ["price", "rate", "cost", "ధర", "భావం", "भाव", "कीमत", "అంచనా", "రేటు"]):
            # Extract produce name
            produce = "Tomatoes"
            if any(w in raw_text for w in ["rice", "బియ్యం", "चावल", "धान"]):
                produce = "Sona Masoori Rice"
            elif any(w in raw_text for w in ["onion", "ఉల్లి", "प्याज"]):
                produce = "Nashik Red Onion"
            elif any(w in raw_text for w in ["mango", "మామిడి", "आम"]):
                produce = "Alphonso Mango"
            elif any(w in raw_text for w in ["chilli", "మిరప", "मिर्च"]):
                produce = "Guntur Green Chilli"
            
            if "te" in lang:
                resp_text = f"{produce} కి ప్రస్తుత అంచనా ధర క్వింటాల్ కు ₹3,200 లేదా కేజీకి ₹32. నేరుగా అమ్మితే 30% ఎక్కువ లాభం పొందవచ్చు."
                spoken = f"{produce} కి ప్రస్తుత మార్కెట్ మోడల్ ధర కేజీకి ముప్పై రెండు రూపాయలు."
            elif "hi" in lang:
                resp_text = f"{produce} का उचित बाज़ार मूल्य ₹32 प्रति किलोग्राम है। सीधे खरीदार को बेचने पर आपको 30% अतिरिक्त लाभ मिलेगा।"
                spoken = f"{produce} का अनुमानित उचित मूल्य बत्तीस रुपये प्रति किलो है।"
            else:
                resp_text = f"The estimated fair price for {produce} is ₹32.00/kg. Listing directly on KrishiDirect saves ~₹8.50/kg in mandi commissions."
                spoken = f"The estimated fair price for {produce} is thirty-two rupees per kilogram."
                
            return VoiceCommandResponse(
                interpreted_intent="PRICE_INQUIRY",
                confidence=0.92,
                detected_entities={"produce": produce, "unit": "kg"},
                response_text=resp_text,
                spoken_text=spoken,
                action_payload={"action": "open_pricing", "produce": produce},
                confirmation_required=False,
                language=lang
            )

        # 2. Produce Listing Intent
        elif any(w in raw_text for w in ["list", "sell", "అమ్మ", "పంట", "లిస్ట్", "बेच", "फसल", "दर्ज"]):
            produce = "Fresh Tomatoes"
            if "rice" in raw_text or "వరి" in raw_text or "धान" in raw_text:
                produce = "Paddy / Rice"
            elif "onion" in raw_text or "ఉల్లి" in raw_text or "प्याज" in raw_text:
                produce = "Red Onions"
                
            if "te" in lang:
                resp_text = f"ఖచ్చితంగా, మీ {produce} పంటను లిస్ట్ చేద్దాం. అంచనా పరిమాణం మరియు మీ ధరను ధృవీకరించండి."
                spoken = f"మీ {produce} పంట నమోదు ఫారమ్ సిద్ధం చేసాను."
            elif "hi" in lang:
                resp_text = f"बिल्कुल, आपकी {produce} की नई लिस्टिंग तैयार की जा रही है। कृपया मात्रा और अपेक्षित मूल्य की पुष्टि करें।"
                spoken = f"आपकी {produce} फसल लिस्टिंग का फॉर्म खोला जा रहा है।"
            else:
                resp_text = f"Ready to list your harvest of {produce}! I have pre-filled the listing form with regional grade suggestions. Please review and confirm."
                spoken = f"I am preparing the listing form for your {produce}."

            return VoiceCommandResponse(
                interpreted_intent="LIST_PRODUCE",
                confidence=0.94,
                detected_entities={"produce": produce, "category": "vegetables"},
                response_text=resp_text,
                spoken_text=spoken,
                action_payload={"action": "open_listing_modal", "produce": produce},
                confirmation_required=True,
                language=lang
            )

        # 3. Profit Calculation Intent
        elif any(w in raw_text for w in ["profit", "calculate", "లాభం", "కాలిక్యులేటర్", "मुनाफा", "बचत", "ఖర్చు"]):
            if "te" in lang:
                resp_text = "రైతు లాభాల కాలిక్యులేటర్ తెరవబడింది. రవాణా పూలింగ్ ద్వారా మీరు 60% వరకు ఖర్చులను తగ్గించుకోవచ్చు."
                spoken = "రైతు లాభాల కాలిక్యులేటర్ సిద్ధంగా ఉంది."
            elif "hi" in lang:
                resp_text = "किसान मुनाफा कैलकुलेटर खुल गया है। सीधी बिक्री से आप अपनी प्रति क्विंटल आय 35% तक बढ़ा सकते हैं।"
                spoken = "किसान मुनाफा कैलकुलेटर तैयार है।"
            else:
                resp_text = "Farmer Profit Calculator loaded. Adjust production and freight assumptions to view your net margin."
                spoken = "Profit calculator opened. Direct selling increases net income by thirty-five percent."

            return VoiceCommandResponse(
                interpreted_intent="PROFIT_CALC",
                confidence=0.90,
                detected_entities={"tool": "profit_calculator"},
                response_text=resp_text,
                spoken_text=spoken,
                action_payload={"action": "open_profit_calculator"},
                confirmation_required=False,
                language=lang
            )

        # 4. Order & Delivery Status Intent
        elif any(w in raw_text for w in ["order", "delivered", "status", "డెలివరీ", "ఆర్డర్", "आर्डर", "डिलीवरी", "स्थिति"]):
            if "te" in lang:
                resp_text = "మీ తాజా ఆర్డర్ ట్రాన్సిట్ లో ఉంది. డ్రైవర్ సమీప కలెక్షన్ పాయింట్ వద్దకు 15 నిమిషాల్లో చేరుకుంటారు."
                spoken = "మీ ఆర్డర్ ట్రాన్సిట్ లో ఉంది. ఓటీపీ ధృవీకరణ కోసం సిద్ధంగా ఉండండి."
            elif "hi" in lang:
                resp_text = "आपका आर्डर मार्ग में है। डिलीवरी पार्टनर को हैंडओवर के समय 4-अंकों का डिलीवरी OTP अवश्य दिखाएं।"
                spoken = "आपका आर्डर रास्ते में है। कृपया डिलीवरी ओटीपी तैयार रखें।"
            else:
                resp_text = "Your order is in transit. Provide your 4-digit Delivery OTP to the transporter upon delivery."
                spoken = "Your order is in transit. Have your 4-digit OTP ready for handover."

            return VoiceCommandResponse(
                interpreted_intent="ORDER_STATUS",
                confidence=0.88,
                detected_entities={"status": "in_transit"},
                response_text=resp_text,
                spoken_text=spoken,
                action_payload={"action": "view_orders"},
                confirmation_required=False,
                language=lang
            )

        # 5. Smart Village Pooling Intent
        elif any(w in raw_text for w in ["pool", "pooling", "truck", "shared", "పూలింగ్", "రవాణా", "సామూహిక", "गाड़ी"]):
            if "te" in lang:
                resp_text = "మీ గ్రామ క్లస్టర్ లో యాక్టివ్ హార్వెస్ట్ పూల్స్ అందుబాటులో ఉన్నాయి. ఉమ్మడి రవాణా ద్వారా ₹2.70/కేజీ ఆదా చేయవచ్చు."
                spoken = "మీ గ్రామ హార్వెస్ట్ పూల్ వివరాలు చూపించబడుతున్నాయి."
            elif "hi" in lang:
                resp_text = "आपके गांव में संयुक्त हार्वेस्ट पूलिंग सक्रिय है। साझा वाहन से माल भेजने पर ₹1,500 से अधिक भाड़ा बचता है।"
                spoken = "ग्राम पूलिंग विकल्प उपलब्ध हैं।"
            else:
                resp_text = "Village harvest pooling allows nearby farmers to share EV cargo trucks, saving ~60% in individual freight costs."
                spoken = "Village harvest pooling opened. You can save up to sixty percent on transport."

            return VoiceCommandResponse(
                interpreted_intent="HARVEST_POOLING",
                confidence=0.89,
                detected_entities={"module": "pooling"},
                response_text=resp_text,
                spoken_text=spoken,
                action_payload={"action": "open_pooling"},
                confirmation_required=False,
                language=lang
            )

        # Default fallback
        else:
            if "te" in lang:
                resp_text = f"క్షమించండి, నేను మీ అభ్యర్థనను స్పష్టంగా గ్రహించలేకపోయాను: '{req.text}'. మీరు పంట లిస్టింగ్, ధర అంచనా, లేదా ఆర్డర్ సమాచారం అడగవచ్చు."
                spoken = "దయచేసి మీ అభ్యర్థనను మరోసారి చెప్పండి."
            elif "hi" in lang:
                resp_text = f"माफ़ कीजिए, मैं आपकी बात पूरी तरह समझ नहीं पाया: '{req.text}'. आप फसल लिस्टिंग, बाज़ार भाव, या आर्डर स्थिति पूछ सकते हैं।"
                spoken = "कृपया अपना अनुरोध पुनः बोलें।"
            else:
                resp_text = f"I heard: '{req.text}'. You can ask me to estimate crop prices, calculate farmer profit, list a harvest, or check order deliveries."
                spoken = "I can assist with price estimates, harvest listings, profit calculations, or order status."

            return VoiceCommandResponse(
                interpreted_intent="UNKNOWN",
                confidence=0.45,
                detected_entities={},
                response_text=resp_text,
                spoken_text=spoken,
                action_payload=None,
                confirmation_required=False,
                language=lang
            )
