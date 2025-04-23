import React, { useMemo } from 'react';
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
import { Bar } from 'react-chartjs-2';
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

type BoxPlotChartProps = {
  config: ChartConfig;
};

export const BoxPlotChart: React.FC<BoxPlotChartProps> = ({ config }) => {
  const { data } = useData();
  
  // Calculate box plot values for a dataset
  const calculateBoxPlotData = (values: number[]) => {
    if (values.length === 0) return null;
    
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1Index = Math.floor(sortedValues.length * 0.25);
    const q2Index = Math.floor(sortedValues.length * 0.5);
    const q3Index = Math.floor(sortedValues.length * 0.75);
    
    const q1 = sortedValues[q1Index];
    const median = sortedValues[q2Index];
    const q3 = sortedValues[q3Index];
    
    // Calculate IQR and whiskers
    const iqr = q3 - q1;
    const lowerWhisker = Math.max(...sortedValues.filter(v => v >= q1 - 1.5 * iqr && v < q1));
    const upperWhisker = Math.min(...sortedValues.filter(v => v <= q3 + 1.5 * iqr && v > q3));
    
    // Calculate outliers
    const outliers = sortedValues.filter(v => v < lowerWhisker || v > upperWhisker);
    
    return {
      min: sortedValues[0],
      max: sortedValues[sortedValues.length - 1],
      q1,
      median,
      q3,
      lowerWhisker,
      upperWhisker,
      outliers,
    };
  };
  
  const chartData = useMemo(() => {
    if (!data || !config.xAxis || !config.yAxis) return null;
    
    // Filter valid data and group by x-axis
    const groupedData: Record<string, number[]> = {};
    
    data.forEach(row => {
      const xValue = row[config.xAxis];
      const yValue = row[config.yAxis || ''];
      
      if (xValue === null || xValue === undefined || 
          yValue === null || yValue === undefined || 
          isNaN(Number(yValue))) {
        return;
      }
      
      const xKey = String(xValue);
      
      if (!groupedData[xKey]) {
        groupedData[xKey] = [];
      }
      
      groupedData[xKey].push(Number(yValue));
    });
    
    // Calculate box plot data for each group
    const boxPlotData: Record<string, any> = {};
    for (const [key, values] of Object.entries(groupedData)) {
      boxPlotData[key] = calculateBoxPlotData(values);
    }
    
    // Filter out groups with insufficient data
    const validGroups = Object.entries(boxPlotData)
      .filter(([_, data]) => data !== null)
      .map(([key, _]) => key);
    
    if (validGroups.length === 0) return null;
    
    // Create datasets for each box plot component
    return {
      labels: validGroups,
      datasets: [
        // Q1 to Q3 (box)
        {
          label: 'Q1-Q3',
          data: validGroups.map(group => 
            boxPlotData[group].q3 - boxPlotData[group].q1
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barPercentage: 0.3,
          categoryPercentage: 0.8,
          base: validGroups.map(group => boxPlotData[group].q1),
        },
        // Lower whisker to Q1
        {
          label: 'Lower Whisker',
          data: validGroups.map(group => 
            boxPlotData[group].q1 - boxPlotData[group].lowerWhisker
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barPercentage: 0.1,
          categoryPercentage: 0.8,
          base: validGroups.map(group => boxPlotData[group].lowerWhisker),
        },
        // Q3 to Upper whisker
        {
          label: 'Upper Whisker',
          data: validGroups.map(group => 
            boxPlotData[group].upperWhisker - boxPlotData[group].q3
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barPercentage: 0.1,
          categoryPercentage: 0.8,
          base: validGroups.map(group => boxPlotData[group].q3),
        },
        // Median (line)
        {
          label: 'Median',
          data: validGroups.map(group => 0.01), // Small value for visual representation
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          barPercentage: 0.3,
          categoryPercentage: 0.8,
          base: validGroups.map(group => boxPlotData[group].median),
        },
      ],
    };
  }, [data, config]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: config.title || `${config.xAxis} - ${config.yAxis} Kutu Grafiği`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (items: any) => {
            if (!items.length) return '';
            const item = items[0];
            return item.label;
          },
          label: (item: any) => {
            if (!data || !config.xAxis || !config.yAxis) return '';
            
            const groupedData: Record<string, number[]> = {};
            data.forEach(row => {
              const xValue = row[config.xAxis];
              const yValue = row[config.yAxis || ''];
              
              if (xValue === null || xValue === undefined || 
                  yValue === null || yValue === undefined || 
                  isNaN(Number(yValue))) {
                return;
              }
              
              const xKey = String(xValue);
              
              if (!groupedData[xKey]) {
                groupedData[xKey] = [];
              }
              
              groupedData[xKey].push(Number(yValue));
            });
            
            const boxPlot = calculateBoxPlotData(groupedData[item.label] || []);
            if (!boxPlot) return '';
            
            return [
              `Minimum: ${boxPlot.min.toFixed(2)}`,
              `1. Çeyrek (Q1): ${boxPlot.q1.toFixed(2)}`,
              `Medyan: ${boxPlot.median.toFixed(2)}`,
              `3. Çeyrek (Q3): ${boxPlot.q3.toFixed(2)}`,
              `Maksimum: ${boxPlot.max.toFixed(2)}`,
              `IQR: ${(boxPlot.q3 - boxPlot.q1).toFixed(2)}`,
              `Aykırı değer sayısı: ${boxPlot.outliers.length}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
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
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p>
          <strong>Kutu Grafiği Açıklaması:</strong> Kutu grafiği, veri dağılımını beş istatistiksel özet ile gösterir: 
          minimum, 1. çeyrek (Q1), medyan, 3. çeyrek (Q3) ve maksimum. Kutunun kendisi 1. ve 3. çeyrek arasındaki aralığı (IQR) temsil eder.
          Kırmızı çizgi medyanı gösterir.
        </p>
      </div>
    </div>
  );
};