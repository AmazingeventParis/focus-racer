"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { id: true; name: string; faceImagePath?: string | null };
  userId: string;
  _optimistic?: boolean;
}

interface Participant {
  userId: string;
  user: { id: string; name: string; sportifId: string | null };
}

interface MessageThreadProps {
  conversationId: string;
  conversationName: string;
  conversationType: "GROUP" | "DM";
  participants: Participant[];
  currentUserId: string;
  refreshTrigger: number;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Aujourd'hui";
  if (msgDate.getTime() === yesterday.getTime()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageThread({
  conversationId,
  conversationName,
  conversationType,
  participants,
  currentUserId,
  refreshTrigger,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/sportif/horde/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Fetch messages on mount and on refreshTrigger change
  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages, refreshTrigger]);

  // Mark as read when opening
  useEffect(() => {
    fetch(`/api/sportif/horde/conversations/${conversationId}/read`, { method: "PATCH" });
  }, [conversationId]);

  // Polling every 5s
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Scroll listener to detect if user is at bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial scroll to bottom
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      user: { id: true, name: "Moi" },
      userId: currentUserId,
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    isAtBottomRef.current = true;
    setSending(true);

    try {
      const res = await fetch(`/api/sportif/horde/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        // Refresh to get the real message
        await fetchMessages();
      }
    } catch {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Group messages by date
  let lastDateLabel = "";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          {conversationType === "GROUP" ? (
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm">{conversationName}</h3>
          <p className="text-xs text-muted-foreground">
            {participants.length} participant{participants.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Aucun message. Lancez la conversation !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const dateLabel = formatDateSeparator(msg.createdAt);
            const showDateSep = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;
            const isMe = msg.userId === currentUserId;

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-muted-foreground px-2">{dateLabel}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                  <div className={`max-w-[75%] ${isMe ? "order-2" : ""}`}>
                    {!isMe && conversationType === "GROUP" && (
                      <p className="text-xs text-muted-foreground mb-0.5 ml-1">{msg.user.name}</p>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        isMe
                          ? "bg-emerald-500 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      } ${msg._optimistic ? "opacity-60" : ""}`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-[10px] text-muted-foreground mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
