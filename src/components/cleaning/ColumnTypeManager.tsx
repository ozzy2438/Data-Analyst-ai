import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const ColumnTypeManager: React.FC = () => {
  const { columns, changeColumnType } = useData();
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [newType, setNewType] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const columnTypes = [
    { value: 'numeric', label: 'Sayısal' },
    { value: 'categorical', label: 'Kategorik' },
    { value: 'datetime', label: 'Tarih/Zaman' },
    { value: 'boolean', label: 'Boolean' },
  ];

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value);
    setNewType('');
    setSuccessMessage(null);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewType(e.target.value);
  };

  const applyTypeChange = () => {
    if (!selectedColumn || !newType) {
      return;
    }

    // Apply type change
    changeColumnType(
      selectedColumn, 
      newType as 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'unknown'
    );
    
    setSuccessMessage(`${selectedColumn} sütunu ${
      columnTypes.find(type => type.value === newType)?.label || newType
    } tipine dönüştürüldü.`);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Veri Tiplerini Yönet</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {columns.map(column => (
          <div key={column.name} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-800 truncate" title={column.name}>
              {column.name}
            </h4>
            <div className="mt-2 p-1.5 rounded bg-gray-200 inline-block text-xs font-medium text-gray-700">
              {column.type === 'numeric' && 'Sayısal'}
              {column.type === 'categorical' && 'Kategorik'}
              {column.type === 'datetime' && 'Tarih/Zaman'}
              {column.type === 'boolean' && 'Boolean'}
              {column.type === 'unknown' && 'Bilinmiyor'}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {column.uniqueValues} tekil değer
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="column-select" className="block text-sm font-medium text-gray-700 mb-1">
              Tipi değiştirilecek sütun
            </label>
            <select
              id="column-select"
              value={selectedColumn}
              onChange={handleColumnChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Bir sütun seçin</option>
              {columns.map(column => (
                <option key={column.name} value={column.name}>
                  {column.name} (Şu anki tip: {column.type})
                </option>
              ))}
            </select>
          </div>
          
          {selectedColumn && (
            <div>
              <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 mb-1">
                Yeni veri tipi
              </label>
              <select
                id="type-select"
                value={newType}
                onChange={handleTypeChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Yeni bir tip seçin</option>
                {columnTypes.map(type => {
                  const currentColumnType = columns.find(col => col.name === selectedColumn)?.type;
                  // Don't show the current type in the dropdown
                  if (type.value === currentColumnType) return null;
                  
                  return (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>
            <strong>Not:</strong> Veri tipini değiştirmek, verilerin dönüştürülmesine neden olacaktır. 
            Bazı değerler dönüştürülemezse null olarak işaretlenebilir.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={applyTypeChange}
            disabled={!selectedColumn || !newType}
            className={`px-4 py-2 rounded-lg font-medium ${
              !selectedColumn || !newType
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors duration-200`}
          >
            Veri Tipini Değiştir
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