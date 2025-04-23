import React from 'react';
import { FileUp, BarChart, LineChart, BrainCircuit, FileSpreadsheet, Table2, Sparkles } from 'lucide-react';

type WelcomeScreenProps = {
  onNext: () => void;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const features = [
    {
      icon: <FileUp className="h-8 w-8 text-primary-500" />,
      title: 'Dosya Yükleme',
      description: 'CSV ve Excel dosyalarını kolayca yükleyin ve verilerinizi görüntüleyin.'
    },
    {
      icon: <Table2 className="h-8 w-8 text-indigo-500" />,
      title: 'Veri Temizleme',
      description: 'Eksik verileri doldurun, yinelenen satırları kaldırın ve veri tiplerini düzenleyin.'
    },
    {
      icon: <BarChart className="h-8 w-8 text-purple-500" />,
      title: 'İstatistiksel Analiz',
      description: 'Temel istatistikler, dağılımlar ve korelasyon matrisleri ile verilerinizi analiz edin.'
    },
    {
      icon: <LineChart className="h-8 w-8 text-green-500" />,
      title: 'Veri Görselleştirme',
      description: 'İnteraktif grafikler oluşturun ve verilerinizi görsel olarak keşfedin.'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-amber-500" />,
      title: 'Yapay Zeka Desteği',
      description: 'Verileriniz hakkında doğal dilde sorular sorun ve içgörüler elde edin.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Julius AI Veri Analiz Platformu</h1>
        <p className="text-xl text-gray-600">
          Verilerinizi yükleyin ve yapay zeka destekli analizlerle içgörüler elde edin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 hover:border-primary-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 bg-gray-50 p-4 rounded-full">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="px-8 py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center mx-auto text-lg"
        >
          <FileUp className="mr-2 h-5 w-5" />
          Veri Yüklemeye Başla
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;