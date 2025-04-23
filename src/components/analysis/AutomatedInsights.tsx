import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { AlertCircle, TrendingUp, TrendingDown, Lightbulb, LineChart, Filter } from 'lucide-react';

export const AutomatedInsights: React.FC = () => {
  const { data, columns } = useData();

  // Function to find columns with high percentage of missing values
  const missingValueInsights = useMemo(() => {
    if (!data || !columns.length) return [];
    
    const insights = [];
    const totalRows = data.length;
    
    for (const column of columns) {
      const missingCount = column.missingValues || 0;
      const missingPercentage = (missingCount / totalRows) * 100;
      
      if (missingPercentage > 20) {
        insights.push({
          type: 'missing',
          column: column.name,
          missingCount,
          missingPercentage,
          severity: missingPercentage > 50 ? 'high' : 'medium',
        });
      }
    }
    
    return insights.sort((a, b) => b.missingPercentage - a.missingPercentage);
  }, [data, columns]);

  // Function to find highly correlated numeric columns
  const correlationInsights = useMemo(() => {
    if (!data || !columns.length) return [];
    
    const numericColumns = columns.filter(col => col.type === 'numeric');
    if (numericColumns.length < 2) return [];
    
    const insights = [];
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        // Calculate correlation
        const values1 = data
          .map(row => row[col1.name])
          .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
          .map(Number);
        
        const values2 = data
          .map(row => row[col2.name])
          .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
          .map(Number);
        
        // Get only pairs where both values exist
        const pairs: [number, number][] = [];
        for (let k = 0; k < data.length; k++) {
          const val1 = Number(data[k][col1.name]);
          const val2 = Number(data[k][col2.name]);
          
          if (!isNaN(val1) && !isNaN(val2)) {
            pairs.push([val1, val2]);
          }
        }
        
        if (pairs.length < 10) continue; // Not enough data points
        
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
        if (stdDev1 === 0 || stdDev2 === 0) continue;
        
        // Calculate Pearson correlation coefficient
        const correlation = covariance / (stdDev1 * stdDev2);
        const absCorrelation = Math.abs(correlation);
        
        if (absCorrelation > 0.7) {
          insights.push({
            type: 'correlation',
            columns: [col1.name, col2.name],
            correlation,
            severity: absCorrelation > 0.9 ? 'high' : 'medium',
          });
        }
      }
    }
    
    return insights.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [data, columns]);

  // Function to find columns with outliers
  const outlierInsights = useMemo(() => {
    if (!data || !columns.length) return [];
    
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const insights = [];
    
    for (const column of numericColumns) {
      const values = data
        .map(row => row[column.name])
        .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
        .map(Number);
      
      if (values.length < 10) continue; // Not enough data points
      
      // Calculate quartiles and IQR
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      
      const q1 = sortedValues[q1Index];
      const q3 = sortedValues[q3Index];
      const iqr = q3 - q1;
      
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      // Count outliers
      const outliers = sortedValues.filter(val => val < lowerBound || val > upperBound);
      const outlierPercentage = (outliers.length / values.length) * 100;
      
      if (outliers.length > 0 && outlierPercentage > 1) {
        insights.push({
          type: 'outlier',
          column: column.name,
          outlierCount: outliers.length,
          outlierPercentage,
          severity: outlierPercentage > 5 ? 'high' : 'medium',
        });
      }
    }
    
    return insights.sort((a, b) => b.outlierPercentage - a.outlierPercentage);
  }, [data, columns]);

  // Function to find distinct value distributions
  const distributionInsights = useMemo(() => {
    if (!data || !columns.length) return [];
    
    const categoricalColumns = columns.filter(col => 
      col.type === 'categorical' || col.type === 'boolean'
    );
    
    const insights = [];
    
    for (const column of categoricalColumns) {
      // Skip if we have too many unique values (likely not a true categorical column)
      if (column.uniqueValues && column.uniqueValues > 50) continue;
      
      // Count occurrences of each category
      const valueCounts: Record<string, number> = {};
      let totalNonNull = 0;
      
      data.forEach(row => {
        const value = row[column.name];
        if (value !== null && value !== undefined && value !== '') {
          const strValue = String(value);
          valueCounts[strValue] = (valueCounts[strValue] || 0) + 1;
          totalNonNull++;
        }
      });
      
      if (totalNonNull === 0) continue;
      
      // Find dominant categories
      const categories = Object.entries(valueCounts);
      categories.sort((a, b) => b[1] - a[1]);
      
      const topCategory = categories[0];
      if (!topCategory) continue;
      
      const topPercentage = (topCategory[1] / totalNonNull) * 100;
      
      if (topPercentage > 80 && categories.length > 1) {
        insights.push({
          type: 'distribution',
          column: column.name,
          dominantValue: topCategory[0],
          percentage: topPercentage,
          severity: topPercentage > 95 ? 'high' : 'medium',
        });
      }
    }
    
    return insights.sort((a, b) => b.percentage - a.percentage);
  }, [data, columns]);

  // Combine all insights
  const allInsights = useMemo(() => {
    return [
      ...missingValueInsights,
      ...correlationInsights,
      ...outlierInsights,
      ...distributionInsights,
    ];
  }, [missingValueInsights, correlationInsights, outlierInsights, distributionInsights]);

  if (!data || data.length === 0) {
    return <p className="text-gray-500">Veri yükleyiniz.</p>;
  }

  if (allInsights.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200">
        <Lightbulb size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">
          Veri setinizde herhangi bir belirgin içgörü bulunamadı. 
          Bu, verinizin temiz olduğu veya daha fazla veri gerektiği anlamına gelebilir.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allInsights.map((insight, index) => {
          let card;
          
          if (insight.type === 'missing') {
            card = (
              <div 
                key={`missing-${index}`} 
                className={`p-4 rounded-lg border ${
                  insight.severity === 'high' 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <AlertCircle 
                    className={`h-5 w-5 mr-2 flex-shrink-0 ${
                      insight.severity === 'high' ? 'text-amber-600' : 'text-blue-600'
                    }`} 
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Eksik Değerler</h4>
                    <p className="text-sm">
                      <span className="font-medium">{insight.column}</span> sütununda yüksek oranda 
                      (<span className="font-medium">{insight.missingPercentage.toFixed(1)}%</span>) 
                      eksik değer mevcut. Bu durumu göz önüne alarak analiz yapınız.
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            insight.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${insight.missingPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (insight.type === 'correlation') {
            const isPositive = insight.correlation > 0;
            
            card = (
              <div 
                key={`correlation-${index}`} 
                className={`p-4 rounded-lg border ${
                  insight.severity === 'high'
                    ? isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    : isPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-start">
                  {isPositive ? (
                    <TrendingUp 
                      className={`h-5 w-5 mr-2 flex-shrink-0 ${
                        insight.severity === 'high' ? 'text-green-600' : 'text-emerald-600'
                      }`}
                    />
                  ) : (
                    <TrendingDown 
                      className={`h-5 w-5 mr-2 flex-shrink-0 ${
                        insight.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                      }`}
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      {isPositive ? 'Pozitif' : 'Negatif'} Korelasyon
                    </h4>
                    <p className="text-sm">
                      <span className="font-medium">{insight.columns[0]}</span> ve 
                      <span className="font-medium"> {insight.columns[1]}</span> sütunları arasında
                      güçlü bir {isPositive ? 'pozitif' : 'negatif'} korelasyon 
                      (<span className="font-medium">{insight.correlation.toFixed(2)}</span>) 
                      bulunmaktadır.
                    </p>
                  </div>
                </div>
              </div>
            );
          } else if (insight.type === 'outlier') {
            card = (
              <div 
                key={`outlier-${index}`} 
                className={`p-4 rounded-lg border ${
                  insight.severity === 'high'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-indigo-50 border-indigo-200'
                }`}
              >
                <div className="flex items-start">
                  <Filter 
                    className={`h-5 w-5 mr-2 flex-shrink-0 ${
                      insight.severity === 'high' ? 'text-purple-600' : 'text-indigo-600'
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Aykırı Değerler</h4>
                    <p className="text-sm">
                      <span className="font-medium">{insight.column}</span> sütununda
                      (<span className="font-medium">{insight.outlierPercentage.toFixed(1)}%</span>) 
                      aykırı değer tespit edildi. Bu değerler analiz sonuçlarını etkileyebilir.
                    </p>
                  </div>
                </div>
              </div>
            );
          } else if (insight.type === 'distribution') {
            card = (
              <div 
                key={`distribution-${index}`} 
                className={`p-4 rounded-lg border ${
                  insight.severity === 'high'
                    ? 'bg-teal-50 border-teal-200'
                    : 'bg-cyan-50 border-cyan-200'
                }`}
              >
                <div className="flex items-start">
                  <LineChart 
                    className={`h-5 w-5 mr-2 flex-shrink-0 ${
                      insight.severity === 'high' ? 'text-teal-600' : 'text-cyan-600'
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Dengesiz Dağılım</h4>
                    <p className="text-sm">
                      <span className="font-medium">{insight.column}</span> sütununda
                      verilerin çoğunluğu (<span className="font-medium">{insight.percentage.toFixed(1)}%</span>) 
                      &quot;<span className="font-medium">{insight.dominantValue}</span>&quot; değerine ait.
                      Bu dengesiz dağılım analizleri etkileyebilir.
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          
          return card;
        })}
      </div>
    </div>
  );
};