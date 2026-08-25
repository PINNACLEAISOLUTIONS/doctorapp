'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  MessageSquare, 
  RotateCcw,
  Loader2,
  Calendar,
  CheckCircle2,
  Terminal,
  User,
  Phone
} from 'lucide-react';

interface ChatWidgetProps {
  initialOpen?: boolean;
  businessName?: string;
  onNewBooking?: () => void;
}

const STORAGE_KEY = 'leadrescue_chat_messages';
const SESSION_KEY = 'leadrescue_chat_session_id';

export const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  initialOpen = false, 
  businessName = 'Apex Growth',
  onNewBooking
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [activeToolPill, setActiveToolPill] = useState<string | null>(null);

  const defaultGreeting = {
    role: 'assistant' as const,
    content: `Hello! Welcome to **${businessName}**. How can we help you today with service inquiries or scheduling a consultation?`
  };

  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    toolCalls?: any[];
    bookingConfirmed?: boolean;
  }>>([defaultGreeting]);

  // Load from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = sessionStorage.getItem(SESSION_KEY);
        if (savedSession) {
          setSessionId(savedSession);
        } else {
          const newSession = `sess_${Date.now()}`;
          sessionStorage.setItem(SESSION_KEY, newSession);
          setSessionId(newSession);
        }

        const savedMessages = sessionStorage.getItem(STORAGE_KEY);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.warn('SessionStorage error:', e);
      }
    }
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, activeToolPill, isOpen]);

  const handleResetChat = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
      const newSession = `sess_${Date.now()}`;
      sessionStorage.setItem(SESSION_KEY, newSession);
      setSessionId(newSession);
    }
    setMessages([defaultGreeting]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setActiveToolPill('Checking availability & processing request...');

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: sessionId || `sess_${Date.now()}`,
          history: newMessages.slice(-8)
        })
      });

      const data = await response.json();

      if (data.toolCallsExecuted && data.toolCallsExecuted.length > 0) {
        const toolNames = data.toolCallsExecuted.map((t: any) => t.name).join(', ');
        setActiveToolPill(`Action Executed: ${toolNames}`);
        setTimeout(() => setActiveToolPill(null), 3000);
      } else {
        setActiveToolPill(null);
      }

      if (data.bookingConfirmed && onNewBooking) {
        onNewBooking();
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.reply || 'Thank you! How else can I assist you?',
          toolCalls: data.toolCallsExecuted,
          bookingConfirmed: data.bookingConfirmed
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setActiveToolPill(null);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I've noted your inquiry. Could you provide your contact email or preferred time slot so we can confirm your request?"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What services and pricing do you offer?',
    'Check available times for tomorrow',
    'Book consultation for David (david@company.com) on 2026-08-28 at 10:30 AM'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 hover:scale-105 transition-all cursor-pointer"
          aria-label="Open Inbound Intake"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[370px] sm:w-[400px] h-[550px] rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-white text-xs font-bold">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Inbound Customer Intake</h4>
                <p className="text-[10px] text-slate-300">Live Online Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Tool Notification */}
          {activeToolPill && (
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="truncate">{activeToolPill}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => {
              const isCustomer = m.role === 'user';
              return (
                <div key={idx} className={`flex gap-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 space-y-1 ${
                    isCustomer 
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200/80'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                    {m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 font-mono">
                        {m.toolCalls.map((tc: any, tIdx: number) => (
                          <span key={tIdx} className="inline-block bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 mr-1">
                            ✓ {tc.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-slate-100 border border-slate-200 p-2.5 text-xs text-slate-600 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-700" />
                  <span>Processing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Starter Questions */}
          {messages.length <= 2 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Suggested Inquiries:</span>
              <div className="flex flex-col gap-1">
                {quickPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-[11px] text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200 transition-colors truncate"
                  >
                    • {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
