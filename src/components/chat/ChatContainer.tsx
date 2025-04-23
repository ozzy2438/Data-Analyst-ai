import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import ChatInput from './ChatInput';
import { Loader2 } from 'lucide-react';
import { generateDemoResponse } from '../../services/openai';

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      role: 'assistant',
      content: 'Merhaba! Ben Julius AI. Size nasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessageProps = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // In a real application, we would call the OpenAI API here
      // For demo purposes, we're using a local function to generate responses
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      const responseContent = generateDemoResponse(content);

      // Add AI response
      const aiResponse: ChatMessageProps = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error processing message:', error);

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Üzgünüm, mesajınızı işlerken bir hata oluştu. Lütfen tekrar deneyin.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            content={msg.content}
            role={msg.role}
            timestamp={msg.timestamp}
          />
        ))}

        {isProcessing && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 p-3 rounded-lg flex items-center">
              <Loader2 className="h-5 w-5 text-gray-500 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Julius düşünüyor...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default ChatContainer;
