"use client";

import { Button } from "@/components/ui/button";
import CreateGroupDialog from "./CreateGroupDialog";
import CreateDMDialog from "./CreateDMDialog";

interface ConversationParticipant {
  userId: string;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface Conversation {
  id: string;
  type: "GROUP" | "DM";
  name: string | null;
  participants: ConversationParticipant[];
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Member {
  userId: string;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  members: Member[];
  hordeId: string;
  currentUserId: string;
  onConversationCreated: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  members,
  hordeId,
  currentUserId,
  onConversationCreated,
}: ConversationListProps) {
  const getDisplayName = (conv: Conversation): string => {
    if (conv.type === "GROUP") return conv.name || "Groupe";
    const partner = conv.participants.find((p) => p.userId !== currentUserId);
    return partner?.user.name || "Message direct";
  };

  const getInitial = (conv: Conversation): string => {
    if (conv.type === "GROUP") return (conv.name || "G").charAt(0).toUpperCase();
    const partner = conv.participants.find((p) => p.userId !== currentUserId);
    return (partner?.user.name || "?").charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Actions */}
      <div className="p-3 border-b flex gap-2">
        <CreateGroupDialog
          members={members}
          hordeId={hordeId}
          onCreated={() => onConversationCreated()}
        >
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Groupe
          </Button>
        </CreateGroupDialog>
        <CreateDMDialog
          members={members}
          onCreated={() => onConversationCreated()}
        >
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            Message
          </Button>
        </CreateDMDialog>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Aucune conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Créez un groupe ou envoyez un message</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b border-gray-50 ${
                activeId === conv.id
                  ? "bg-emerald-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  conv.type === "GROUP"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {getInitial(conv)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{getDisplayName(conv)}</p>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {conv.lastMessage ? (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage.user.name.split(" ")[0]} : {conv.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic mt-0.5">Aucun message</p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
