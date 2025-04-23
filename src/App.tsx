import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import DataCleaning from './components/DataCleaning';
import ExploratoryAnalysis from './components/ExploratoryAnalysis';
import Visualization from './components/Visualization';
import WelcomeScreen from './components/WelcomeScreen';
import StepNavigation from './components/layout/StepNavigation';
import { DataProvider } from './context/DataContext';
import ChatInterface from './components/ChatInterface';

function App() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hasData, setHasData] = useState<boolean>(false);

  // Veri analizi adımları
  const steps = [
    { id: 0, name: 'Başlangıç', component: WelcomeScreen, requiresData: false },
    { id: 1, name: 'Veri Yükleme', component: FileUpload, requiresData: false },
    { id: 2, name: 'Veri Tablosu', component: DataTable, requiresData: true },
    { id: 3, name: 'Veri Temizleme', component: DataCleaning, requiresData: true },
    { id: 4, name: 'Keşifsel Analiz', component: ExploratoryAnalysis, requiresData: true },
    { id: 5, name: 'Görselleştirme', component: Visualization, requiresData: true },
    { id: 6, name: 'Veri Sohbeti', component: ChatInterface, requiresData: true }
  ];

  const navigateToStep = (stepId: number) => {
    // Veri gerektiren adımlara, veri yoksa geçişe izin verme
    if (steps[stepId].requiresData && !hasData) {
      return;
    }
    setCurrentStep(stepId);
  };

  const handleDataLoaded = (dataLoaded: boolean) => {
    setHasData(dataLoaded);

    // Veri başarıyla yüklendiğinde veri tablosu adımına otomatik geçiş yap
    if (dataLoaded && currentStep === 1) {
      setCurrentStep(2); // DataTable adımına geç
    }
  };

  // Geçerli bileşeni göster
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <DataProvider onDataLoaded={handleDataLoaded}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-6">
          <StepNavigation
            steps={steps}
            currentStep={currentStep}
            onStepChange={navigateToStep}
            hasData={hasData}
          />

          <div className="mt-6 animate-fade-in">
            <CurrentStepComponent onNext={() => navigateToStep(currentStep + 1)} />
          </div>
        </main>

        <Footer />
      </div>
    </DataProvider>
  );
}

export default App;