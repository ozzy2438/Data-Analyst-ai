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

type BarChartProps = {
  config: ChartConfig;
};

export const BarChart: React.FC<BarChartProps> = ({ config }) => {
  const { data } = useData();
  
  const chartData = useMemo(() => {
    if (!data || !config.xAxis || !config.yAxis) return null;
    
    // Group and aggregate data
    const groupedData: Record<string, Record<string, number[]>> = {};
    
    data.forEach(row => {
      const xValue = row[config.xAxis];
      const yValue = row[config.yAxis || ''];
      const groupValue = config.groupBy ? row[config.groupBy] : 'default';
      
      // Skip if any required value is missing
      if (xValue === null || xValue === undefined || 
          yValue === null || yValue === undefined || 
          isNaN(Number(yValue)) ||
          (config.groupBy && (groupValue === null || groupValue === undefined))) {
        return;
      }
      
      // Convert to string for grouping
      const xKey = String(xValue);
      const groupKey = String(groupValue);
      
      if (!groupedData[xKey]) {
        groupedData[xKey] = {};
      }
      
      if (!groupedData[xKey][groupKey]) {
        groupedData[xKey][groupKey] = [];
      }
      
      groupedData[xKey][groupKey].push(Number(yValue));
    });
    
    // Get unique X values and group values
    const xValues = Object.keys(groupedData);
    const groupValues = config.groupBy 
      ? Array.from(new Set(data.map(row => row[config.groupBy || ''])
          .filter(val => val !== null && val !== undefined)
          .map(String)))
      : ['default'];
    
    // Apply aggregation
    const datasets = groupValues.map((group, index) => {
      const aggregatedData = xValues.map(x => {
        const values = groupedData[x][group] || [];
        
        if (values.length === 0) return 0;
        
        switch (config.aggregation) {
          case 'sum':
            return values.reduce((sum, val) => sum + val, 0);
          case 'average':
            return values.reduce((sum, val) => sum + val, 0) / values.length;
          case 'min':
            return Math.min(...values);
          case 'max':
            return Math.max(...values);
          case 'count':
          default:
            return values.length;
        }
      });
      
      return {
        label: group === 'default' ? config.yAxis : group,
        data: aggregatedData,
        backgroundColor: `hsl(${(index * 50) % 360}, 70%, 65%)`,
        borderColor: `hsl(${(index * 50) % 360}, 70%, 55%)`,
        borderWidth: 1,
      };
    });
    
    return {
      labels: xValues,
      datasets,
    };
  }, [data, config]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: config.title || `${config.xAxis} - ${config.yAxis} Çubuk Grafiği`,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: config.yAxis,
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
          Seçilen sütunlarda geçerli veri bulunamadı.
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