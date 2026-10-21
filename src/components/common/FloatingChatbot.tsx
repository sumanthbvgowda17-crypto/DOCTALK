import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendToGroq } from '../../lib/groqService';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url: string; // object URL or data URL
    base64?: string;
  };
}

interface GroqHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_REPLIES = ['👋 Hello', '❓ What can you do?', '🩺 How to consult?', '📡 Network info', '🏥 Symptom triage'];

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi there! 👋 I'm **DocBot**, your AI-powered DocTalk assistant. I can answer any questions — try asking me anything, attach images, or use voice input!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatMessage['attachment'] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const conversationHistory = useRef<GroqHistoryMessage[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Clean up camera stream on unmount or close
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ─── Send Message ───
  const sendMessage = useCallback(async (text: string, attachment?: ChatMessage['attachment']) => {
    if (!text.trim() && !attachment) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim() || (attachment ? `📎 Sent ${attachment.type === 'image' ? 'an image' : 'a file'}: ${attachment.name}` : ''),
      timestamp: new Date(),
      attachment
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setPendingAttachment(null);
    setIsTyping(true);

    // Build conversation history for Groq
    conversationHistory.current.push({
      role: 'user',
      content: userMsg.text
    });

    // Keep last 20 messages for context
    if (conversationHistory.current.length > 20) {
      conversationHistory.current = conversationHistory.current.slice(-20);
    }

    try {
      const reply = await sendToGroq(
        conversationHistory.current,
        attachment?.base64
      );

      conversationHistory.current.push({
        role: 'assistant',
        content: reply
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "Sorry, I couldn't process that. Please try again! 🔄",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue, pendingAttachment ?? undefined);
  };

  // ─── Microphone (Speech-to-Text) ───
  const toggleMicrophone = useCallback(() => {
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setMessages(prev => [...prev, {
        id: `bot-mic-${Date.now()}`,
        sender: 'bot',
        text: "⚠️ Speech recognition is not supported in your browser. Try Chrome or Edge.",
        timestamp: new Date()
      }]);
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  // ─── Camera Capture ───
  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      streamRef.current = stream;
      setIsCameraOpen(true);

      // Wait for videoRef to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setMessages(prev => [...prev, {
        id: `bot-cam-${Date.now()}`,
        sender: 'bot',
        text: "⚠️ Camera access denied or not available. Please check your browser permissions.",
        timestamp: new Date()
      }]);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];

    setPendingAttachment({
      type: 'image',
      name: `Camera_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
      url: dataUrl,
      base64
    });

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  // ─── File / Image Upload ───
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setPendingAttachment({
          type: 'image',
          name: file.name,
          url,
          base64
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPendingAttachment({
        type: 'file',
        name: file.name,
        url
      });
    }

    // Reset input so re-selecting same file works
    e.target.value = '';
  }, []);

  // ─── Render ───
  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-48 right-5 sm:bottom-52 sm:right-6 lg:bottom-48 lg:right-8 z-50 w-[380px] max-w-[calc(100vw-2.5rem)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="chatbot-window rounded-2xl overflow-hidden shadow-2xl shadow-black/25 dark:shadow-black/60 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col" style={{ height: '520px' }}>
          {/* Header */}
          <div className="chatbot-header px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center p-1.5 border border-white/20">
              <img src="/doctalk-icon.png" alt="DocBot AI" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight">DocBot AI Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/70 font-medium">Powered by Groq • Llama 3.3</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Camera Capture View */}
          {isCameraOpen && (
            <div className="relative bg-black shrink-0" style={{ height: '200px' }}>
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                <button
                  onClick={closeCamera}
                  className="w-10 h-10 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-white border-4 border-white/60 hover:scale-105 transition-transform shadow-xl"
                >
                  <span className="block w-full h-full rounded-full bg-white hover:bg-slate-100 transition-colors" />
                </button>
                <div className="w-10" />
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.sender === 'user' ? '' : ''}`}>
                  {/* Attached image preview */}
                  {msg.attachment?.type === 'image' && (
                    <div className={`mb-1.5 rounded-xl overflow-hidden border ${
                      msg.sender === 'user'
                        ? 'border-cyan-400/30'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}>
                      <img
                        src={msg.attachment.url}
                        alt={msg.attachment.name}
                        className="max-h-40 w-auto object-cover"
                      />
                    </div>
                  )}
                  {/* Attached file badge */}
                  {msg.attachment?.type === 'file' && (
                    <div className={`mb-1.5 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium ${
                      msg.sender === 'user'
                        ? 'bg-cyan-700/40 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                      </svg>
                      <span className="truncate">{msg.attachment.name}</span>
                    </div>
                  )}
                  {/* Text bubble */}
                  {msg.text && (
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-neutral-800 to-neutral-700 dark:from-neutral-200 dark:to-neutral-300 text-white dark:text-black rounded-br-md shadow-md shadow-black/20'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.text.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="typing-dot w-2 h-2 rounded-full bg-neutral-500" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot w-2 h-2 rounded-full bg-neutral-500" style={{ animationDelay: '150ms' }} />
                    <span className="typing-dot w-2 h-2 rounded-full bg-neutral-500" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && !isTyping && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_REPLIES.map(reply => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Pending Attachment Preview */}
          {pendingAttachment && (
            <div className="px-3 pt-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                {pendingAttachment.type === 'image' ? (
                  <img src={pendingAttachment.url} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <svg className="w-5 h-5 text-cyan-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                  </svg>
                )}
                <span className="flex-1 text-[12px] font-medium text-cyan-800 dark:text-cyan-200 truncate">{pendingAttachment.name}</span>
                <button
                  onClick={() => setPendingAttachment(null)}
                  className="w-6 h-6 rounded-full bg-cyan-200/60 dark:bg-cyan-800/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/60 hover:text-red-600 transition-colors shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="chatbot-input-area px-3 py-3 shrink-0">
            <div className="flex items-center gap-1.5">
              {/* Attachment buttons */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* File Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file or image"
                  className="w-9 h-9 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Camera */}
                <button
                  type="button"
                  onClick={openCamera}
                  title="Take a photo"
                  className="w-9 h-9 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                  </svg>
                </button>

                {/* Microphone */}
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isListening
                      ? 'text-red-500 bg-red-50 dark:bg-red-950/40 animate-pulse'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                </button>
              </div>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={isListening ? '🎙️ Listening...' : 'Ask anything...'}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400/40 focus:border-neutral-400 transition-all min-w-0"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() && !pendingAttachment}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-700 dark:from-neutral-200 dark:to-neutral-300 text-white dark:text-black flex items-center justify-center transition-all hover:shadow-lg hover:shadow-black/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Action Button (3D) */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Open DocBot chat"
        className={`chatbot-fab fixed bottom-28 right-5 sm:bottom-32 sm:right-6 lg:bottom-28 lg:right-8 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'rotate-0 scale-95' : 'rotate-0 scale-100'
        }`}
      >
        {/* Pulsing ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl animate-ping-slow bg-neutral-500/20" />
        )}

        {/* 3D body */}
        <span className="chatbot-fab-body absolute inset-0 rounded-2xl" />

        {/* Icon */}
        <span className="relative z-10 transition-transform duration-500">
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <img src="/doctalk-icon.png" alt="DocTalk AI" className="w-8 h-8 object-contain drop-shadow" />
          )}
        </span>

        {/* Notification badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/30 border-2 border-white dark:border-slate-900">
            AI
          </span>
        )}
      </button>
    </>
  );
};
