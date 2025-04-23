import React from 'react';
import { HelpCircle, Settings, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto py-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-600 font-bold text-lg">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Julius AI</h1>
                <p className="text-xs opacity-80">Veri Analiz Platformu</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-primary-500 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-primary-500 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-primary-600">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;