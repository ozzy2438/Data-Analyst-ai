import React, { createContext, useState, useContext, ReactNode } from 'react';
import { processCSV } from '../utils/csvUtils';
import { processExcel } from '../utils/excelUtils';
import { calculateStatistics } from '../utils/statisticsUtils';
import { cleanData } from '../utils/cleaningUtils';

type Column = {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'unknown';
  uniqueValues?: number;
  missingValues?: number;
  statistics?: Record<string, number | null>;
};

type DataContextType = {
  data: any[] | null;
  columns: Column[];
  originalData: any[] | null;
  setData: (data: any[] | null) => void;
  loadFile: (file: File) => Promise<void>;
  fileName: string | null;
  totalRows: number;
  isLoading: boolean;
  error: string | null;
  cleanMissingValues: (column: string, method: string, value?: any) => void;
  removeDuplicates: () => void;
  changeColumnType: (columnName: string, newType: Column['type']) => void;
  getColumnData: (columnName: string) => any[];
  resetToOriginal: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataProviderProps = {
  children: ReactNode;
  onDataLoaded: (hasData: boolean) => void;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children, onDataLoaded }) => {
  const [data, setData] = useState<any[] | null>(null);
  const [originalData, setOriginalData] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let parsedData: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        parsedData = await processCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedData = await processExcel(file);
      } else {
        throw new Error('Desteklenmeyen dosya formatı. Lütfen CSV veya Excel dosyası yükleyin.');
      }
      
      if (parsedData.length === 0) {
        throw new Error('Veri yüklenemedi veya veri boş.');
      }
      
      setFileName(file.name);
      
      // Detect column types and calculate initial statistics
      const detectedColumns = detectColumnTypes(parsedData);
      
      setOriginalData([...parsedData]);
      setData(parsedData);
      setColumns(detectedColumns);
      onDataLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken bir hata oluştu.');
      console.error('File loading error:', err);
      onDataLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const detectColumnTypes = (data: any[]): Column[] => {
    if (!data || data.length === 0) return [];
    
    const sample = data.slice(0, Math.min(100, data.length));
    const firstRow = data[0];
    const columnNames = Object.keys(firstRow);
    
    return columnNames.map(name => {
      // Get all non-null values for this column
      const values = sample
        .map(row => row[name])
        .filter(val => val !== null && val !== undefined && val !== '');
      
      const missingCount = data.filter(row => 
        row[name] === null || row[name] === undefined || row[name] === ''
      ).length;
      
      // Detect column type based on values
      let type: Column['type'] = 'unknown';
      
      if (values.length > 0) {
        // Check if all values can be converted to numbers
        const allNumeric = values.every(val => !isNaN(Number(val)));
        
        if (allNumeric) {
          type = 'numeric';
        } else {
          // Check if values might be dates
          const potentialDates = values.filter(val => !isNaN(Date.parse(String(val))));
          if (potentialDates.length > values.length * 0.8) {
            type = 'datetime';
          } else if (
            values.every(val => 
              val === 'true' || val === 'false' || val === true || val === false
            )
          ) {
            type = 'boolean';
          } else {
            type = 'categorical';
          }
        }
      }
      
      // Calculate unique values
      const uniqueValues = new Set(data.map(row => row[name])).size;
      
      // Calculate statistics for numeric columns
      let statistics = {};
      if (type === 'numeric') {
        const numericValues = data
          .map(row => row[name])
          .filter(val => !isNaN(Number(val)))
          .map(Number);
        
        statistics = calculateStatistics(numericValues);
      }
      
      return {
        name,
        type,
        uniqueValues,
        missingValues: missingCount,
        statistics,
      };
    });
  };

  const cleanMissingValues = (column: string, method: string, value?: any) => {
    if (!data) return;
    
    const cleanedData = cleanData(data, column, method, value);
    setData(cleanedData);
    
    // Update column statistics after cleaning
    const updatedColumns = detectColumnTypes(cleanedData);
    setColumns(updatedColumns);
  };

  const removeDuplicates = () => {
    if (!data) return;
    
    // Create a unique key for each row based on all values
    const uniqueRows = data.filter((row, index, self) => 
      index === self.findIndex(r => 
        JSON.stringify(r) === JSON.stringify(row)
      )
    );
    
    setData(uniqueRows);
    
    // Update column statistics after removing duplicates
    const updatedColumns = detectColumnTypes(uniqueRows);
    setColumns(updatedColumns);
  };

  const changeColumnType = (columnName: string, newType: Column['type']) => {
    if (!data) return;
    
    // Make a deep copy of the data
    const updatedData = data.map(row => ({...row}));
    
    // Convert values based on the new type
    updatedData.forEach(row => {
      const value = row[columnName];
      
      if (value === null || value === undefined || value === '') {
        return; // Skip null/undefined values
      }
      
      try {
        if (newType === 'numeric') {
          const num = Number(value);
          row[columnName] = isNaN(num) ? null : num;
        } else if (newType === 'datetime') {
          const date = new Date(value);
          row[columnName] = isNaN(date.getTime()) ? null : date;
        } else if (newType === 'boolean') {
          if (typeof value === 'string') {
            row[columnName] = value.toLowerCase() === 'true';
          } else {
            row[columnName] = Boolean(value);
          }
        } else {
          row[columnName] = String(value);
        }
      } catch (err) {
        row[columnName] = null; // Set to null if conversion fails
      }
    });
    
    setData(updatedData);
    
    // Update column types
    const updatedColumns = columns.map(col => 
      col.name === columnName 
        ? { ...col, type: newType } 
        : col
    );
    
    setColumns(updatedColumns);
  };

  const getColumnData = (columnName: string): any[] => {
    if (!data) return [];
    return data.map(row => row[columnName]);
  };

  const resetToOriginal = () => {
    if (originalData) {
      setData([...originalData]);
      const updatedColumns = detectColumnTypes(originalData);
      setColumns(updatedColumns);
    }
  };

  const totalRows = data ? data.length : 0;

  const value = {
    data,
    columns,
    originalData,
    setData,
    loadFile,
    fileName,
    totalRows,
    isLoading,
    error,
    cleanMissingValues,
    removeDuplicates,
    changeColumnType,
    getColumnData,
    resetToOriginal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};