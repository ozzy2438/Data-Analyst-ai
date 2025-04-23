import React from 'react';
import { Info, Code } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto py-3 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <div className="flex items-center mb-2 md:mb-0">
            <Info className="h-4 w-4 mr-2" />
            <p>
              Julius AI, OpenAI teknolojisi kullanılarak geliştirilmiştir. Sonuçlar her zaman doğru olmayabilir.
            </p>
          </div>

          <div className="flex items-center">
            <p className="mr-4">&copy; {new Date().getFullYear()} Julius AI</p>
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <Code className="h-4 w-4 mr-1" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;