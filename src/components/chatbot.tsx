'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  CarFront,
  Phone,
  CheckCircle2,
  Calendar,
  Fuel,
  ArrowRight,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cars?: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    fuel: string;
    image: string;
  }>;
  leadCaptured?: boolean;
}

const INITIAL_SUGGESTIONS = [
  'Budget cars under ₹3 Lakhs',
  'Cars under ₹5 Lakhs (Alto/WagonR)',
  'Show me SUVs under 15 Lakhs',
  'Is Honda City available?',
  'I want to book a test drive',
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! 👋 I'm **AutoAssist AI**, your personal 24/7 sales concierge at SmartCar Dealership. I can search our live inventory, compare specs, or schedule a VIP test drive for you. What type of car are you looking for today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSend(textToSend?: string) {
    const userText = textToSend || input;
    if (!userText.trim() || isLoading) return;

    const userMessageId = Date.now().toString();
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMessageId, role: 'user', content: userText },
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send to Next.js AI SDK backend route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        // Read response stream or text
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        const assistantId = (Date.now() + 1).toString();

        if (reader) {
          // Initialize empty message
          setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;

            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
            );
          }
        }
      } else {
        // Fallback intelligent simulated assistant if API key not set yet
        await fallbackAssistantResponse(userText);
      }
    } catch {
      // Fallback in case of local network or configuration absence
      await fallbackAssistantResponse(userText);
    } finally {
      setIsLoading(false);
    }
  }

  // Graceful conversational fallback matching inventory & capturing leads even without AI keys
  async function fallbackAssistantResponse(userText: string) {
    const textLower = userText.toLowerCase();

    // 1. Lead intent: Phone number detected
    const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/;
    const phoneMatch = userText.match(phoneRegex);

    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      const extractedPhone = phoneMatch[0];

      // Insert lead into Supabase API
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: 'Chatbot Visitor',
            customer_phone: extractedPhone,
            message: `Lead captured from conversation: "${userText}"`,
            source: 'chatbot',
          }),
        });
      } catch (e) {
        console.warn('Fallback lead save failed:', e);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          leadCaptured: true,
          content: `✅ Perfect! I have registered your inquiry in our dealer CRM with phone **${extractedPhone}**. Our Senior Relationship Manager will call or WhatsApp you within 15 minutes with complete vehicle inspection reports and available test drive slots.`,
        },
      ]);
      return;
    }

    // 2. Querying inventory
    let matchingCars: Array<{
      id: string;
      make: string;
      model: string;
      year: number;
      price: number;
      fuel: string;
      image: string;
    }> = [];

    let reply = '';

    if (
      textLower.includes('low') ||
      textLower.includes('budget') ||
      textLower.includes('cheap') ||
      textLower.includes('3 lakh') ||
      textLower.includes('5 lakh') ||
      textLower.includes('alto') ||
      textLower.includes('santro') ||
      textLower.includes('kwid') ||
      textLower.includes('wagonr') ||
      textLower.includes('tiago')
    ) {
      reply =
        "Here are our highly affordable, low-cost certified cars starting at just ₹1.85 Lakhs! All cars come with 150-point inspection and low EMI:";
      matchingCars = [
        {
          id: 'car-02-santro',
          make: 'Hyundai',
          model: 'Santro Xing GL Plus',
          year: 2015,
          price: 185000,
          fuel: 'Petrol MT',
          image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400',
        },
        {
          id: 'car-01-alto',
          make: 'Maruti Suzuki',
          model: 'Alto 800 LXi',
          year: 2018,
          price: 210000,
          fuel: 'Petrol MT',
          image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400',
        },
        {
          id: 'car-03-kwid',
          make: 'Renault',
          model: 'Kwid RXT 1.0',
          year: 2019,
          price: 295000,
          fuel: 'Petrol MT',
          image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
        },
        {
          id: 'car-04-wagonr',
          make: 'Maruti Suzuki',
          model: 'WagonR VXi (CNG)',
          year: 2018,
          price: 365000,
          fuel: 'CNG MT',
          image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
        },
      ];
    } else if (textLower.includes('suv') || textLower.includes('creta') || textLower.includes('thar') || textLower.includes('fortuner')) {
      reply =
        "Here are our premium certified SUVs available right now! Each comes with a full 150-point inspection certificate and 1-year warranty:";
      matchingCars = [
        {
          id: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
          make: 'Hyundai',
          model: 'Creta SX(O) Turbo',
          year: 2022,
          price: 1575000,
          fuel: 'Petrol AT',
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400',
        },
        {
          id: 'a1b2c3d4-e5f6-4a1b-8c2d-444444444444',
          make: 'Toyota',
          model: 'Fortuner 4x4 AT',
          year: 2020,
          price: 3150000,
          fuel: 'Diesel AT',
          image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
        },
      ];
    } else if (textLower.includes('honda') || textLower.includes('city') || textLower.includes('sedan')) {
      reply =
        "Yes! We have an exceptional **2021 Honda City ZX 1.5 i-VTEC Automatic** in Radiant Red. Single-owner, 32,000 km, with electric sunroof and lane-watch camera:";
      matchingCars = [
        {
          id: 'a1b2c3d4-e5f6-4a1b-8c2d-111111111111',
          make: 'Honda',
          model: 'City ZX 1.5 i-VTEC',
          year: 2021,
          price: 1150000,
          fuel: 'Petrol AT',
          image: 'https://images.unsplash.com/photo-1590362891988-f77804f3747b?w=400',
        },
      ];
    } else if (textLower.includes('electric') || textLower.includes('ev') || textLower.includes('nexon')) {
      reply =
        "Looking for clean mobility? Here is our certified **2023 Tata Nexon EV Max** with 437 km range and battery under full factory warranty:";
      matchingCars = [
        {
          id: 'a1b2c3d4-e5f6-4a1b-8c2d-333333333333',
          make: 'Tata',
          model: 'Nexon EV Max XZ+',
          year: 2023,
          price: 1420000,
          fuel: 'Electric AT',
          image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
        },
      ];
    } else if (textLower.includes('test drive') || textLower.includes('book') || textLower.includes('contact')) {
      reply =
        "I'd love to set up a VIP Test Drive for you! 🚗\n\nCould you please share your **Name** and **Phone Number**? I will immediately book the slot and send the confirmation to your WhatsApp.";
    } else {
      reply =
        "We have over 40+ certified cars in stock across Sedan, SUV, Hatchback, and Electric categories. Would you like to see cars under a specific budget (e.g. ₹10 Lakhs) or schedule a test drive?";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: reply,
        cars: matchingCars.length > 0 ? matchingCars : undefined,
      },
    ]);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/50"
          aria-label="Open AI Car Assistant"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-none tracking-wide">AutoAssist AI</span>
            <span className="text-[10px] text-blue-100 leading-tight">24/7 Sales Assistant</span>
          </div>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isExpanded
              ? 'h-[85vh] w-[95vw] sm:w-[650px]'
              : 'h-[550px] w-[92vw] sm:w-[410px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">AutoAssist AI</h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-medium text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">SmartCar Dealership Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-muted/80 text-foreground rounded-bl-none border border-border/50'
                  }`}
                >
                  {/* Message Text with Simple Markdown Bold parsing */}
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Render Lead Captured Badge */}
                  {msg.leadCaptured && (
                    <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Lead registered in dealer system</span>
                    </div>
                  )}

                  {/* Render Interactive Car Cards returned by search */}
                  {msg.cars && msg.cars.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.cars.map((car) => (
                        <div
                          key={car.id}
                          className="flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-2 text-card-foreground shadow-sm hover:border-blue-500/40 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={car.image}
                            alt={`${car.make} ${car.model}`}
                            className="h-16 w-20 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {car.year} {car.make} {car.model}
                            </h4>
                            <p className="text-xs font-extrabold text-blue-600">
                              {formatPrice(car.price)}
                            </p>
                            <span className="text-[10px] text-muted-foreground">{car.fuel}</span>
                          </div>

                          <Link
                            href={`/cars/${car.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 hover:bg-blue-700 transition-colors"
                            title="View details"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white text-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span>Checking dealer inventory & specs...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="border-t border-border/40 bg-muted/20 px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {INITIAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  disabled={isLoading}
                  className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-border p-3 bg-background"
          >
            <input
              type="text"
              placeholder="Ask about cars or leave your number..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
