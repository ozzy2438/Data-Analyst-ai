import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { FileUp, FileSpreadsheet, X, Upload, FileType, Table } from 'lucide-react';

type FileUploadProps = {
  onNext: () => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onNext }) => {
  const { loadFile, isLoading, error } = useData();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        setSelectedFile(file);
      } else {
        alert('Lütfen CSV veya Excel dosyası yükleyin.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await loadFile(selectedFile);
      onNext();
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <FileSpreadsheet className="h-8 w-8 text-primary-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800">Veri Dosyası Yükle</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center h-full flex flex-col items-center justify-center ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'
            } transition-colors duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileUp className="mx-auto h-16 w-16 text-primary-500 mb-4" />

            <p className="text-gray-700 mb-4 font-medium">
              Dosyanızı sürükleyip bırakın
            </p>

            <p className="text-gray-500 mb-4">
              veya
            </p>

            <button
              type="button"
              onClick={handleButtonClick}
              className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm"
            >
              Dosya Seçin
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              data-testid="file-input"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Desteklenen Dosya Türleri</h3>

          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-700">CSV Dosyaları</p>
                <p className="text-sm text-gray-500">Virgülle ayrılmış değerler</p>
              </div>
            </li>

            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Excel Dosyaları</p>
                <p className="text-sm text-gray-500">.xlsx ve .xls formatları</p>
              </div>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Julius AI, verilerinizi analiz ederek içgörüler elde etmenize yardımcı olur. Verileriniz güvende kalır ve sadece analiz için kullanılır.
            </p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="p-4 bg-primary-50 rounded-lg flex items-center justify-between animate-slide-up border border-primary-100">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-primary-600 mr-2" />
            <span className="font-medium text-gray-700">{selectedFile.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </span>
          </div>
          <button
            onClick={clearSelectedFile}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md animate-slide-up border border-red-100">
          <p className="font-medium">Hata</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${
            !selectedFile || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
          } transition-all duration-200`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yükleniyor...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-5 w-5" />
              Dosyayı Yükle ve Analiz Et
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;