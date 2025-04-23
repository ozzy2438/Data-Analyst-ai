import React from 'react';
import { Menu, Settings, HelpCircle } from 'lucide-react';

const AIHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-gray-100 lg:hidden">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="ml-3 lg:ml-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Julius AI</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-medium text-sm">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AIHeader;
