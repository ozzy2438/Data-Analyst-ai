/**
 * Sayısal veri seti için temel istatistikleri hesaplar
 */
export const calculateStatistics = (data: number[]): Record<string, number | null> => {
  // Veri yoksa boş sonuç döndür
  if (!data || data.length === 0) {
    return {
      mean: null,
      median: null,
      min: null,
      max: null,
      stdDev: null,
      count: 0
    };
  }

  // Sayısal verileri filtrele
  const numericData = data.filter(val => typeof val === 'number' && !isNaN(val));
  
  if (numericData.length === 0) {
    return {
      mean: null,
      median: null,
      min: null,
      max: null,
      stdDev: null,
      count: 0
    };
  }
  
  // Sıralama
  const sortedData = [...numericData].sort((a, b) => a - b);
  
  // Minimum ve maksimum değerler
  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];
  
  // Ortalama
  const sum = numericData.reduce((acc, val) => acc + val, 0);
  const mean = sum / numericData.length;
  
  // Medyan
  let median: number;
  const midIndex = Math.floor(sortedData.length / 2);
  
  if (sortedData.length % 2 === 0) {
    // Çift sayıda eleman varsa, ortadaki iki elemanın ortalaması
    median = (sortedData[midIndex - 1] + sortedData[midIndex]) / 2;
  } else {
    // Tek sayıda eleman varsa, ortadaki eleman
    median = sortedData[midIndex];
  }
  
  // Standart sapma
  const squaredDifferences = numericData.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / numericData.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean,
    median,
    min,
    max,
    stdDev,
    count: numericData.length
  };
}; 