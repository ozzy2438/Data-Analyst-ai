import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, LineChart, BarChart2, Box } from 'lucide-react';
import type { ChartConfig } from '../Visualization';

type ChartSelectorProps = {
  columns: {
    name: string;
    type: string;
  }[];
  onConfigChange: (config: ChartConfig) => void;
  currentConfig: ChartConfig;
};

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  columns,
  onConfigChange,
  currentConfig,
}) => {
  const [chartType, setChartType] = useState<string>(currentConfig.type || '');
  const [title, setTitle] = useState<string>(currentConfig.title || '');
  const [xAxis, setXAxis] = useState<string>(currentConfig.xAxis || '');
  const [yAxis, setYAxis] = useState<string>(currentConfig.yAxis || '');
  const [groupBy, setGroupBy] = useState<string>(currentConfig.groupBy || '');
  const [aggregation, setAggregation] = useState<string>(currentConfig.aggregation || 'count');
  const [binCount, setBinCount] = useState<number>(currentConfig.binCount || 10);

  // Filter columns by type
  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => 
    col.type === 'categorical' || col.type === 'boolean'
  );
  const dateColumns = columns.filter(col => col.type === 'datetime');

  // Chart type options
  const chartTypes = [
    { id: 'histogram', label: 'Histogram', icon: <BarChartIcon size={18} /> },
    { id: 'bar', label: 'Çubuk Grafik', icon: <BarChart2 size={18} /> },
    { id: 'scatter', label: 'Saçılım Grafiği', icon: <BarChartIcon size={18} /> },
    { id: 'line', label: 'Çizgi Grafik', icon: <LineChart size={18} /> },
    { id: 'box', label: 'Kutu Grafiği', icon: <Box size={18} /> },
  ];

  // Aggregation methods
  const aggregationMethods = [
    { value: 'count', label: 'Sayım' },
    { value: 'sum', label: 'Toplam' },
    { value: 'average', label: 'Ortalama' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maksimum' },
  ];

  // Update chart configuration when any parameter changes
  useEffect(() => {
    // Only update if we have the minimum required parameters
    if (chartType && xAxis) {
      const newConfig: ChartConfig = {
        type: chartType,
        title: title || `${xAxis} ${chartType === 'scatter' ? `ve ${yAxis}` : ''} Grafiği`,
        xAxis,
        binCount,
      };

      if (yAxis) newConfig.yAxis = yAxis;
      if (groupBy) newConfig.groupBy = groupBy;
      if (aggregation) newConfig.aggregation = aggregation;

      onConfigChange(newConfig);
    }
  }, [chartType, title, xAxis, yAxis, groupBy, aggregation, binCount, onConfigChange]);

  // Reset dependent fields when chart type changes
  useEffect(() => {
    if (chartType !== currentConfig.type) {
      setXAxis('');
      setYAxis('');
      setGroupBy('');
    }
  }, [chartType, currentConfig.type]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-800 mb-4">Grafik Oluştur</h3>

      {/* Chart Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grafik Tipi
        </label>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`flex items-center justify-center px-3 py-2 text-sm rounded-md ${
                chartType === type.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {chartType && (
        <>
          {/* Chart Title */}
          <div className="mb-4">
            <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700 mb-1">
              Grafik Başlığı (Opsiyonel)
            </label>
            <input
              id="chart-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Grafik başlığı"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* X Axis */}
          <div className="mb-4">
            <label htmlFor="x-axis" className="block text-sm font-medium text-gray-700 mb-1">
              X Ekseni
            </label>
            <select
              id="x-axis"
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Bir sütun seçin</option>
              
              {chartType === 'histogram' && numericColumns.length > 0 && (
                <optgroup label="Sayısal Sütunlar">
                  {numericColumns.map(col => (
                    <option key={`x-num-${col.name}`} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {(chartType === 'bar' || chartType === 'line') && (
                <>
                  {categoricalColumns.length > 0 && (
                    <optgroup label="Kategorik Sütunlar">
                      {categoricalColumns.map(col => (
                        <option key={`x-cat-${col.name}`} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {dateColumns.length > 0 && (
                    <optgroup label="Tarih Sütunları">
                      {dateColumns.map(col => (
                        <option key={`x-date-${col.name}`} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
              
              {(chartType === 'scatter' || chartType === 'box') && (
                <>
                  {numericColumns.length > 0 && (
                    <optgroup label="Sayısal Sütunlar">
                      {numericColumns.map(col => (
                        <option key={`x-num-${col.name}`} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>

          {/* Y Axis (for scatter, line, bar) */}
          {(chartType === 'scatter' || chartType === 'line' || chartType === 'bar' || chartType === 'box') && (
            <div className="mb-4">
              <label htmlFor="y-axis" className="block text-sm font-medium text-gray-700 mb-1">
                Y Ekseni
              </label>
              <select
                id="y-axis"
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Bir sütun seçin</option>
                
                {numericColumns.length > 0 && (
                  <optgroup label="Sayısal Sütunlar">
                    {numericColumns.map(col => (
                      <option key={`y-num-${col.name}`} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {/* Group By (for bar, line) */}
          {(chartType === 'bar' || chartType === 'line') && xAxis && yAxis && (
            <div className="mb-4">
              <label htmlFor="group-by" className="block text-sm font-medium text-gray-700 mb-1">
                Gruplama (Opsiyonel)
              </label>
              <select
                id="group-by"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Gruplama yok</option>
                
                {categoricalColumns.length > 0 && (
                  <optgroup label="Kategorik Sütunlar">
                    {categoricalColumns
                      .filter(col => col.name !== xAxis)
                      .map(col => (
                        <option key={`group-${col.name}`} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {/* Aggregation method (for bar, line) */}
          {(chartType === 'bar' || chartType === 'line') && xAxis && yAxis && (
            <div className="mb-4">
              <label htmlFor="aggregation" className="block text-sm font-medium text-gray-700 mb-1">
                Toplama Metodu
              </label>
              <select
                id="aggregation"
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {aggregationMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bin count (for histogram) */}
          {chartType === 'histogram' && xAxis && (
            <div className="mb-4">
              <label htmlFor="bin-count" className="block text-sm font-medium text-gray-700 mb-1">
                Bin Sayısı
              </label>
              <input
                id="bin-count"
                type="number"
                min="2"
                max="50"
                value={binCount}
                onChange={(e) => setBinCount(parseInt(e.target.value) || 10)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};