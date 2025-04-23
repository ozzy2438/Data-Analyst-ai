import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ColumnDistributions: React.FC = () => {
  const { columns, getColumnData } = useData();
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [binsCount, setBinsCount] = useState<number>(10);

  // Get numeric and categorical columns
  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => 
    col.type === 'categorical' || col.type === 'boolean'
  );

  // Function to create bins for numeric data
  const createHistogramData = (columnName: string, bins: number) => {
    const values = getColumnData(columnName)
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(Number);
    
    if (values.length === 0) return { labels: [], data: [] };
    
    // Find min and max values
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Create bins
    const binWidth = (max - min) / bins;
    const binCounts = new Array(bins).fill(0);
    const binLabels = [];
    
    // Create bin labels
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      binLabels.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
    }
    
    // Count values in each bin
    values.forEach(value => {
      if (value === max) {
        // Edge case: handle the maximum value
        binCounts[bins - 1]++;
      } else {
        const binIndex = Math.floor((value - min) / binWidth);
        binCounts[binIndex]++;
      }
    });
    
    return {
      labels: binLabels,
      data: binCounts,
    };
  };

  // Function to create frequency data for categorical columns
  const createCategoryData = (columnName: string) => {
    const values = getColumnData(columnName);
    
    // Count occurrences of each category
    const categoryCounts: Record<string, number> = {};
    
    values.forEach(value => {
      const category = value !== null && value !== undefined ? String(value) : 'Null';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Sort by frequency (descending)
    const sortedEntries = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Limit to top 20 categories
    
    return {
      labels: sortedEntries.map(entry => entry[0] === 'Null' ? 'Boş' : entry[0]),
      data: sortedEntries.map(entry => entry[1]),
    };
  };

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value);
  };

  const handleBinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBinsCount = parseInt(e.target.value, 10);
    setBinsCount(isNaN(newBinsCount) ? 10 : Math.max(2, Math.min(50, newBinsCount)));
  };

  // Get chart data based on column type and selection
  const chartData = () => {
    if (!selectedColumn) return null;
    
    const column = columns.find(col => col.name === selectedColumn);
    if (!column) return null;
    
    let distributionData;
    
    if (column.type === 'numeric') {
      distributionData = createHistogramData(selectedColumn, binsCount);
    } else if (column.type === 'categorical' || column.type === 'boolean') {
      distributionData = createCategoryData(selectedColumn);
    } else {
      return null;
    }
    
    return {
      labels: distributionData.labels,
      datasets: [
        {
          label: column.name,
          data: distributionData.data,
          backgroundColor: column.type === 'numeric' 
            ? 'rgba(54, 162, 235, 0.6)' 
            : distributionData.labels.map((_, i) => `hsl(${(i * 20) % 360}, 70%, 65%)`),
          borderColor: column.type === 'numeric' 
            ? 'rgba(54, 162, 235, 1)' 
            : distributionData.labels.map((_, i) => `hsl(${(i * 20) % 360}, 70%, 55%)`),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: selectedColumn ? `${selectedColumn} Sütunu Dağılımı` : '',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Frekans: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frekans',
        },
      },
      x: {
        title: {
          display: true,
          text: selectedColumn,
        },
      },
    },
  };

  if (numericColumns.length === 0 && categoricalColumns.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          Dağılım analizi için sayısal veya kategorik sütunlar gereklidir. 
          Lütfen veri setinizi kontrol edin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-grow">
          <label htmlFor="column-select" className="block text-sm font-medium text-gray-700 mb-1">
            Dağılımı Görüntülenecek Sütun
          </label>
          <select
            id="column-select"
            value={selectedColumn}
            onChange={handleColumnChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Bir sütun seçin</option>
            
            {numericColumns.length > 0 && (
              <optgroup label="Sayısal Sütunlar">
                {numericColumns.map(column => (
                  <option key={`num-${column.name}`} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </optgroup>
            )}
            
            {categoricalColumns.length > 0 && (
              <optgroup label="Kategorik Sütunlar">
                {categoricalColumns.map(column => (
                  <option key={`cat-${column.name}`} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        
        {selectedColumn && columns.find(col => col.name === selectedColumn)?.type === 'numeric' && (
          <div className="w-full md:w-48">
            <label htmlFor="bins-input" className="block text-sm font-medium text-gray-700 mb-1">
              Bin Sayısı (2-50)
            </label>
            <input
              id="bins-input"
              type="number"
              min="2"
              max="50"
              value={binsCount}
              onChange={handleBinsChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}
      </div>

      {selectedColumn ? (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="h-80">
            <Bar data={chartData() || {labels: [], datasets: []}} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            Dağılımı görüntülemek için lütfen bir sütun seçin.
          </p>
        </div>
      )}
    </div>
  );
};