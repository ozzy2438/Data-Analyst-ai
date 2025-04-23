import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SummaryStatistics } from './analysis/SummaryStatistics';
import { CorrelationMatrix } from './analysis/CorrelationMatrix';
import { ColumnDistributions } from './analysis/ColumnDistributions';
import { AutomatedInsights } from './analysis/AutomatedInsights';
import { BarChart2, GitCompare, BarChart, Lightbulb } from 'lucide-react';

type ExploratoryAnalysisProps = {
  onNext: () => void;
};

const ExploratoryAnalysis: React.FC<ExploratoryAnalysisProps> = ({ onNext }) => {
  const { data } = useData();
  const [activeTab, setActiveTab] = useState<string>('summary');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Veri analizi için önce veri yükleyin.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Özet İstatistikler', icon: <BarChart2 size={16} /> },
    { id: 'correlations', label: 'Korelasyon Matrisi', icon: <GitCompare size={16} /> },
    { id: 'distributions', label: 'Dağılımlar', icon: <BarChart size={16} /> },
    { id: 'insights', label: 'Otomatik İçgörüler', icon: <Lightbulb size={16} /> },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Keşifsel Veri Analizi</h2>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Görselleştirmeye Geç
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors duration-200`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'summary' && <SummaryStatistics />}
        {activeTab === 'correlations' && <CorrelationMatrix />}
        {activeTab === 'distributions' && <ColumnDistributions />}
        {activeTab === 'insights' && <AutomatedInsights />}
      </div>
    </div>
  );
};

export default ExploratoryAnalysis;