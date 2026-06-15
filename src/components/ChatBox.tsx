"use client";

import { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  messages: Message[];

  onSendMessage: (message: string, file?: File | null) => Promise<void>;

  isLoading?: boolean;
}

export function ChatBox({
  messages,
  onSendMessage,
  isLoading = false,
}: ChatBoxProps) {
  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!input.trim() && !selectedFile) || isLoading) {
      return;
    }

    const message = input.trim() || "Analyze uploaded file";

    setInput("");

    setIsTyping(true);

    // Reset textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(message, selectedFile);

    setIsTyping(false);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSubmit(e);
    }
  };

  // Auto resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  };

  // =========================
  // VOICE RECOGNITION
  // =========================

  const startListening = () => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setInput((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  // FILE SELECT

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
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
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Welcome to ChatGPT
              </h2>

              <p className="text-gray-500 max-w-md mx-auto">Ask me anything!</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: idx * 0.05,
                  }}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Avatar */}
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={`flex-1 max-w-3xl ${
                      message.role === "user" ? "flex justify-end" : ""
                    }`}
                  >
                    <div
                      className={`inline-block p-4 max-w-full ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p({ children }) {
                                return (
                                  <div className="mb-3 leading-7">
                                    {children}
                                  </div>
                                );
                              },

                              code(props: any) {
                                const { children, className, ...rest } = props;

                                const match = /language-(\w+)/.exec(
                                  className || "",
                                );

                                // Inline code
                                if (!match) {
                                  return (
                                    <code
                                      className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm"
                                      {...rest}
                                    >
                                      {children}
                                    </code>
                                  );
                                }

                                // Code block
                                return (
                                  <div className="my-4 overflow-hidden rounded-xl">
                                    <pre className="bg-gray-900 text-gray-100 overflow-x-auto p-4 text-sm">
                                      <code className={className}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                );
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {/* Time */}
                    <p className="text-xs text-gray-400 mt-1 ml-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        You
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing */}
              {(isTyping || isLoading) && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full" />

                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: dot * 0.2,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <form
            onSubmit={handleSubmit}
            className="  relative  border  border-gray-200  rounded-2xl  bg-white  shadow-sm overflow-hidden "
          >
            {/* FILE PREVIEW */}

            {selectedFile && (
              <div className="px-4 pt-3">
                <div className="  inline-flex  items-center  gap-2  bg-gray-100  px-3  py-2  rounded-xl  text-sm ">
                  📎
                  <span className=" max-w-[200px] truncate text-gray-800 font-medium ">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* TEXTAREA */}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);

                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              rows={1}
              disabled={isLoading}
              className=" w-full  px-  pt-4  pb-16  bg-white  resize-none  focus:outline-none  text-black  placeholder:text-gray-400 "
              style={{
                minHeight: "80px",
                maxHeight: "200px",
              }}
            />

            {/* BOTTOM ACTIONS */}

            <div className=" absolute  bottom-3  left-3  right-3  flex   items-center  justify-between">
              {/* LEFT ACTIONS */}

              <div className="flex items-center gap-3">
                {/* FILE BUTTON */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-10 h-10 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 active:text-gray-900 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm cursor-pointer group"
                >
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Attach file
                  </span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 transition-transform duration-200 group-hover:rotate-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.5l-9.298 9.298a1.5 1.5 0 01-2.122-2.122L14.5 8.5"
                    />
                  </svg>
                </button>

                {/* HIDDEN INPUT */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* MIC BUTTON */}
                <button
                  type="button"
                  onClick={startListening}
                  className="relative w-10 h-10 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 active:text-blue-700 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm cursor-pointer group"
                >
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Voice input
                  </span>

                  {/* Animated mic icon */}
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 transition-all duration-200 group-hover:scale-105"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"
                      />
                    </svg>

                    {/* Pulse animation ring for listening state */}
                    {isListening && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="absolute w-full h-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                        <span className="absolute w-full h-full rounded-full bg-blue-500 animate-pulse"></span>
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* SEND BUTTON */}

              <button
                type="submit"
                disabled={(!input.trim() && !selectedFile) || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:from-indigo-700 enabled:hover:to-purple-700 enabled:hover:scale-105 enabled:active:scale-95 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transition-transform duration-200 group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:-translate-y-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 text-center mt-3">
            AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
