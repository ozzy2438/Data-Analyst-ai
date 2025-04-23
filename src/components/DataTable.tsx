import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type DataTableProps = {
  onNext: () => void;
};

const DataTable: React.FC<DataTableProps> = ({ onNext }) => {
  const { data, columns, totalRows } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // If data is null or empty, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Henüz veri yüklenmedi.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Başa Dön
        </button>
      </div>
    );
  }

  // Sort and paginate data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      // Handle null or undefined values
      if (valueA === null || valueA === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return sortDirection === 'asc' ? 1 : -1;

      // Sort based on value type
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Convert to strings for comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      return sortDirection === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
  }, [data, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Veri Tablosu</h2>
        <div className="flex items-center space-x-3">
          <span className="text-gray-600 text-sm">
            Toplam {totalRows} satır
          </span>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Veri Temizlemeye Geç
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort(column.name)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.name}</span>
                    {sortColumn === column.name && (
                      <span>
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-[10px] uppercase mt-1">
                    {column.type}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                {columns.map((column) => (
                  <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {row[column.name] !== null && row[column.name] !== undefined
                      ? String(row[column.name])
                      : <span className="text-gray-400 italic">Boş</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 border-t pt-4">
        <div className="flex items-center">
          <label htmlFor="rows-per-page" className="text-sm text-gray-600 mr-2">
            Sayfa başına satır:
          </label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-gray-300 rounded-md text-sm py-1 px-2"
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm text-gray-600">
            Sayfa {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;