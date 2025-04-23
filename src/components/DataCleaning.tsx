import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CleaningOptions } from './cleaning/CleaningOptions';
import { DuplicatesHandler } from './cleaning/DuplicatesHandler';
import { ColumnTypeManager } from './cleaning/ColumnTypeManager';
import { RefreshCw, AlertCircle } from 'lucide-react';

type DataCleaningProps = {
  onNext: () => void;
};

const DataCleaning: React.FC<DataCleaningProps> = ({ onNext }) => {
  const { data, columns, totalRows, resetToOriginal } = useData();
  const [activeTab, setActiveTab] = useState<string>('missing');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Veri temizlemek için önce veri yükleyin.</p>
      </div>
    );
  }

  // Calculate missing values summary
  const missingValuesSummary = columns.filter(col => 
    (col.missingValues && col.missingValues > 0)
  );

  // Calculate duplicate rows
  const uniqueRows = new Set(data.map(row => JSON.stringify(row)));
  const duplicateCount = data.length - uniqueRows.size;

  const tabs = [
    { id: 'missing', label: 'Eksik Veriler', count: missingValuesSummary.length },
    { id: 'duplicates', label: 'Yinelenen Satırlar', count: duplicateCount },
    { id: 'types', label: 'Veri Tipleri', count: null },
  ];

  // Render data overview
  const renderDataOverview = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-blue-800 font-medium mb-1">Toplam Satır</h3>
        <p className="text-2xl font-bold text-blue-900">{totalRows}</p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h3 className="text-amber-800 font-medium mb-1">Eksik Değerler</h3>
        <p className="text-2xl font-bold text-amber-900">
          {missingValuesSummary.length > 0 
            ? `${missingValuesSummary.length} sütunda bulundu` 
            : 'Yok'}
        </p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-purple-800 font-medium mb-1">Yinelenen Satırlar</h3>
        <p className="text-2xl font-bold text-purple-900">
          {duplicateCount > 0 ? duplicateCount : 'Yok'}
        </p>
      </div>
    </div>
  );

  // Render alert notice if there are issues
  const renderAlertNotice = () => {
    if (missingValuesSummary.length > 0 || duplicateCount > 0) {
      return (
        <div className="flex items-start p-4 mb-6 bg-warning-50 text-warning-800 rounded-lg border border-warning-200">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Veri Kalitesi İyileştirilebilir</h4>
            <p className="text-sm mt-1">
              {missingValuesSummary.length > 0 && `${missingValuesSummary.length} sütunda eksik değerler bulundu. `}
              {duplicateCount > 0 && `${duplicateCount} yinelenen satır tespit edildi. `}
              Analiz sonuçlarının doğruluğu için bu sorunları gidermeniz önerilir.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Veri Temizleme</h2>
        <div className="flex space-x-3">
          <button
            onClick={resetToOriginal}
            className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <RefreshCw size={14} className="mr-1" />
            Orijinal Veriye Dön
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Analize Geç
          </button>
        </div>
      </div>

      {renderDataOverview()}
      {renderAlertNotice()}

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors duration-200`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  tab.count > 0 
                    ? 'bg-warning-100 text-warning-800' 
                    : 'bg-success-100 text-success-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'missing' && <CleaningOptions />}
        {activeTab === 'duplicates' && <DuplicatesHandler />}
        {activeTab === 'types' && <ColumnTypeManager />}
      </div>
    </div>
  );
};

export default DataCleaning;