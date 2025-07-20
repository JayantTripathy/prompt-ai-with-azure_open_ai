import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_URL;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBox: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, { role: "assistant", content: "Analyzing..." }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/chat`, {
        messages: updatedMessages,
      });

      const assistantReply: Message = {
        role: "assistant",
        content: response.data.content,
      };

      setMessages((prev) => [...prev.slice(0, -1), assistantReply]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-form-container">
      <div className="chat-form-card">
        <div className="chat-form-header">
          Prompt pilot: Let's chat? - Online with AI
        </div>
        <div className="chat-form">
          <div className="chat-log" ref={chatLogRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role === "user" ? "chat-user" : "chat-assistant"}`}>
                <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.content}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">AI is typing...</div>}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
      <div className="love-label">❤️ with JT</div>
    </div>
  );
};

export default ChatBox;
