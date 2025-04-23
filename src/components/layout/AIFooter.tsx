import React from 'react';
import { Info } from 'lucide-react';

const AIFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-500">
      <div className="flex items-center justify-center">
        <Info className="h-3 w-3 mr-1" />
        <span>
          Julius AI, OpenAI teknolojisi kullanılarak geliştirilmiştir. 
          Yanıtlar her zaman doğru olmayabilir.
        </span>
      </div>
    </footer>
  );
};

export default AIFooter;
