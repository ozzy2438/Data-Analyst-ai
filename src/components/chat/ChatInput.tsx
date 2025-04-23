import React, { useState, KeyboardEvent } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isProcessing }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Bir mesaj yazın..."
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
        />
        
        <button 
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          onClick={handleSendMessage}
          disabled={!message.trim() || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
        
        <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
