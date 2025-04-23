import React from 'react';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  // Sample chat history
  const chatHistory = [
    { id: 1, title: 'Proje planlaması hakkında', date: '23 Nis' },
    { id: 2, title: 'Veri analizi soruları', date: '22 Nis' },
    { id: 3, title: 'Pazarlama stratejileri', date: '20 Nis' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {visible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-50 border-r border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out
        ${visible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:z-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              <span>Yeni Sohbet</span>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Son Sohbetler
              </h2>
            </div>
            
            <ul className="space-y-1 px-2">
              {chatHistory.map(chat => (
                <li key={chat.id}>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 flex items-start group">
                    <MessageSquare className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500">{chat.date}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center text-gray-700 hover:text-gray-900">
              <Settings className="h-5 w-5 mr-2" />
              <span className="text-sm">Ayarlar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
