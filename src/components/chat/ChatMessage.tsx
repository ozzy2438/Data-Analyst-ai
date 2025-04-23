import React from 'react';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, timestamp }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
          ${isUser ? 'bg-blue-600 ml-3' : 'bg-gray-700 mr-3'}`}>
          {isUser ? (
            <span className="text-white text-sm font-bold">SEN</span>
          ) : (
            <span className="text-white text-sm font-bold">AI</span>
          )}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-lg ${
            isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
          
          {timestamp && (
            <span className="text-xs text-gray-500 mt-1">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
