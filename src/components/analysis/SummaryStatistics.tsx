import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const SummaryStatistics: React.FC = () => {
  const { columns, data } = useData();
  const [selectedColumnType, setSelectedColumnType] = useState<string>('numeric');

  if (!data || data.length === 0) {
    return <p className="text-gray-500">Veri yükleyiniz.</p>;
  }

  // Filter columns by type
  const filteredColumns = columns.filter(column => {
    if (selectedColumnType === 'numeric') {
      return column.type === 'numeric';
    } else if (selectedColumnType === 'categorical') {
      return column.type === 'categorical' || column.type === 'boolean';
    } else if (selectedColumnType === 'datetime') {
      return column.type === 'datetime';
    }
    return true;
  });

  const renderNumericStatistics = (column: typeof columns[0]) => {
    if (!column.statistics) return null;
    
    const stats = column.statistics;
    
    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-blue-50 p-2 rounded">
          <span className="text-xs text-blue-700 font-medium">Ortalama</span>
          <p className="text-sm font-semibold">{stats.mean !== null ? Number(stats.mean).toFixed(2) : 'N/A'}</p>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <span className="text-xs text-green-700 font-medium">Medyan</span>
          <p className="text-sm font-semibold">{stats.median !== null ? Number(stats.median).toFixed(2) : 'N/A'}</p>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <span className="text-xs text-purple-700 font-medium">Standart Sapma</span>
          <p className="text-sm font-semibold">{stats.stdDev !== null ? Number(stats.stdDev).toFixed(2) : 'N/A'}</p>
        </div>
        <div className="bg-amber-50 p-2 rounded">
          <span className="text-xs text-amber-700 font-medium">Min / Max</span>
          <p className="text-sm font-semibold">
            {stats.min !== null ? Number(stats.min).toFixed(2) : 'N/A'} / {stats.max !== null ? Number(stats.max).toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>
    );
  };

  const renderCategoricalStatistics = (column: typeof columns[0]) => {
    if (!data || !column) return null;

    // Get counts of each category
    const categoryCounts: Record<string, number> = {};
    let totalCount = 0;
    
    data.forEach(row => {
      const value = String(row[column.name] ?? 'Null');
      categoryCounts[value] = (categoryCounts[value] || 0) + 1;
      totalCount++;
    });
    
    // Sort by frequency (descending)
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Show top 5 categories
    
    return (
      <div className="mt-3">
        {sortedCategories.map(([category, count], index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium truncate max-w-[200px]" title={category}>
                {category === 'Null' ? <em>Boş</em> : category}
              </span>
              <span className="text-gray-600">
                {count} ({((count / totalCount) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full"
                style={{ width: `${(count / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        {Object.keys(categoryCounts).length > 5 && (
          <div className="text-xs text-gray-500 mt-1">
            +{Object.keys(categoryCounts).length - 5} kategori daha...
          </div>
        )}
      </div>
    );
  };

  const renderDateTimeStatistics = (column: typeof columns[0]) => {
    if (!data || !column) return null;

    // Extract valid dates
    const validDates = data
      .map(row => {
        const dateVal = row[column.name];
        if (!dateVal) return null;
        const date = new Date(dateVal);
        return isNaN(date.getTime()) ? null : date;
      })
      .filter(date => date !== null) as Date[];

    if (validDates.length === 0) {
      return <p className="text-sm text-gray-500 mt-2">Geçerli tarih değeri bulunamadı.</p>;
    }

    // Find min/max dates
    const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));
    
    // Calculate range in days
    const rangeDays = Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-blue-50 p-2 rounded">
          <span className="text-xs text-blue-700 font-medium">İlk Tarih</span>
          <p className="text-sm font-semibold">{minDate.toLocaleDateString()}</p>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <span className="text-xs text-green-700 font-medium">Son Tarih</span>
          <p className="text-sm font-semibold">{maxDate.toLocaleDateString()}</p>
        </div>
        <div className="bg-purple-50 p-2 rounded col-span-2">
          <span className="text-xs text-purple-700 font-medium">Tarih Aralığı</span>
          <p className="text-sm font-semibold">{rangeDays} gün</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center mb-6 space-x-4">
        <div className="text-sm font-medium text-gray-600">Sütun Tipini Filtrele:</div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedColumnType('numeric')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              selectedColumnType === 'numeric'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            Sayısal
          </button>
          <button
            onClick={() => setSelectedColumnType('categorical')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              selectedColumnType === 'categorical'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            Kategorik
          </button>
          <button
            onClick={() => setSelectedColumnType('datetime')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              selectedColumnType === 'datetime'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            Tarih/Zaman
          </button>
        </div>
      </div>

      {filteredColumns.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Bu tipte sütun bulunamadı. Lütfen başka bir sütun tipi seçin veya Veri Temizleme adımında sütun tiplerini düzenleyin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColumns.map(column => (
            <div key={column.name} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 truncate" title={column.name}>
                {column.name}
              </h3>
              <div className="text-xs text-gray-500 mt-1">
                {column.uniqueValues} tekil değer | {column.missingValues} eksik değer
              </div>
              
              {selectedColumnType === 'numeric' && renderNumericStatistics(column)}
              {selectedColumnType === 'categorical' && renderCategoricalStatistics(column)}
              {selectedColumnType === 'datetime' && renderDateTimeStatistics(column)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};