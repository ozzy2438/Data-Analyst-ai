import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChartSelector } from './visualization/ChartSelector';
import { HistogramChart } from './visualization/HistogramChart';
import { BarChart } from './visualization/BarChart';
import { ScatterChart } from './visualization/ScatterChart';
import { LineChart } from './visualization/LineChart';
import { BoxPlotChart } from './visualization/BoxPlotChart';

type VisualizationProps = {
  onNext: () => void;
};

export type ChartConfig = {
  type: string;
  title: string;
  xAxis: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: string;
  binCount?: number;
};

const Visualization: React.FC<VisualizationProps> = ({ onNext }) => {
  const { data, columns } = useData();
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: '',
    title: '',
    xAxis: '',
    binCount: 10,
  });

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Görselleştirme için önce veri yükleyin.</p>
      </div>
    );
  }

  // Render the selected chart based on chart type
  const renderChart = () => {
    if (!chartConfig.type || !chartConfig.xAxis) {
      return (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            Görselleştirme oluşturmak için sol menüden bir grafik tipi ve gerekli parametreleri seçin.
          </p>
        </div>
      );
    }

    switch (chartConfig.type) {
      case 'histogram':
        return <HistogramChart config={chartConfig} />;
      case 'bar':
        return <BarChart config={chartConfig} />;
      case 'scatter':
        return <ScatterChart config={chartConfig} />;
      case 'line':
        return <LineChart config={chartConfig} />;
      case 'box':
        return <BoxPlotChart config={chartConfig} />;
      default:
        return <div>Seçilen grafik tipi desteklenmiyor.</div>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Veri Görselleştirme</h2>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Veri Sohbetine Geç
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartSelector 
            columns={columns} 
            onConfigChange={setChartConfig} 
            currentConfig={chartConfig}
          />
        </div>
        
        <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default Visualization;