import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export const CorrelationMatrix: React.FC = () => {
  const { columns, data } = useData();
  const [showHelp, setShowHelp] = useState(false);
  
  // Get only numeric columns
  const numericColumns = useMemo(() => {
    return columns.filter(col => col.type === 'numeric');
  }, [columns]);

  // Calculate correlation matrix
  const correlationMatrix = useMemo(() => {
    if (!data || numericColumns.length <= 1) {
      return [];
    }

    const matrix: number[][] = [];
    
    for (let i = 0; i < numericColumns.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < numericColumns.length; j++) {
        matrix[i][j] = calculateCorrelation(
          numericColumns[i].name,
          numericColumns[j].name
        );
      }
    }
    
    return matrix;
  }, [data, numericColumns]);

  // Function to calculate Pearson correlation coefficient
  function calculateCorrelation(column1: string, column2: string): number {
    if (!data || !column1 || !column2) return 0;
    
    // Get arrays of values, filtering out missing values
    const values1 = data
      .map(row => row[column1])
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(Number);
    
    const values2 = data
      .map(row => row[column2])
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(Number);
    
    // If we don't have enough data points
    if (values1.length < 2 || values2.length < 2) return 0;
    
    // Get only pairs where both values exist
    const pairs: [number, number][] = [];
    for (let i = 0; i < data.length; i++) {
      const val1 = Number(data[i][column1]);
      const val2 = Number(data[i][column2]);
      
      if (!isNaN(val1) && !isNaN(val2)) {
        pairs.push([val1, val2]);
      }
    }
    
    if (pairs.length < 2) return 0;
    
    // Calculate means
    const mean1 = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
    const mean2 = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
    
    // Calculate covariance and standard deviations
    let covariance = 0;
    let stdDev1 = 0;
    let stdDev2 = 0;
    
    for (const [val1, val2] of pairs) {
      const diff1 = val1 - mean1;
      const diff2 = val2 - mean2;
      
      covariance += diff1 * diff2;
      stdDev1 += diff1 * diff1;
      stdDev2 += diff2 * diff2;
    }
    
    covariance /= pairs.length;
    stdDev1 = Math.sqrt(stdDev1 / pairs.length);
    stdDev2 = Math.sqrt(stdDev2 / pairs.length);
    
    // Avoid division by zero
    if (stdDev1 === 0 || stdDev2 === 0) return 0;
    
    // Return Pearson correlation coefficient
    return covariance / (stdDev1 * stdDev2);
  }

  // Function to get color based on correlation value
  const getCorrelationColor = (value: number): string => {
    const absValue = Math.abs(value);
    
    if (absValue < 0.2) return 'bg-gray-100 text-gray-800';
    if (absValue < 0.4) return value > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';
    if (absValue < 0.6) return value > 0 ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800';
    if (absValue < 0.8) return value > 0 ? 'bg-blue-300 text-blue-900' : 'bg-red-300 text-red-900';
    return value > 0 ? 'bg-blue-400 text-blue-900' : 'bg-red-400 text-red-900';
  };

  if (numericColumns.length <= 1) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          Korelasyon analizi için en az 2 sayısal sütun gereklidir. 
          Lütfen veri setinizi kontrol edin veya Veri Temizleme adımında sütun tiplerini düzenleyin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Sayısal Sütunlar Arası Korelasyon</h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <Info size={16} className="mr-1" />
          Korelasyon Nedir?
          {showHelp ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
        </button>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800 animate-slide-down">
          <p className="mb-2">
            <strong>Korelasyon katsayısı</strong>, iki değişken arasındaki doğrusal ilişkinin gücünü ve yönünü gösteren bir ölçüdür.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>+1.0</strong>: Mükemmel pozitif korelasyon. Bir değişken arttığında, diğeri de aynı oranda artar.
            </li>
            <li>
              <strong>0.0</strong>: Korelasyon yok. Değişkenler arasında doğrusal bir ilişki bulunmamaktadır.
            </li>
            <li>
              <strong>-1.0</strong>: Mükemmel negatif korelasyon. Bir değişken arttığında, diğeri aynı oranda azalır.
            </li>
          </ul>
          <p className="mt-2">
            <strong>Not:</strong> Korelasyon, nedensellik anlamına gelmez. İki değişken arasında güçlü bir korelasyon olması, 
            birinin diğerini etkilediği anlamına gelmez.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">
                Sütun
              </th>
              {numericColumns.map((col) => (
                <th 
                  key={col.name} 
                  className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  <div className="truncate max-w-[100px]" title={col.name}>
                    {col.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericColumns.map((rowCol, i) => (
              <tr key={rowCol.name} className="hover:bg-gray-50">
                <td className="p-3 text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50">
                  <div className="truncate max-w-[150px]" title={rowCol.name}>
                    {rowCol.name}
                  </div>
                </td>
                {numericColumns.map((colCol, j) => {
                  const correlation = correlationMatrix[i][j];
                  
                  return (
                    <td 
                      key={colCol.name} 
                      className={`p-3 text-sm font-medium ${getCorrelationColor(correlation)} text-center`}
                      title={`${rowCol.name} ve ${colCol.name} arasındaki korelasyon: ${correlation.toFixed(2)}`}
                    >
                      {i === j ? '1.00' : correlation.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 mr-1"></div>
            <span className="text-xs text-gray-600">Güçlü Negatif</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 mr-1"></div>
            <span className="text-xs text-gray-600">Zayıf Negatif</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 mr-1"></div>
            <span className="text-xs text-gray-600">Nötr</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 mr-1"></div>
            <span className="text-xs text-gray-600">Zayıf Pozitif</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 mr-1"></div>
            <span className="text-xs text-gray-600">Güçlü Pozitif</span>
          </div>
        </div>
      </div>
    </div>
  );
};