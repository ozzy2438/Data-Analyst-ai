import React, { useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';
import { 
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import type { ChartConfig } from '../Visualization';

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ScatterChartProps = {
  config: ChartConfig;
};

export const ScatterChart: React.FC<ScatterChartProps> = ({ config }) => {
  const { data } = useData();
  
  const chartData = useMemo(() => {
    if (!data || !config.xAxis || !config.yAxis) return null;
    
    // Get valid data points
    const points = data
      .map(row => ({
        x: row[config.xAxis],
        y: row[config.yAxis || ''],
      }))
      .filter(point => 
        point.x !== null && point.x !== undefined && !isNaN(Number(point.x)) &&
        point.y !== null && point.y !== undefined && !isNaN(Number(point.y))
      )
      .map(point => ({
        x: Number(point.x),
        y: Number(point.y),
      }));
    
    if (points.length === 0) return null;
    
    return {
      datasets: [
        {
          label: `${config.xAxis} vs ${config.yAxis}`,
          data: points,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [data, config]);
  
  // Calculate simple linear regression for trendline
  const regressionLine = useMemo(() => {
    if (!chartData) return null;
    
    const points = chartData.datasets[0].data;
    if (points.length < 2) return null;
    
    // Calculate means
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    const meanX = sumX / points.length;
    const meanY = sumY / points.length;
    
    // Calculate coefficients
    let numerator = 0;
    let denominator = 0;
    
    points.forEach(point => {
      const diffX = point.x - meanX;
      numerator += diffX * (point.y - meanY);
      denominator += diffX * diffX;
    });
    
    // Avoid division by zero
    if (denominator === 0) return null;
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Get min and max x values
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    
    return {
      label: 'Trend Line',
      data: [
        { x: minX, y: minX * slope + intercept },
        { x: maxX, y: maxX * slope + intercept },
      ],
      type: 'line' as const,
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      tension: 0,
    };
  }, [chartData]);
  
  // Add trendline to chart data
  const chartDataWithTrendline = useMemo(() => {
    if (!chartData) return null;
    
    const data = { ...chartData };
    if (regressionLine) {
      data.datasets = [...data.datasets, regressionLine];
    }
    
    return data;
  }, [chartData, regressionLine]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: config.title || `${config.xAxis} - ${config.yAxis} Saçılım Grafiği`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${config.xAxis}: ${context.parsed.x.toFixed(2)}, ${config.yAxis}: ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
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

  if (!chartDataWithTrendline) {
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
        <Scatter data={chartDataWithTrendline} options={chartOptions} />
      </div>
    </div>
  );
};