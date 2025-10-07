import { useState, useRef } from "react";
import { Paperclip, Send, X } from "lucide-react";

export default function ChatInputV2({ onSend }) {
  const [message, setMessage] = useState("");
  const [previewImages, setPreviewImages] = useState([]);

  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() !== "" || previewImages.length > 0) {
      onSend({ text: message, images: previewImages.map(p=>p.file) });
      setMessage("");
      setPreviewImages([]);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map((file) => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
      
    }
    e.target.value = "";
  };

  const removePreview = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSend} className="flex flex-col border-t border-gray-300 bg-[var(--nav-head)] text-[var(--nav-text)]">
      {previewImages.length > 0 && (
        <div className="flex items-center gap-2 p-2 border-b border-gray-200 overflow-x-auto">
          {previewImages.map((img, index) => (
            <div key={index} className="relative w-16 h-16 flex-shrink-0">
              <img src={img.url} alt="Preview" className="w-16 h-16 object-cover rounded" />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-end gap-2 p-2">
        

        <textarea
          rows={1}
          value={message}
          onChange={handleInputChange}
          className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          style={{ height: "auto", maxHeight: "72px" }}
          onInput={(e) => {
            e.target.rows = 1;
            const lineCount = Math.min(3, e.target.scrollHeight / 24);
            e.target.rows = lineCount;
          }}
        />

        <button className="p-2 text-white hover:text-gray-400" type="button" onClick={handleAttachClick} >
          <Paperclip size={20} />
        </button>

        <button  className="p-2 text-white hover:text-gray-400">
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
