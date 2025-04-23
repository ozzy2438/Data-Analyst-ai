import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import SimpleLinearRegression from 'ml-regression-simple-linear';
import { ScatterChart as ScatterPlot, TrendingUp, LineChart, Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ModelingProps = {
  onNext: () => void;
};

const Modeling: React.FC<ModelingProps> = ({ onNext }) => {
  const { data, columns } = useData();
  const [showHelp, setShowHelp] = useState(false);
  const [independentVar, setIndependentVar] = useState<string>('');
  const [dependentVar, setDependentVar] = useState<string>('');
  const [modelStats, setModelStats] = useState<{
    r2: number;
    slope: number;
    intercept: number;
    equation: string;
  } | null>(null);

  // Get numeric columns only
  const numericColumns = useMemo(() => {
    return columns.filter(col => col.type === 'numeric');
  }, [columns]);

  // Prepare data for regression and visualization
  const regressionData = useMemo(() => {
    if (!independentVar || !dependentVar || !data) return null;

    const points = data
      .map(row => ({
        x: Number(row[independentVar]),
        y: Number(row[dependentVar]),
      }))
      .filter(point => 
        !isNaN(point.x) && !isNaN(point.y) &&
        point.x !== null && point.y !== null
      );

    if (points.length < 2) return null;

    // Prepare data for SimpleLinearRegression
    const x = points.map(p => p.x);
    const y = points.map(p => p.y);

    try {
      // Create and train the model
      const regression = new SimpleLinearRegression(x, y);
      const r2 = regression.score(x, y);
      const slope = regression.slope;
      const intercept = regression.intercept;

      // Generate prediction line points
      const minX = Math.min(...x);
      const maxX = Math.max(...x);
      const predictionLine = [
        { x: minX, y: regression.predict(minX) },
        { x: maxX, y: regression.predict(maxX) },
      ];

      setModelStats({
        r2,
        slope,
        intercept,
        equation: `y = ${slope.toFixed(4)}x ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(4)}`,
      });

      return {
        points,
        predictionLine,
      };
    } catch (error) {
      console.error('Error fitting regression model:', error);
      return null;
    }
  }, [data, independentVar, dependentVar]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!regressionData) return null;

    return {
      datasets: [
        {
          label: 'Veri Noktaları',
          data: regressionData.points,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Regresyon Doğrusu',
          data: regressionData.predictionLine,
          type: 'line' as const,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [regressionData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: independentVar && dependentVar 
          ? `${dependentVar} vs ${independentVar} Regresyon Analizi`
          : 'Regresyon Analizi',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const x = context.parsed.x.toFixed(2);
            const y = context.parsed.y.toFixed(2);
            return `${label}: (${x}, ${y})`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: dependentVar || 'Bağımlı Değişken',
        },
      },
      x: {
        title: {
          display: true,
          text: independentVar || 'Bağımsız Değişken',
        },
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Modelleme için önce veri yükleyin.</p>
      </div>
    );
  }

  if (numericColumns.length < 2) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Yetersiz Sayısal Veri</h4>
            <p className="text-sm mt-1">
              Regresyon analizi için en az 2 sayısal sütun gereklidir. 
              Lütfen veri setinizi kontrol edin veya Veri Temizleme adımında sütun tiplerini düzenleyin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Basit Doğrusal Regresyon</h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <Info size={16} className="mr-1" />
          Regresyon Nedir?
          {showHelp ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
        </button>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800 animate-slide-down">
          <p className="mb-2">
            <strong>Basit Doğrusal Regresyon</strong>, bir bağımsız değişken (x) ile bir bağımlı değişken (y) 
            arasındaki doğrusal ilişkiyi modelleyen istatistiksel bir yöntemdir.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Bağımsız Değişken (x):</strong> Sonucu etkilediğini düşündüğünüz değişken
            </li>
            <li>
              <strong>Bağımlı Değişken (y):</strong> Tahmin etmek istediğiniz sonuç değişkeni
            </li>
            <li>
              <strong>R² (Belirtme Katsayısı):</strong> 0 ile 1 arasında bir değerdir. 1'e yakın olması 
              modelin veriyi iyi açıkladığını gösterir.
            </li>
          </ul>
          <p className="mt-2">
            <strong>Not:</strong> Bu analiz yöntemi, değişkenler arasında doğrusal bir ilişki olduğunu varsayar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-4">Model Parametreleri</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="independent-var" className="block text-sm font-medium text-gray-700 mb-1">
                  Bağımsız Değişken (x)
                </label>
                <select
                  id="independent-var"
                  value={independentVar}
                  onChange={(e) => setIndependentVar(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Bir değişken seçin</option>
                  {numericColumns.map(col => (
                    <option key={`x-${col.name}`} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dependent-var" className="block text-sm font-medium text-gray-700 mb-1">
                  Bağımlı Değişken (y)
                </label>
                <select
                  id="dependent-var"
                  value={dependentVar}
                  onChange={(e) => setDependentVar(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Bir değişken seçin</option>
                  {numericColumns
                    .filter(col => col.name !== independentVar)
                    .map(col => (
                      <option key={`y-${col.name}`} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {modelStats && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-800">Model Sonuçları</h4>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <TrendingUp size={16} className="text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Regresyon Denklemi</span>
                  </div>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {modelStats.equation}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <LineChart size={16} className="text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Model Metrikleri</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">R² Değeri:</span>
                      <span className="font-medium">{modelStats.r2.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eğim (β₁):</span>
                      <span className="font-medium">{modelStats.slope.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kesişim (β₀):</span>
                      <span className="font-medium">{modelStats.intercept.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p>
                    <strong>Model Yorumu:</strong> Bu model, veri setinizdeki değişkenliğin 
                    {' '}{(modelStats.r2 * 100).toFixed(1)}%'ini açıklayabilmektedir. 
                    {modelStats.r2 > 0.7 
                      ? ' Bu, güçlü bir ilişkiye işaret eder.'
                      : modelStats.r2 > 0.4
                        ? ' Bu, orta düzeyde bir ilişkiye işaret eder.'
                        : ' Bu, zayıf bir ilişkiye işaret eder.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          {independentVar && dependentVar ? (
            chartData ? (
              <div className="h-[500px]">
                <Scatter data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px]">
                <p className="text-gray-500">
                  Seçilen değişkenler için yeterli veri bulunamadı.
                </p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <ScatterPlot size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">
                  Regresyon analizi için lütfen bir bağımlı ve bir bağımsız değişken seçin.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modeling;