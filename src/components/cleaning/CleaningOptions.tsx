import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const CleaningOptions: React.FC = () => {
  const { columns, cleanMissingValues } = useData();
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [cleaningMethod, setCleaningMethod] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter columns with missing values
  const columnsWithMissing = columns.filter(col => 
    col.missingValues !== undefined && col.missingValues > 0
  );

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value);
    setCleaningMethod('');
    setCustomValue('');
    setSuccessMessage(null);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCleaningMethod(e.target.value);
    setCustomValue('');
    setSuccessMessage(null);
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
  };

  const applyCleaningMethod = () => {
    if (!selectedColumn || !cleaningMethod) {
      return;
    }

    // Get column type
    const columnInfo = columns.find(col => col.name === selectedColumn);
    const columnType = columnInfo?.type;

    // Process value based on column type if custom value
    let processedValue = customValue;
    if (cleaningMethod === 'custom' && columnType === 'numeric') {
      processedValue = isNaN(Number(customValue)) ? '0' : customValue;
    }

    cleanMissingValues(selectedColumn, cleaningMethod, processedValue);
    
    setSuccessMessage(`${selectedColumn} için eksik değerler ${
      cleaningMethod === 'remove' 
        ? 'silindi' 
        : cleaningMethod === 'custom' 
          ? `"${processedValue}" ile dolduruldu` 
          : `${cleaningMethod} ile dolduruldu`
    }.`);
  };

  if (columnsWithMissing.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-green-700">Verilerinizde eksik değer bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Eksik Değerleri Temizle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {columnsWithMissing.map(column => (
          <div key={column.name} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-800">{column.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{column.missingValues}</span> eksik değer
              {column.missingValues && column.missingValues > 1 ? ' bulundu' : ' bulundu'}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Veri tipi: <span className="font-medium">{column.type}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="column-select" className="block text-sm font-medium text-gray-700 mb-1">
              İşlem yapılacak sütun
            </label>
            <select
              id="column-select"
              value={selectedColumn}
              onChange={handleColumnChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Bir sütun seçin</option>
              {columnsWithMissing.map(column => (
                <option key={column.name} value={column.name}>
                  {column.name} ({column.missingValues} eksik değer)
                </option>
              ))}
            </select>
          </div>
          
          {selectedColumn && (
            <div>
              <label htmlFor="method-select" className="block text-sm font-medium text-gray-700 mb-1">
                Temizleme yöntemi
              </label>
              <select
                id="method-select"
                value={cleaningMethod}
                onChange={handleMethodChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Bir yöntem seçin</option>
                <option value="remove">Eksik değerleri olan satırları sil</option>
                
                {columns.find(col => col.name === selectedColumn)?.type === 'numeric' && (
                  <>
                    <option value="mean">Ortalama ile doldur</option>
                    <option value="median">Medyan ile doldur</option>
                    <option value="mode">Mod ile doldur</option>
                  </>
                )}
                
                <option value="custom">Özel değer ile doldur</option>
              </select>
            </div>
          )}
        </div>
        
        {cleaningMethod === 'custom' && (
          <div className="mb-4">
            <label htmlFor="custom-value" className="block text-sm font-medium text-gray-700 mb-1">
              Özel değer
            </label>
            <input
              id="custom-value"
              type="text"
              value={customValue}
              onChange={handleCustomValueChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Eksik değerler yerine kullanılacak değeri girin"
            />
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={applyCleaningMethod}
            disabled={!selectedColumn || !cleaningMethod || (cleaningMethod === 'custom' && !customValue)}
            className={`px-4 py-2 rounded-lg font-medium ${
              !selectedColumn || !cleaningMethod || (cleaningMethod === 'custom' && !customValue)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors duration-200`}
          >
            Temizleme Metodunu Uygula
          </button>
        </div>
      </div>
      
      {successMessage && (
        <div className="mt-4 p-3 bg-success-50 text-success-700 rounded-md border border-success-200 animate-slide-up">
          {successMessage}
        </div>
      )}
    </div>
  );
};