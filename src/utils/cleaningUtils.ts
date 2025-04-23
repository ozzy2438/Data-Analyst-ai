/**
 * Veri setindeki eksik değerleri temizler veya doldurur
 * @param data İşlenecek veri seti
 * @param column İşlenecek sütun adı
 * @param method Temizleme yöntemi: 'remove' (satırı sil), 'fill' (değerle doldur), 'mean', 'median', 'mode'
 * @param value fill metodu için kullanılacak değer
 */
export const cleanData = (
  data: Record<string, any>[],
  column: string,
  method: string,
  value?: any
): Record<string, any>[] => {
  if (!data || data.length === 0 || !column) {
    return data;
  }

  // Veriyi kopyala (orijinal veri değişmesin)
  const cleanedData = [...data];

  switch (method) {
    case 'remove':
      // Seçili sütunda eksik veriye sahip satırları kaldır
      return cleanedData.filter(row => 
        row[column] !== null && 
        row[column] !== undefined && 
        row[column] !== ''
      );

    case 'fill':
      // Eksik verileri belirtilen değerle doldur
      return cleanedData.map(row => {
        if (row[column] === null || row[column] === undefined || row[column] === '') {
          return { ...row, [column]: value };
        }
        return row;
      });

    case 'mean':
    case 'median':
    case 'mode': {
      // Tüm değerleri topla (mean, median, mode için)
      const values = cleanedData
        .map(row => row[column])
        .filter(val => val !== null && val !== undefined && val !== '');

      let replacementValue: any = value; // Varsayılan olarak dışarıdan verilen değeri kullan

      // Sayısal veriler için ortalama, medyan hesapla
      if (values.every(val => !isNaN(Number(val)))) {
        const numericValues = values.map(Number);

        if (method === 'mean') {
          // Ortalama
          replacementValue = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        } else if (method === 'median') {
          // Medyan
          const sorted = [...numericValues].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          replacementValue = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
        } else if (method === 'mode') {
          // Mod (en çok tekrar eden değer)
          const frequency: Record<number, number> = {};
          let maxFreq = 0;
          let modeValue: number = numericValues[0];

          numericValues.forEach(val => {
            frequency[val] = (frequency[val] || 0) + 1;
            if (frequency[val] > maxFreq) {
              maxFreq = frequency[val];
              modeValue = val;
            }
          });

          replacementValue = modeValue;
        }
      } else if (method === 'mode') {
        // Sayısal olmayan veriler için mod hesapla
        const frequency: Record<string, number> = {};
        let maxFreq = 0;
        let modeValue = values[0];

        values.forEach(val => {
          const strVal = String(val);
          frequency[strVal] = (frequency[strVal] || 0) + 1;
          if (frequency[strVal] > maxFreq) {
            maxFreq = frequency[strVal];
            modeValue = val;
          }
        });

        replacementValue = modeValue;
      }

      // Eksik verileri hesaplanan değerle doldur
      return cleanedData.map(row => {
        if (row[column] === null || row[column] === undefined || row[column] === '') {
          return { ...row, [column]: replacementValue };
        }
        return row;
      });
    }

    default:
      return cleanedData;
  }
}; 