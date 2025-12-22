import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, Phone, Mic, MicOff, Image, FileText, Paperclip, StopCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "document" | "audio";
  fileName?: string;
  fileUrl?: string;
  audioUrl?: string; // For TTS audio
}

const translations = {
  fr: {
    title: "KAPITA",
    subtitle: "Assistant AgriCapital",
    placeholder: "Tapez ou parlez...",
    welcome: "Bonjour ! Je suis KAPITA, votre assistant intelligent AgriCapital. Je peux échanger par texte, par voix, ou analyser vos images et documents. Comment puis-je vous aider ?",
    contactTeam: "Contacter l'équipe",
    close: "Fermer",
    recording: "Enregistrement en cours...",
    stopRecording: "Arrêter",
    attachFile: "Joindre un fichier",
    voiceMessage: "Message vocal",
    processingVoice: "Traitement de la voix...",
    processingFile: "Analyse du fichier...",
    imageReceived: "Image reçue",
    documentReceived: "Document reçu",
  },
  en: {
    title: "KAPITA",
    subtitle: "AgriCapital Assistant",
    placeholder: "Type or speak...",
    welcome: "Hello! I'm KAPITA, your intelligent AgriCapital assistant. I can chat via text, voice, or analyze your images and documents. How can I help you?",
    contactTeam: "Contact the team",
    close: "Close",
    recording: "Recording...",
    stopRecording: "Stop",
    attachFile: "Attach file",
    voiceMessage: "Voice message",
    processingVoice: "Processing voice...",
    processingFile: "Analyzing file...",
    imageReceived: "Image received",
    documentReceived: "Document received",
  },
  ar: {
    title: "كابيتا",
    subtitle: "مساعد أجريكابيتال",
    placeholder: "اكتب أو تحدث...",
    welcome: "مرحباً! أنا كابيتا، مساعدك الذكي في أجريكابيتال. يمكنني التواصل عبر النص أو الصوت أو تحليل صورك ووثائقك. كيف يمكنني مساعدتك؟",
    contactTeam: "اتصل بالفريق",
    close: "إغلاق",
    recording: "جاري التسجيل...",
    stopRecording: "إيقاف",
    attachFile: "إرفاق ملف",
    voiceMessage: "رسالة صوتية",
    processingVoice: "معالجة الصوت...",
    processingFile: "تحليل الملف...",
    imageReceived: "تم استلام الصورة",
    documentReceived: "تم استلام المستند",
  },
  es: {
    title: "KAPITA",
    subtitle: "Asistente AgriCapital",
    placeholder: "Escribe o habla...",
    welcome: "¡Hola! Soy KAPITA, tu asistente inteligente de AgriCapital. Puedo chatear por texto, voz o analizar tus imágenes y documentos. ¿Cómo puedo ayudarte?",
    contactTeam: "Contactar equipo",
    close: "Cerrar",
    recording: "Grabando...",
    stopRecording: "Detener",
    attachFile: "Adjuntar archivo",
    voiceMessage: "Mensaje de voz",
    processingVoice: "Procesando voz...",
    processingFile: "Analizando archivo...",
    imageReceived: "Imagen recibida",
    documentReceived: "Documento recibido",
  },
  de: {
    title: "KAPITA",
    subtitle: "AgriCapital Assistent",
    placeholder: "Tippen oder sprechen...",
    welcome: "Hallo! Ich bin KAPITA, Ihr intelligenter AgriCapital-Assistent. Ich kann per Text, Sprache chatten oder Ihre Bilder und Dokumente analysieren. Wie kann ich Ihnen helfen?",
    contactTeam: "Team kontaktieren",
    close: "Schließen",
    recording: "Aufnahme läuft...",
    stopRecording: "Stoppen",
    attachFile: "Datei anhängen",
    voiceMessage: "Sprachnachricht",
    processingVoice: "Sprache wird verarbeitet...",
    processingFile: "Datei wird analysiert...",
    imageReceived: "Bild erhalten",
    documentReceived: "Dokument erhalten",
  },
  zh: {
    title: "KAPITA",
    subtitle: "AgriCapital助手",
    placeholder: "输入或说话...",
    welcome: "您好！我是KAPITA，您的AgriCapital智能助手。我可以通过文字、语音聊天，或分析您的图片和文档。我能帮您什么？",
    contactTeam: "联系团队",
    close: "关闭",
    recording: "录音中...",
    stopRecording: "停止",
    attachFile: "附加文件",
    voiceMessage: "语音消息",
    processingVoice: "处理语音中...",
    processingFile: "分析文件中...",
    imageReceived: "已收到图片",
    documentReceived: "已收到文档",
  },
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [visitorId] = useState(() => `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;
  const isRTL = language === "ar";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.welcome }]);
    }
  }, [isOpen, t.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Text-to-Speech function
  const speakText = useCallback(async (text: string) => {
    if (!isTTSEnabled || !text || text.length < 10) return;
    
    try {
      setIsPlayingAudio(true);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: text.slice(0, 500), language }),
      });

      if (!response.ok) {
        console.error("TTS request failed:", response.status);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlayingAudio(false);
    }
  }, [isTTSEnabled, language]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
  }, []);

  const streamChat = useCallback(async (userMessages: Message[], attachedFile?: { type: string; content: string; name: string }) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages.map(m => ({ role: m.role, content: m.content })), 
        visitorId, 
        language,
        attachment: attachedFile 
      }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Speak the response if TTS is enabled
    if (assistantContent && isTTSEnabled) {
      speakText(assistantContent);
    }

    return assistantContent;
  }, [visitorId, language, isTTSEnabled, speakText]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(newMessages.filter(m => m.content !== t.welcome));
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre équipe au 05 64 55 17 17." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Add user message indicating voice input
        const userMessage: Message = { 
          role: "user", 
          content: `🎤 ${t.voiceMessage}`,
          type: "audio"
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
          await streamChat(newMessages.filter(m => m.content !== t.welcome), {
            type: 'audio',
            content: base64Audio,
            name: 'voice-message.webm'
          });
        } catch (error) {
          console.error("Voice chat error:", error);
          setMessages(prev => [...prev, { role: "assistant", content: "Désolé, je n'ai pas pu traiter votre message vocal. Essayez de taper votre message." }]);
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      console.error("Error processing voice:", error);
      toast.error("Erreur lors du traitement de la voix");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // File handling
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Le fichier est trop volumineux (max 5MB)");
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isDocument = file.type === 'application/pdf' || 
                       file.type.includes('document') ||
                       file.type.includes('text');

    if (!isImage && !isDocument) {
      toast.error("Type de fichier non supporté. Utilisez des images ou des documents PDF/texte.");
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Content = reader.result as string;
        
        const userMessage: Message = { 
          role: "user", 
          content: isImage ? `📷 ${t.imageReceived}: ${file.name}` : `📄 ${t.documentReceived}: ${file.name}`,
          type: isImage ? "image" : "document",
          fileName: file.name,
          fileUrl: base64Content
        };
        
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        try {
          await streamChat(newMessages.filter(m => m.content !== t.welcome), {
            type: isImage ? 'image' : 'document',
            content: base64Content,
            name: file.name
          });
        } catch (error) {
          console.error("File chat error:", error);
          setMessages(prev => [...prev, { role: "assistant", content: "Désolé, je n'ai pas pu analyser ce fichier. Pouvez-vous me décrire son contenu ?" }]);
        }
      };
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Erreur lors du traitement du fichier");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const scrollToContact = () => {
    setIsOpen(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-[99990] w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-bounce`}
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
          boxShadow: '0 8px 32px rgba(22, 101, 52, 0.4)',
        }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-amber-400 rounded-full animate-ping" />
      </button>

      {/* Chat window - Fully responsive */}
      {isOpen && (
        <div
          className={`fixed z-[99995] flex flex-col overflow-hidden animate-scale-in
            /* Mobile: Full screen minus safe areas */
            inset-2 sm:inset-auto
            /* Tablet and up: Positioned bottom-right */
            sm:bottom-20 md:bottom-24 
            ${isRTL ? 'sm:left-4' : 'sm:right-4'} 
            sm:w-[380px] sm:max-w-[calc(100vw-2rem)] 
            sm:h-[500px] md:h-[550px] sm:max-h-[75vh]
            rounded-2xl sm:rounded-2xl shadow-2xl`}
          style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{t.title}</h3>
                <p className="text-white/80 text-xs">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* TTS Toggle */}
              <button
                onClick={() => {
                  if (isPlayingAudio) {
                    stopAudio();
                  } else {
                    setIsTTSEnabled(!isTTSEnabled);
                  }
                }}
                className={`p-2 rounded-full transition-colors ${
                  isTTSEnabled ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-white/20'
                }`}
                title={isTTSEnabled ? "Désactiver la voix" : "Activer la voix"}
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-5 h-5 text-white animate-pulse" />
                ) : isTTSEnabled ? (
                  <Volume2 className="w-5 h-5 text-white" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/60" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={t.close}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? (isRTL ? "flex-row-reverse" : "flex-row") : ""} gap-2`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-green-700" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  {/* Show image preview if it's an image message */}
                  {msg.type === "image" && msg.fileUrl && (
                    <img 
                      src={msg.fileUrl} 
                      alt={msg.fileName || "Image"} 
                      className="max-w-full rounded-lg mb-2 max-h-32 object-cover"
                    />
                  )}
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-green-700 text-white ml-auto"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    style={{
                      borderRadius: msg.role === "user"
                        ? (isRTL ? '18px 18px 4px 18px' : '18px 18px 18px 4px')
                        : (isRTL ? '18px 18px 18px 4px' : '18px 18px 4px 18px'),
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {(isLoading || isProcessingVoice) && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-700" />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-green-700" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{t.recording}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={stopRecording}
                className="text-red-600 hover:bg-red-100"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                {t.stopRecording}
              </Button>
            </div>
          )}

          {/* Contact team button */}
          <div className="px-4 pb-2">
            <button
              onClick={scrollToContact}
              className="w-full py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-3 h-3" />
              {t.contactTeam}
            </button>
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2 items-center">
              {/* Attachment button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isRecording}
                className="flex-shrink-0 text-gray-500 hover:text-green-700"
                title={t.attachFile}
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              {/* Voice button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isProcessingVoice}
                className={`flex-shrink-0 ${isRecording ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-green-700'}`}
                title={t.voiceMessage}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-green-500 text-sm min-w-0"
                disabled={isLoading || isRecording}
              />

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || isRecording}
                className="w-12 h-12 rounded-full bg-green-700 hover:bg-green-800 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
