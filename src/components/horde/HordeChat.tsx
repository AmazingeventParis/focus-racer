"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSSENotifications } from "@/hooks/useSSENotifications";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";

interface Participant {
  userId: string;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface Conversation {
  id: string;
  type: "GROUP" | "DM";
  name: string | null;
  participants: Participant[];
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface AcceptedMember {
  userId: string;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface HordeChatProps {
  hordeId: string;
  acceptedMembers: AcceptedMember[];
}

export default function HordeChat({ hordeId, acceptedMembers }: HordeChatProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showList, setShowList] = useState(true); // mobile: toggle list/thread

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/sportif/horde/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // Update active conversation data if still selected
        if (activeConv) {
          const updated = data.find((c: Conversation) => c.id === activeConv.id);
          if (updated) setActiveConv(updated);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeConv]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // SSE: refresh on horde_message events
  const handleSSE = useCallback(() => {
    fetchConversations();
    setRefreshTrigger((prev) => prev + 1);
  }, [fetchConversations]);

  useSSENotifications(["horde_message"], handleSSE);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setShowList(false);
    // Mark as read
    fetch(`/api/sportif/horde/conversations/${conv.id}/read`, { method: "PATCH" });
    // Refresh to clear badge
    setTimeout(fetchConversations, 500);
  };

  const handleBack = () => {
    setShowList(true);
    fetchConversations();
  };

  const getConvDisplayName = (conv: Conversation): string => {
    if (conv.type === "GROUP") return conv.name || "Groupe";
    const partner = conv.participants.find((p) => p.userId !== currentUserId);
    return partner?.user.name || "Message direct";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl bg-white overflow-hidden" style={{ height: "600px" }}>
      {/* Desktop: 2 columns */}
      <div className="hidden md:flex h-full">
        <div className="w-80 border-r flex-shrink-0">
          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id || null}
            onSelect={handleSelectConversation}
            members={acceptedMembers}
            hordeId={hordeId}
            currentUserId={currentUserId}
            onConversationCreated={fetchConversations}
          />
        </div>
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <MessageThread
              conversationId={activeConv.id}
              conversationName={getConvDisplayName(activeConv)}
              conversationType={activeConv.type}
              participants={activeConv.participants}
              currentUserId={currentUserId}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Sélectionnez une conversation</p>
                <p className="text-xs text-muted-foreground mt-1">ou créez-en une nouvelle</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: 1 column with toggle */}
      <div className="md:hidden h-full">
        {showList ? (
          <ConversationList
            conversations={conversations}
            activeId={null}
            onSelect={handleSelectConversation}
            members={acceptedMembers}
            hordeId={hordeId}
            currentUserId={currentUserId}
            onConversationCreated={fetchConversations}
          />
        ) : activeConv ? (
          <div className="flex flex-col h-full">
            {/* Back button */}
            <div className="px-3 py-2 border-b bg-white">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Retour
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MessageThread
                conversationId={activeConv.id}
                conversationName={getConvDisplayName(activeConv)}
                conversationType={activeConv.type}
                participants={activeConv.participants}
                currentUserId={currentUserId}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
