import * as XLSX from 'xlsx';

/**
 * Excel dosyasını işleyerek veri dizisi döndürür
 */
export const processExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        if (!data) {
          reject(new Error('Excel verisi okunamadı.'));
          return;
        }
        
        // Excel dosyasını işle
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // İlk çalışma sayfasını al
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Çalışma sayfasını JSON'a dönüştür (başlıkları da dahil et)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '', // Boş hücreleri boş string olarak doldur
          blankrows: false // Boş satırları atla
        });
        
        // İlk satır başlıkları içerir
        if (jsonData.length < 2) {
          reject(new Error('Excel dosyası yeterli veri içermiyor.'));
          return;
        }
        
        const headers = jsonData[0] as string[];
        
        // Başlıkları ve verileri birleştirerek objelere dönüştür
        const result = jsonData.slice(1).map((row: any) => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        console.log(`Excel başarıyla işlendi: ${result.length} satır.`);
        resolve(result);
      } catch (error) {
        console.error('Excel işleme hatası:', error);
        reject(new Error(`Excel işleme hatası: ${(error as Error).message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Excel dosyası okunamadı.'));
    };
    
    // Excel dosyasını binary string olarak oku
    reader.readAsBinaryString(file);
  });
}; 