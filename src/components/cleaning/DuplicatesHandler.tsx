import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';

export const DuplicatesHandler: React.FC = () => {
  const { data, removeDuplicates } = useData();
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Find duplicate rows
  const duplicateIndices = useMemo(() => {
    if (!data) return [];
    
    const seen = new Map();
    const duplicates: number[] = [];

    data.forEach((row, index) => {
      const rowStr = JSON.stringify(row);
      
      if (seen.has(rowStr)) {
        duplicates.push(index);
      } else {
        seen.set(rowStr, index);
      }
    });

    return duplicates;
  }, [data]);

  const duplicateRows = useMemo(() => {
    if (!data) return [];
    return duplicateIndices.map(index => data[index]);
  }, [data, duplicateIndices]);

  const handleRemoveDuplicates = () => {
    removeDuplicates();
    setSuccessMessage(`${duplicateIndices.length} yinelenen satır başarıyla kaldırıldı.`);
  };

  if (!data || duplicateIndices.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-green-700">Verilerinizde yinelenen satır bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Yinelenen Satırlar</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {showDuplicates ? 'Yinelenen Satırları Gizle' : 'Yinelenen Satırları Göster'}
          </button>
          <button
            onClick={handleRemoveDuplicates}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Yinelenen Satırları Kaldır
          </button>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
        <p className="text-amber-800">
          <span className="font-medium">{duplicateIndices.length}</span> yinelenen satır tespit edildi. 
          Bu satırlar analiz sonuçlarını etkileyebilir. Kaldırmanız önerilir.
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md border border-success-200 animate-slide-up">
          {successMessage}
        </div>
      )}

      {showDuplicates && data && duplicateRows.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg mt-4 animate-slide-down">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {duplicateRows.slice(0, 5).map((row, index) => (
                <tr key={index} className="bg-error-50">
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {value !== null && value !== undefined
                        ? String(value)
                        : <span className="text-gray-400 italic">Boş</span>}
                    </td>
                  ))}
                </tr>
              ))}
              {duplicateRows.length > 5 && (
                <tr>
                  <td
                    colSpan={Object.keys(data[0]).length}
                    className="px-6 py-4 text-sm text-gray-500 text-center bg-gray-50"
                  >
                    ... ve {duplicateRows.length - 5} satır daha
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};