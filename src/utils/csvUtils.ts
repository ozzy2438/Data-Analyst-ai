import Papa from 'papaparse';

/**
 * CSV dosyasını işleyerek veri dizisi döndürür
 */
export const processCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true, // İlk satırı başlık olarak kullan
      dynamicTyping: true, // Sayı ve boolean değerleri otomatik dönüştür
      skipEmptyLines: true, // Boş satırları atla
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // CSV düzgün işlendiyse ve en az bir veri satırı varsa
          console.log(`CSV başarıyla işlendi: ${results.data.length} satır.`);
          resolve(results.data);
        } else {
          // Veri boşsa veya hiç satır yoksa
          reject(new Error('CSV verileri okunamadı veya veri boş.'));
        }
      },
      error: (error) => {
        console.error('CSV işleme hatası:', error);
        reject(new Error(`CSV işleme hatası: ${error.message}`));
      }
    });
  });
}; 