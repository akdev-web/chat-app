// components/MessageInput.jsx
import { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-[var(--nav-head)] text-[var(--nav-text)] rounded-b-md">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded-md"
        placeholder="Type your message..."
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
