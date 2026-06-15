"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Chat {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onPinChat: (chatId: string, pinned: boolean) => void;
  onDeleteChat: (chatId: string) => void;
  onShareChat: (chatId: string) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onPinChat,
  onDeleteChat,
  onShareChat,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Chats
          </h3>
        </div>

        <AnimatePresence>
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
            >
              <div
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 rounded-lg transition-all duration-200 group relative cursor-pointer ${
                  currentChatId === chat.id
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-sm"
                    : "hover:bg-white hover:shadow-sm border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>

                      <p className="text-sm font-medium text-gray-700 truncate">
                        {chat.title || "New Conversation"}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-1 ml-6">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Pin Button */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      onPinChat(chat.id, chat.pinned);
                    }}
                    className={` flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200

    ${
      chat.pinned
        ? `
          bg-gradient-to-br
          from-yellow-400
          to-orange-500

          text-white

          shadow-md
          scale-105
        `
        : `
          text-gray-400

          hover:bg-gray-100
          hover:text-gray-700
        `
    }
  `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`
      w-4
      h-4

      transition-transform
      duration-200

      ${chat.pinned ? "rotate-45" : ""}
    `}
                      viewBox="0 0 24 24"
                      fill={chat.pinned ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 17v5m0-5l-4-4m4 4l4-4m-7-9h6l1 6H8l1-6z"
                      />
                    </svg>
                  </button>

                  {/* Share Button */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      onShareChat(chat.id);
                    }}
                    className="
    p-1
    rounded-lg

    text-gray-400

    hover:bg-blue-100
    hover:text-blue-600

    transition-colors
  "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C9.886 12.448 11.365 12 13 12c1.635 0 3.114.448 4.316 1.342M15 6a3 3 0 11-6 0 3 3 0 016 0zm6 14a9 9 0 10-18 0h18z"
                      />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  {hoveredChatId === chat.id && (
                    <motion.button
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {chats.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            <p className="text-sm text-gray-400">No conversations yet</p>

            <p className="text-xs text-gray-300 mt-1">Start a new chat!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 text-center">
          <p>Secure conversation</p>

          <p className="mt-1">End-to-end encrypted</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{
                type: "spring",
                damping: 25,
              }}
              className="fixed left-0 top-0 h-screen w-64 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
