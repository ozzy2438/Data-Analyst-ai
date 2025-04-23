import React, { useState } from 'react';
import AIHeader from './layout/AIHeader';
import AIFooter from './layout/AIFooter';
import Sidebar from './layout/Sidebar';
import ChatContainer from './chat/ChatContainer';
import { Menu } from 'lucide-react';

const AIInterface: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AIHeader />
      
      <div className="flex flex-grow overflow-hidden">
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        
        <main className="flex-grow flex flex-col relative">
          {/* Mobile sidebar toggle */}
          <button 
            className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-md lg:hidden z-10"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-grow overflow-hidden">
            <ChatContainer />
          </div>
        </main>
      </div>
      
      <AIFooter />
    </div>
  );
};

export default AIInterface;
