import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  AlertCircle, 
  BarChart3, 
  Database,
  ArrowUp,
  Table,
  Code
} from 'lucide-react';
import { generateChatCompletion } from '../services/openai';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  tableData?: any[];
  pythonCode?: string;
};

type ChatInterfaceProps = {
  onNext: () => void;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNext }) => {
  const { data, columns } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'chat' | 'table' | 'code'>('chat');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0 && data && data.length > 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        content: `Merhaba! Verinizle ilgili sorularınızı yanıtlamaya hazırım. Örneğin, "${getRandomSampleQuestion()}" gibi sorular sorabilirsiniz.`,
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages([initialMessage]);
    }
  }, [data]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Select the latest message with data when available
  useEffect(() => {
    const messageWithData = [...messages].reverse().find(msg => msg.tableData || msg.pythonCode);
    if (messageWithData && (!selectedMessage || selectedMessage.id !== messageWithData.id)) {
      setSelectedMessage(messageWithData);
    }
  }, [messages, selectedMessage]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Veri sohbeti için önce veri yükleyin.</p>
      </div>
    );
  }

  const getRandomSampleQuestion = () => {
    const sampleQuestions = [
      'En yüksek değere sahip 5 satırı göster',
      'Veri setindeki aykırı değerler var mı?',
      'Sütunlar arasındaki en güçlü korelasyon nedir?',
      'Verinin genel istatistiksel özeti nedir?',
      'Bu veri setinde en sık karşılaşılan kategorik değerler nelerdir?',
    ];
    
    if (columns.length > 0) {
      const randomColumn = columns[Math.floor(Math.random() * columns.length)].name;
      sampleQuestions.push(`${randomColumn} sütunundaki ortalama değer nedir?`);
      
      if (columns.length > 1) {
        const randomColumn2 = columns.find(col => col.name !== randomColumn)?.name;
        if (randomColumn2) {
          sampleQuestions.push(`${randomColumn} ile ${randomColumn2} arasında bir ilişki var mı?`);
        }
      }
    }
    
    return sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const processDataForAI = () => {
    // Limit the amount of data sent to the AI to avoid token limits
    const maxRows = 50;
    const sampleData = data.slice(0, maxRows);
    
    // Create a simple summary
    const summary = {
      totalRows: data.length,
      sampleRows: sampleData.length,
      columns: columns.map(col => ({
        name: col.name,
        type: col.type,
        uniqueValues: col.uniqueValues,
        missingValues: col.missingValues,
        ...(col.type === 'numeric' ? { statistics: col.statistics } : {}),
      })),
      sampleData,
    };
    
    return summary;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: Date.now(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare data summary
      const dataSummary = processDataForAI();

      // Try to use real OpenAI API if available
      let aiResponse = null;
      try {
        // Context message for AI
        const systemMessage = {
          role: 'system' as const,
          content: `You are a data analysis assistant helping with a dataset. 
            The dataset has ${dataSummary.totalRows} rows and ${dataSummary.columns.length} columns. 
            Please analyze the data and provide helpful insights.
            When responding, include: 
            1. A plain text explanation 
            2. A table with relevant data if appropriate (format as a JSON array of objects) 
            3. Python code using pandas that could generate the answer.
            Format your response as JSON with structure: 
            {"explanation": "...", "tableData": [...], "pythonCode": "..."}
            IMPORTANT: Always respond in Turkish.`
        };

        const messages = [
          systemMessage,
          { role: 'user' as const, content: JSON.stringify(dataSummary) },
          { role: 'user' as const, content: inputMessage }
        ];

        try {
          const response = await generateChatCompletion(messages);
          const parsedResponse = JSON.parse(response);
          aiResponse = parsedResponse;
        } catch (apiError) {
          console.error('OpenAI API error, falling back to simulated response:', apiError);
          // Fall back to simulated response if API call fails
          aiResponse = null;
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI response, falling back to simulated response:', parseError);
      }
      
      // Fall back to simulated response if AI response is not available
      if (!aiResponse) {
        // Generate a simulated response
        const simulatedResponse = generateSimulatedResponse(inputMessage, dataSummary);
        
        // Add assistant message with simulated response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: typeof simulatedResponse === 'string' 
            ? simulatedResponse 
            : simulatedResponse.explanation,
          role: 'assistant',
          timestamp: Date.now(),
          tableData: typeof simulatedResponse === 'string' ? undefined : simulatedResponse.tableData,
          pythonCode: typeof simulatedResponse === 'string' ? undefined : simulatedResponse.pythonCode,
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        // Add assistant message with real API response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.explanation || "Yanıt işlenirken bir hata oluştu.",
          role: 'assistant',
          timestamp: Date.now(),
          tableData: aiResponse.tableData,
          pythonCode: aiResponse.pythonCode,
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Mesajınız işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimulatedResponse = (question: string, dataSummary: any) => {
    // This is a simple simulation for the demo
    const lowercaseQuestion = question.toLowerCase();
    
    if (lowercaseQuestion.includes('merhaba') || lowercaseQuestion.includes('selam')) {
      return {
        explanation: 'Merhaba! Veri setiniz hakkında sorularınızı yanıtlamaya hazırım. Ne öğrenmek istersiniz?',
        tableData: null,
        pythonCode: null
      };
    }
    
    if (lowercaseQuestion.includes('yüksek') && lowercaseQuestion.includes('değer')) {
      const numericColumns = dataSummary.columns.filter((col: any) => col.type === 'numeric');
      if (numericColumns.length === 0) {
        return {
          explanation: 'Veri setinizde sayısal sütun bulamadım. Lütfen başka bir soru sorun.',
          tableData: null,
          pythonCode: null
        };
      }
      
      const randomColumn = numericColumns[Math.floor(Math.random() * numericColumns.length)];
      const sortedData = [...dataSummary.sampleData].sort((a, b) => b[randomColumn.name] - a[randomColumn.name]);
      const topValues = sortedData.slice(0, 5);
      
      let explanation = `${randomColumn.name} sütunundaki en yüksek 5 değer aşağıdaki tabloda gösterilmiştir.`;
      
      // Create Python code
      const pythonCode = `import pandas as pd

# Veri setini yükle (bu örnekte CSV dosyası olduğunu varsayıyoruz)
df = pd.read_csv("veri_seti.csv")

# ${randomColumn.name} sütununa göre azalan şekilde sırala
df_sorted = df.sort_values(by="${randomColumn.name}", ascending=False)

# İlk 5 satırı göster
top_5 = df_sorted.head(5)
print(top_5)`;

      return {
        explanation,
        tableData: topValues,
        pythonCode
      };
    }
    
    if (lowercaseQuestion.includes('aykırı') || lowercaseQuestion.includes('outlier')) {
      const numericColumns = dataSummary.columns.filter((col: any) => col.type === 'numeric');
      if (numericColumns.length === 0) {
        return {
          explanation: 'Veri setinizde sayısal sütun bulamadım. Aykırı değer analizi için sayısal veriler gereklidir.',
          tableData: null,
          pythonCode: null
        };
      }
      
      const randomColumn = numericColumns[Math.floor(Math.random() * numericColumns.length)];
      const values = dataSummary.sampleData.map((row: any) => row[randomColumn.name]).filter((v: any) => v !== null && v !== undefined);
      
      // Simple outlier detection using IQR
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers = dataSummary.sampleData
        .filter((row: any) => {
          const value = row[randomColumn.name];
          return value !== null && (value < lowerBound || value > upperBound);
        })
        .slice(0, 5); // Take at most 5 outliers for the example
      
      // Python code for outlier detection
      const pythonCode = `import pandas as pd
import numpy as np

# Veri setini yükle
df = pd.read_csv("veri_seti.csv")

# ${randomColumn.name} sütunu için IQR kullanarak aykırı değerleri bul
Q1 = df["${randomColumn.name}"].quantile(0.25)
Q3 = df["${randomColumn.name}"].quantile(0.75)
IQR = Q3 - Q1

# Aykırı değer sınırlarını hesapla
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Aykırı değerleri filtrele
outliers = df[(df["${randomColumn.name}"] < lower_bound) | (df["${randomColumn.name}"] > upper_bound)]
print(outliers)`;

      return {
        explanation: `${randomColumn.name} sütununda aykırı değerler tespit edildi. IQR yöntemiyle bulunan aykırı değerlerin ilk 5 tanesi aşağıdaki tabloda gösterilmiştir.`,
        tableData: outliers.length > 0 ? outliers : null,
        pythonCode
      };
    }

    if (lowercaseQuestion.includes('ortalama') || lowercaseQuestion.includes('mean')) {
      const columnMentioned = dataSummary.columns.find((col: any) => 
        lowercaseQuestion.includes(col.name.toLowerCase()) && col.type === 'numeric'
      );

      if (columnMentioned) {
        const values = dataSummary.sampleData.map((row: any) => row[columnMentioned.name]).filter((v: any) => v !== null && v !== undefined);
        const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;

        const pythonCode = `import pandas as pd

# Veri setini yükle
df = pd.read_csv("veri_seti.csv")

# ${columnMentioned.name} sütununun ortalamasını hesapla
ortalama = df["${columnMentioned.name}"].mean()
print(f"${columnMentioned.name} sütununun ortalaması: {ortalama:.2f}")`;

        return {
          explanation: `${columnMentioned.name} sütunundaki değerlerin ortalaması ${mean.toFixed(2)}'dir.`,
          tableData: [{ Sütun: columnMentioned.name, Ortalama: mean.toFixed(2) }],
          pythonCode
        };
      }
    }
    
    // Generic response when no specific pattern is matched
    return {
      explanation: 'Bu soruyu yanıtlamak için veri setini analiz ediyorum. Lütfen sorunuzu daha spesifik hale getirin veya Keşifsel Veri Analizi ve Görselleştirme bölümlerini kullanarak verilerinizi daha detaylı inceleyebilirsiniz.',
      tableData: null,
      pythonCode: null
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Python sözdizimi vurgulaması için yardımcı fonksiyon
  const formatPythonCode = (code: string): string => {
    // Python anahtar kelimeleri
    const keywords = ['import', 'from', 'as', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 
                      'return', 'in', 'and', 'or', 'not', 'try', 'except', 'finally', 'with', 
                      'lambda', 'print', 'True', 'False', 'None'];

    // HTML karakterlerini kaçış karakterlerine dönüştür
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // Önce HTML'den kaçın
    let formattedCode = escapeHtml(code);
    
    // Python anahtar kelimelerini vurgula
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      formattedCode = formattedCode.replace(regex, `<span class="text-blue-500">${keyword}</span>`);
    });
    
    // Dizeleri vurgula (çift ve tek tırnak)
    formattedCode = formattedCode
      .replace(/(&quot;.*?&quot;)/g, '<span class="text-green-500">$1</span>')
      .replace(/(&#039;.*?&#039;)/g, '<span class="text-green-500">$1</span>');
    
    // Sayıları vurgula
    formattedCode = formattedCode.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-purple-500">$1</span>');
    
    // Fonksiyon çağrılarını vurgula
    formattedCode = formattedCode.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-yellow-500">$1</span>(');
    
    // Noktalı ifadeleri vurgula (örn: df.head())
    formattedCode = formattedCode.replace(/\.([a-zA-Z_][a-zA-Z0-9_]*)/g, '.<span class="text-yellow-300">$1</span>');
    
    return formattedCode;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Veri Sohbeti</h2>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Modellemeye Geç
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol Taraf - Sohbet Bölümü */}
        <div className="border border-gray-200 rounded-lg flex flex-col h-[600px]">
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                onClick={() => {
                  if (message.tableData || message.pythonCode) {
                    setSelectedMessage(message);
                    setActiveView(message.tableData ? 'table' : 'code');
                  }
                }}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200'
                  } ${(message.tableData || message.pythonCode) ? 'cursor-pointer hover:shadow-md' : ''}`}
                >
                  <div className="flex items-start mb-1">
                    {message.role === 'assistant' ? (
                      <Bot size={16} className="mr-1 mt-0.5 text-primary-600" />
                    ) : (
                      <User size={16} className="mr-1 mt-0.5 text-white" />
                    )}
                    <div
                      className={`text-xs font-medium ${
                        message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {message.role === 'user' ? 'Siz' : 'Veri Asistanı'}
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {/* Eğer mesajda tablo veya kod varsa bilgi ikonu göster */}
                  {message.role === 'assistant' && (message.tableData || message.pythonCode) && (
                    <div className="flex mt-2 gap-2">
                      {message.tableData && (
                        <div className="inline-flex items-center text-xs text-primary-600 bg-primary-50 rounded-full px-2 py-1">
                          <Table size={12} className="mr-1" /> Tablo mevcut
                        </div>
                      )}
                      {message.pythonCode && (
                        <div className="inline-flex items-center text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-1">
                          <Code size={12} className="mr-1" /> Python kodu
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-4 flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200 flex items-center">
                  <Loader2 size={16} className="mr-2 animate-spin text-primary-600" />
                  <span className="text-sm text-gray-600">Veri asistanı yanıt oluşturuyor...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 flex justify-center">
                <div className="max-w-[80%] rounded-lg p-3 bg-error-50 border border-error-200 text-error-700 flex items-center">
                  <AlertCircle size={16} className="mr-2 text-error-600" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Veri setinizle ilgili bir soru sorun..."
                className="flex-grow border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`px-4 py-2 rounded-r-lg ${
                  !inputMessage.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } transition-colors duration-200 flex items-center`}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Sağ Taraf - Tablo/Kod Görüntüleme Bölümü */}
        <div className="border border-gray-200 rounded-lg flex flex-col h-[600px]">
          <div className="border-b border-gray-200 bg-gray-50 p-2">
            <div className="flex">
              <button
                onClick={() => setActiveView('chat')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg mr-2 ${
                  activeView === 'chat'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={14} className="inline mr-1" /> Chat
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg mr-2 ${
                  activeView === 'table'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                disabled={!selectedMessage?.tableData}
              >
                <Table size={14} className="inline mr-1" /> Tablo
              </button>
              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  activeView === 'code'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                disabled={!selectedMessage?.pythonCode}
              >
                <Code size={14} className="inline mr-1" /> Python
              </button>
            </div>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto bg-white">
            {activeView === 'chat' && (
              <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                <Database size={32} className="mb-2 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">Veri Asistanı</h3>
                <p className="max-w-xs text-sm">
                  Verilerinizle ilgili sorular sorun. Cevaplar burada tablo veya Python kodu olarak gösterilecektir.
                </p>
                <div className="mt-4 space-y-2 w-full max-w-sm">
                  {[
                    'En yüksek değere sahip 5 satırı göster',
                    'Student_ID ile Age arasındaki ilişki nedir?',
                    'Sleep Duration ortalaması kaçtır?',
                    'Verinin istatistiksel özetini göster',
                    'Social Media sütunundaki aykırı değerler nelerdir?'
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="w-full text-left p-2 text-sm rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 flex items-start"
                    >
                      <ArrowUp size={12} className="mt-1 mr-2 text-gray-500" />
                      <span>{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {activeView === 'table' && selectedMessage?.tableData && (
              <div>
                <h3 className="text-lg font-medium mb-3">Tablo Görünümü</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(selectedMessage.tableData[0]).map((key) => (
                          <th key={key} className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMessage.tableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-3 text-sm text-gray-900 border-b">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeView === 'code' && selectedMessage?.pythonCode && (
              <div>
                <h3 className="text-lg font-medium mb-3">Python Kodu</h3>
                <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm shadow-lg">
                  <pre className="whitespace-pre">
                    {selectedMessage.pythonCode.split('\n').map((line, index) => {
                      // Python sözdizimi vurgulaması için satırı işle
                      let formattedLine = line;
                      
                      // Yorumları işle
                      const commentIndex = line.indexOf('#');
                      const hasComment = commentIndex !== -1;
                      
                      // Sözdizimi vurgulaması için satırı HTML olarak formatla
                      let lineContent;
                      
                      if (hasComment) {
                        const codeBeforeComment = line.substring(0, commentIndex);
                        const commentText = line.substring(commentIndex);
                        
                        lineContent = (
                          <>
                            <span dangerouslySetInnerHTML={{ 
                              __html: formatPythonCode(codeBeforeComment) 
                            }} />
                            <span className="text-gray-400">{commentText}</span>
                          </>
                        );
                      } else {
                        lineContent = (
                          <span dangerouslySetInnerHTML={{ 
                            __html: formatPythonCode(line) 
                          }} />
                        );
                      }
                      
                      return (
                        <div key={index} className="py-0.5 flex">
                          <span className="text-gray-500 inline-block w-8 text-right mr-3 select-none">
                            {index + 1}
                          </span>
                          <span className="python-line">
                            {lineContent}
                          </span>
                        </div>
                      );
                    })}
                  </pre>
                </div>
                <div className="mt-3 flex justify-end">
                  <button 
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center hover:bg-blue-200"
                    onClick={() => {
                      if (selectedMessage?.pythonCode) {
                        navigator.clipboard.writeText(selectedMessage.pythonCode)
                          .then(() => {
                            alert('Kod panoya kopyalandı!');
                          })
                          .catch(err => {
                            console.error('Kopyalama başarısız:', err);
                          });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Kopyala
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-amber-50 rounded-md border border-amber-200">
        <div className="flex items-start">
          <BarChart3 size={16} className="mt-0.5 mr-2 text-amber-600" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Not</h4>
            <p className="text-xs text-amber-700 mt-1">
              Bu demo sürümünde, OpenAI API entegrasyonu vardır ve sorunuza yanıt üretilemeye çalışılır.
              Eğer API'ye bağlantı sağlanamazsa, simüle edilmiş cevaplar gösterilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;