"use client";

import { useState, useEffect, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ChatBox } from "@/components/ChatBox";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatClientProps {
  userEmail: string;
}

export default function ChatClient({ userEmail }: ChatClientProps) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);

  const [chats, setChats] = useState<Chat[]>([]);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =========================
  // MOUNT
  // =========================

  useEffect(() => {
    setMounted(true);
  }, []);

  // =========================
  // SAVE CHAT ID
  // =========================

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("currentChatId", currentChatId);
    }
  }, [currentChatId]);

  // =========================
  // LOAD CHATS
  // =========================

  useEffect(() => {
    if (!mounted) return;

    const loadChats = async () => {
      try {
        const chatsRes = await fetch("/api/chats");

        if (!chatsRes.ok) {
          return;
        }

        const chatsData = await chatsRes.json();

        const formattedChats = chatsData.map((chat: any) => ({
          ...chat,

          createdAt: new Date(chat.createdAt),

          updatedAt: new Date(chat.updatedAt),
        }));

        setChats(
          formattedChats.sort((a: any, b: any) => {
            if (a.pinned === b.pinned) {
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            }

            return a.pinned ? -1 : 1;
          }),
        );

        // RESTORE SAVED CHAT
        const savedChatId = localStorage.getItem("currentChatId");

        if (
          savedChatId &&
          formattedChats.some((chat: Chat) => chat.id === savedChatId)
        ) {
          setCurrentChatId(savedChatId);
        } else if (formattedChats.length > 0) {
          setCurrentChatId(formattedChats[0].id);
        }
      } catch (error) {
        console.log(error);

        router.push("/");
      }
    };

    loadChats();
  }, [mounted, router]);

  // =========================
  // IMPORT SHARED CHAT
  // =========================

  useEffect(() => {
    if (!mounted) return;

    const shareId = searchParams.get("share");

    if (!shareId) return;

    const importSharedChat = async () => {
      try {
        // GET SHARED MESSAGES

        const messagesRes = await fetch(`/api/chats/${shareId}/messages`);

        if (!messagesRes.ok) {
          return;
        }

        const messagesData = await messagesRes.json();

        // CREATE NEW CHAT

        const createRes = await fetch("/api/chats", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: "Shared Conversation",
          }),
        });

        if (!createRes.ok) {
          return;
        }

        const newChat = await createRes.json();

        // COPY MESSAGES

        await fetch("/api/chats/import", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            chatId: newChat.id,

            messages: messagesData.messages,
          }),
        });

        // REFRESH CHATS

        const chatsRes = await fetch("/api/chats");

        const chatsData = await chatsRes.json();

        const formattedChats = chatsData.map((chat: any) => ({
          ...chat,

          createdAt: new Date(chat.createdAt),

          updatedAt: new Date(chat.updatedAt),
        }));

        setChats(formattedChats);

        // OPEN NEW CHAT

        setCurrentChatId(newChat.id);

        // REMOVE SHARE PARAM

        router.replace("/chat");
      } catch (error) {
        console.log(error);
      }
    };

    importSharedChat();
  }, [mounted, searchParams, router]);

  // =========================
  // LOAD MESSAGES
  // =========================

  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);

      return;
    }

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${currentChatId}/messages`);

        if (!res.ok) {
          setMessages([]);

          return;
        }

        const data = await res.json();

        setMessages(
          (data.messages || []).map((msg: any) => ({
            id: msg.id,

            role: msg.role,

            content: msg.content,

            timestamp: new Date(msg.timestamp),
          })),
        );
      } catch (error) {
        console.log(error);

        setMessages([]);
      }
    };

    loadMessages();
  }, [currentChatId]);

  // =========================
  // CREATE CHAT
  // =========================

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/chats", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: "New Chat",
        }),
      });

      if (!res.ok) return;

      const newChat = await res.json();

      const formattedChat = {
        ...newChat,

        createdAt: new Date(newChat.createdAt),

        updatedAt: new Date(newChat.updatedAt),
      };

      setChats((prev) => [formattedChat, ...prev]);
      
      setCurrentChatId(formattedChat.id);

      setMessages([]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================
  // PIN CHAT
  // =========================

  const togglePinChat = useCallback(
    async (chatId: string, pinned: boolean) => {
      try {
        const res = await fetch(`/api/chats/${chatId}`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            pinned: !pinned,
          }),
        });

        if (!res.ok) {
          return;
        }

        setChats((prev) =>
          [...prev]
            .map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,

                    pinned: !pinned,
                  }
                : chat,
            )

            .sort((a, b) => {
              if (a.pinned === b.pinned) {
                return (
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
                );
              }

              return a.pinned ? -1 : 1;
            }),
        );
      } catch (error) {
        console.log(error);
      }
    },

    [],
  );

  // Send Message
  const sendMessage = useCallback(
    async (content: string, selectedFile?: File | null) => {
      try {
        let activeChatId = currentChatId;

        // =========================
        // CREATE CHAT
        // =========================

        if (!activeChatId) {
          const createRes = await fetch("/api/chats", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              title: "New Chat",
            }),
          });

          if (!createRes.ok) {
            return;
          }

          const newChat = await createRes.json();

          activeChatId = newChat.id;

          setCurrentChatId(activeChatId);

          setChats((prev) => [
            {
              ...newChat,

              createdAt: new Date(newChat.createdAt),

              updatedAt: new Date(newChat.updatedAt),
            },

            ...prev,
          ]);
        }

        // =========================
        // USER MESSAGE
        // =========================

        const userMessage: Message = {
          id: crypto.randomUUID(),

          role: "user",

          content: selectedFile
            ? `${content}\n\n📎 File: ${selectedFile.name}`
            : content,

          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        setIsLoading(true);

        // =========================
        // SEND API
        // =========================

        const formData = new FormData();

        formData.append("chatId", activeChatId || "");

        formData.append("message", content);

        // if file exists
        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        const res = await fetch("/api/chats/send", {
          method: "POST",

          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        const data = await res.json();

        // =========================
        // AI MESSAGE
        // =========================

        const assistantMessage: Message = {
          id: data.messageId || crypto.randomUUID(),

          role: "assistant",

          content: data.response || "No response",

          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // =========================
        // UPDATE CHAT TITLE
        // =========================

        const updatedTitle = content.trim().replace(/\n/g, " ").slice(0, 500);

        // UPDATE UI

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId &&
            (chat.title === "New Chat" || chat.title === "Untitled Chat")
              ? {
                  ...chat,

                  title: updatedTitle,

                  updatedAt: new Date(),
                }
              : chat,
          ),
        );

        // UPDATE DATABASE

        await fetch(`/api/chats/${activeChatId}`, {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: updatedTitle,
          }),
        });
      } catch (error) {
        console.log(error);

        setMessages((prev) => [
          ...prev,

          {
            id: crypto.randomUUID(),

            role: "assistant",

            content: "Something went wrong. Please try again.",

            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },

    [currentChatId, chats],
  );

  // =========================
  // DELETE CHAT
  // =========================

  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        const res = await fetch(`/api/chats/${chatId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          return;
        }

        // REMOVE CHAT FROM UI

        const remainingChats = chats.filter((chat) => chat.id !== chatId);

        setChats(remainingChats);

        // REMOVE LOCAL STORAGE

        const savedChatId = localStorage.getItem("currentChatId");

        if (savedChatId === chatId) {
          localStorage.removeItem("currentChatId");
        }

        // SWITCH CHAT

        if (currentChatId === chatId) {
          if (remainingChats.length > 0) {
            setCurrentChatId(remainingChats[0].id);
          } else {
            setCurrentChatId(null);

            setMessages([]);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },

    [chats, currentChatId],
  );

  // =========================
  // SHARE CHAT
  // =========================

  const shareChat = async (chatId: string) => {
    try {
      const shareUrl = `${window.location.origin}/chat?share=${chatId}`;

      await navigator.clipboard.writeText(shareUrl);

      alert("Chat link copied!");
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* SIDEBAR */}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId || undefined}
        onNewChat={createNewChat}
        onSelectChat={setCurrentChatId}
        onPinChat={togglePinChat}
        onDeleteChat={deleteChat}
        onShareChat={shareChat}
      />

      {/* MAIN */}

      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar
          userEmail={userEmail}
          onSidebarToggle={() => setIsSidebarOpen(true)}
        />

        <ChatBox
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
