import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
} from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction?: (actionPayload: any) => void;
}

export const VoiceAssistantModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
}) => {
  const { user, locale, setActiveTab } = useAuth();

  const [inputLanguage, setInputLanguage] = useState<string>(
    locale === 'te' ? 'te-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; intent?: string; payload?: any; confirmed?: boolean }>
  >([
    {
      sender: 'assistant',
      text:
        locale === 'te'
          ? 'నమస్కారం! నేను కృషి వాయిస్ సహాయకుడిని. మీకు పంట ధరల అంచనా, లాభాల లెక్కలు లేదా అమ్మకాలలో సహాయం చేయగలను.'
          : locale === 'hi'
          ? 'नमस्ते! मैं कृषि वॉइस सहायक हूँ। आप मुझसे फसल का उचित भाव, मुनाफा कैलकुलेटर, या आर्डर स्थिति पूछ सकते हैं।'
          : 'Namaste! I am Krishi Voice Assistant. Ask me about fair crop prices, harvest pooling, profit calculations, or listing a new crop.',
    },
  ]);

  const [confirmationPending, setConfirmationPending] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Sync language choice with UI locale
    if (locale === 'te') setInputLanguage('te-IN');
    else if (locale === 'hi') setInputLanguage('hi-IN');
    else setInputLanguage('en-IN');
  }, [locale]);

  // Setup Web Speech Recognition API if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = inputLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleProcessMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            'Microphone access denied. You can type your request directly in the box below.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Please try tapping the microphone again.');
        } else {
          setSpeechError(`Speech recognition notice: ${event.error}. You can also type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechError(
        'Speech recognition not natively supported in this browser. Please type your query in the text box.'
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [inputLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setSpeechError(null);
      if (recognitionRef.current) {
        recognitionRef.current.lang = inputLanguage;
        try {
          recognitionRef.current.start();
        } catch (e) {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      } else {
        setSpeechError('Speech recognition not available. Please type your request below.');
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = inputLanguage;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProcessMessage = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message
    setConversation((prev) => [...prev, { sender: 'user', text: queryText }]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await api.processVoiceCommand({
        text: queryText,
        language: inputLanguage,
        role: user?.role || 'farmer',
      });

      // Play audio response
      speakText(res.spoken_text);

      if (res.confirmation_required) {
        setConfirmationPending(res);
      }

      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.response_text,
          intent: res.interpreted_intent,
          payload: res.action_payload,
        },
      ]);

      // If action is non-destructive navigation
      if (!res.confirmation_required && res.action_payload) {
        executeDirectAction(res.action_payload);
      }
    } catch (err: any) {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Apologies, I encountered an issue processing that: ${err.message}`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDirectAction = (payload: any) => {
    if (payload.action === 'open_pricing') {
      setActiveTab('farmer-dashboard');
    } else if (payload.action === 'open_profit_calculator') {
      setActiveTab('farmer-dashboard');
    } else if (payload.action === 'view_orders') {
      setActiveTab('orders');
    } else if (payload.action === 'open_pooling') {
      setActiveTab('pooling');
    }
    if (onExecuteAction) onExecuteAction(payload);
  };

  const confirmAction = () => {
    if (confirmationPending) {
      executeDirectAction(confirmationPending.action_payload);
      setConfirmationPending(null);
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Action confirmed! Opening the requested module.',
        },
      ]);
      onClose();
    }
  };

  const cancelAction = () => {
    setConfirmationPending(null);
    setConversation((prev) => [
      ...prev,
      {
        sender: 'assistant',
        text: 'Action was cancelled as requested.',
      },
    ]);
  };

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '🍅 What is tomato fair price?', query: 'What is the estimated fair price for tomatoes?' },
    { label: '🌾 Sona Masoori Rice rate', query: 'What is the estimated fair price for my rice?' },
    { label: '💰 Calculate farmer net profit', query: 'Calculate my profit after transport costs' },
    { label: '🚚 Check order delivery status', query: 'Tell me whether my order has been delivered' },
    { label: 'తెలుగు: టమాటాల ధర అంచనా', query: 'నాకు టమాటాల ధర అంచనా చెప్పండి.' },
    { label: 'हिन्दी: फसल बेचने में मदद', query: 'मेरी फसल बेचने में मदद करें।' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#153D2B] text-[#F7F5EC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#286443] text-[#C7F36B] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold">Krishi Voice Assistant</h3>
              <p className="text-xs text-[#C7F36B]">Multilingual Kisan AI • Voice & Text</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language dropdown */}
            <select
              value={inputLanguage}
              onChange={(e) => setInputLanguage(e.target.value)}
              className="bg-[#286443] text-white text-xs rounded-lg px-2.5 py-1.5 border border-[#C7F36B]/30 outline-none"
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
              <option value="te-IN">తెలుగు (Telugu)</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F5EC]">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#153D2B] text-[#F7F5EC] rounded-tr-none'
                    : 'bg-white border border-[#DCE8D7] text-[#202820] rounded-tl-none'
                }`}
              >
                {msg.text}
                {msg.intent && (
                  <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-1.5 text-[11px] font-semibold text-[#286443]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recognized Intent: {msg.intent}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Action Confirmation Card */}
          {confirmationPending && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl my-2 animate-pulse-subtle">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Confirm Interpreted Voice Action
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    {confirmationPending.response_text}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={confirmAction}
                      className="px-3.5 py-1.5 bg-[#153D2B] text-[#C7F36B] rounded-lg text-xs font-bold hover:bg-[#286443] transition-colors"
                    >
                      Confirm & Proceed
                    </button>
                    <button
                      onClick={cancelAction}
                      className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-[#286443] font-medium p-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Krishi Voice is thinking and analyzing regional agricultural datasets...</span>
            </div>
          )}

          {speechError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{speechError}</span>
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Suggestions */}
        <div className="px-4 py-2 bg-[#DCE8D7]/30 border-t border-[#DCE8D7] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[#286443] font-bold flex-shrink-0">Try asking:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessMessage(p.query)}
              className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-[#C7F36B]/30 border border-[#DCE8D7] rounded-full text-[#153D2B] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar with Mic button */}
        <div className="p-4 bg-white border-t border-[#DCE8D7] flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-bounce shadow-lg ring-4 ring-red-200'
                : 'bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] shadow-md'
            }`}
            title={isListening ? 'Stop listening' : 'Start microphone'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcessMessage(inputText)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : inputLanguage === 'te-IN'
                ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                : inputLanguage === 'hi-IN'
                ? 'अपना प्रश्न यहाँ टाइप करें...'
                : 'Type your crop question or speak with mic...'
            }
            className="flex-1 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#286443]"
          />

          <button
            onClick={() => handleProcessMessage(inputText)}
            disabled={!inputText.trim()}
            className="p-3 bg-[#286443] disabled:opacity-40 text-white rounded-xl hover:bg-[#153D2B] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
