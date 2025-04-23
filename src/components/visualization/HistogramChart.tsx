import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import type { ChartConfig } from '../Visualization';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type HistogramChartProps = {
  config: ChartConfig;
};

export const HistogramChart: React.FC<HistogramChartProps> = ({ config }) => {
  const { data, getColumnData } = useData();
  
  const chartData = useMemo(() => {
    if (!data || !config.xAxis) return null;
    
    // Get numeric data for the selected column
    const values = getColumnData(config.xAxis)
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(Number);
    
    if (values.length === 0) return null;
    
    // Calculate histogram bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = config.binCount || 10;
    const binWidth = (max - min) / binCount;
    
    // Initialize bins
    const bins = Array(binCount).fill(0);
    const binLabels = [];
    
    // Create bin labels
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      binLabels.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
    }
    
    // Count values in each bin
    values.forEach(value => {
      if (value === max) {
        // Edge case: handle the maximum value
        bins[binCount - 1]++;
      } else {
        const binIndex = Math.floor((value - min) / binWidth);
        bins[binIndex]++;
      }
    });
    
    return {
      labels: binLabels,
      datasets: [
        {
          label: config.xAxis,
          data: bins,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [data, config, getColumnData]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: config.title || `${config.xAxis} Histogramı`,
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
          text: config.xAxis,
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-gray-500">
          Seçilen sütunda geçerli veri bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-[400px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};