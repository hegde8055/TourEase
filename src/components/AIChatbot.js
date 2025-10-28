import React, { useState, useEffect, useRef, useCallback } from "react";
import { chatAPI } from "../utils/api";

// --- Main Chatbot Component ---
const AIChatbot = () => {
  // State management for the chatbot
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your TravelEase AI Assistant. I can help you discover amazing destinations, find hidden gems, get real-time travel information, and plan your perfect trip across India. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  // Refs for DOM elements to manage scroll and focus
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowId = "travelEaseChatWindow";

  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const maxHeight = 200;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  const scheduleTextareaResize = useCallback(() => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(adjustTextareaHeight);
    } else {
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [adjustTextareaHeight]);

  // Quick reply suggestions for travel queries
  const quickReplies = [
    "Best hill stations in Karnataka",
    "Tourist places near Bangalore",
    "Beach destinations in India",
    "Adventure activities in Coorg",
    "Best time to visit Hampi",
    "Hotels in Mysore",
  ];

  // Effect to scroll to the latest message whenever the messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to focus the input field when the chat window is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      adjustTextareaHeight();
    }
  }, [isOpen, adjustTextareaHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, isOpen, adjustTextareaHeight]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // --- Chatbot response via server proxy ---
  const getChatbotResponse = async (userMessage, conversationHistory) => {
    setIsTyping(true);

    const historyPayload = conversationHistory
      .filter((msg) => msg && msg.content)
      .slice(-10)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    try {
      const { reply } = await chatAPI.send({
        message: userMessage,
        history: historyPayload,
      });

      if (reply && reply.trim()) {
        return reply.trim();
      }

      return "I'm having a little trouble finding that information right now. Could you try asking in a different way? 🤔";
    } catch (error) {
      console.error("Error fetching chatbot response:", error);

      const serverMessage = error?.response?.data?.error;
      if (serverMessage) {
        return `I'm sorry, I'm having trouble reaching my travel knowledge right now: ${serverMessage}`;
      }

      return "I'm sorry, I'm having trouble connecting right now. Please check your connection and try again! 😊 You can also try asking about specific destinations like 'best places to visit in Karnataka' or 'tourist attractions near Bangalore'.";
    } finally {
      setIsTyping(false);
    }
  };

  // --- Event Handlers ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    scheduleTextareaResize();

    // Get the AI response and add it to the chat
    const aiResponse = await getChatbotResponse(userMessage.content, newMessages);
    const assistantMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages([...newMessages, assistantMessage]);
  };

  // Handles 'Enter' key press for sending message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handles clicking a quick reply button
  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => {
      inputRef.current?.focus();
      scheduleTextareaResize();
    }, 60);
  };

  // --- Helper Functions ---
  const escapeHtml = (text = "") =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatMessage = (text = "") => {
    if (!text) return "";

    const escaped = escapeHtml(text);
    const bolded = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return bolded.replace(/\n/g, "<br />");
  };
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // --- JSX Rendering ---
  return (
    <div className={`ai-chatbot${isOpen ? " open" : ""}`}>
      {!isOpen ? (
        // Toggle Button
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls={chatWindowId}
          title="Open Travel Assistant"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 18.5h18l-2.1-9.9-4.26 3.4L12 6.2l-2.64 5.8-4.26-3.4z" />
            <path d="M5 19.5h14v2H5z" />
          </svg>
          <span className="chatbot-badge">AI</span>
        </button>
      ) : (
        // Chat Window
        <div
          className="chatbot-window"
          id={chatWindowId}
          role="dialog"
          aria-label="TravelEase AI assistant"
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 18h18l-2.2-10.5-4.3 3.2L12 5l-2.5 5.7-4.3-3.2z" />
                  <path d="M5 19h14v2H5z" />
                </svg>
              </div>
              <div>
                <h3>TravelEase AI</h3>
                <div className="chatbot-status">
                  <div className="status-dot"></div>
                  <span>Online & Ready to Help</span>
                </div>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              aria-label="Close chat window"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                <div className="message-content">
                  {isTyping && message.role === "assistant" && index === messages.length - 1 ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <div
                      className="chatbot-message-body"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content || "") }}
                    />
                  )}
                </div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message assistant-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="chatbot-quick-replies">
              {quickReplies.slice(0, 3).map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                scheduleTextareaResize();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about destinations, travel tips, weather..."
              disabled={isTyping}
              rows={1}
              style={{
                minHeight: "20px",
                maxHeight: "200px",
                resize: "none",
                overflowY: "hidden",
              }}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="chatbot-footer">Powered by Google Gemini AI • Real-time travel data</div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
