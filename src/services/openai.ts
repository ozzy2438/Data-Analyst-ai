import OpenAI from 'openai';

// Initialize the OpenAI client
// Not: Gerçek bir uygulamada API anahtarı için ortam değişkenleri kullanılmalıdır
const openai = new OpenAI({
  apiKey: "REMOVED_API_KEY",
  dangerouslyAllowBrowser: true // Sadece demo amaçlı, üretimde bir backend kullanın
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateChatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o modeli kullanıyoruz
      messages: messages,
      temperature: 0.7,
      max_tokens: 2500, // Daha uzun cevaplar için token limitini artırdık
      response_format: { type: "json_object" }, // JSON formatında yanıt al
    });

    return response.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate response. Please try again later.');
  }
}

// Function to generate a response without actually calling the API (for demo purposes)
export function generateDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
    return 'Merhaba! Size nasıl yardımcı olabilirim?';
  } else if (lowerMessage.includes('nasılsın')) {
    return 'Ben bir yapay zeka asistanıyım, bu yüzden duygularım yok, ama size yardımcı olmaya hazırım!';
  } else if (lowerMessage.includes('teşekkür')) {
    return 'Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa bana sorabilirsiniz.';
  } else if (lowerMessage.includes('yardım')) {
    return 'Size nasıl yardımcı olabilirim? Bilgi aramak, önerilerde bulunmak veya sorularınızı yanıtlamak için buradayım.';
  } else if (lowerMessage.includes('hava')) {
    return 'Hava durumu hakkında bilgi vermek için konum bilgisine ihtiyacım var. Hangi şehir veya bölge hakkında bilgi almak istiyorsunuz?';
  } else if (lowerMessage.includes('saat')) {
    return `Şu anda yerel saatiniz: ${new Date().toLocaleTimeString()}`;
  } else if (lowerMessage.includes('tarih')) {
    return `Bugünün tarihi: ${new Date().toLocaleDateString()}`;
  } else if (lowerMessage.includes('ne yapabilirsin')) {
    return 'Size çeşitli konularda yardımcı olabilirim: Sorularınızı yanıtlayabilir, bilgi verebilir, hatırlatıcılar oluşturabilir, hesaplamalar yapabilir, öneriler sunabilir ve daha fazlasını yapabilirim. Ne tür bir yardıma ihtiyacınız var?';
  } else {
    return 'İlginç bir soru. Bu konuda daha fazla bilgi verebilir misiniz? Size daha iyi yardımcı olmak isterim.';
  }
}

export async function analyzeDataWithGPT(dataString: string, datasetName: string, question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Sen bir veri analiz uzmanısın. Kullanıcının sorularına cevap verirken aynı zamanda Python kodları da oluşturacaksın."
        },
        {
          role: "user",
          content: `
Veri seti: ${datasetName}
Veriler: ${dataString.substring(0, 2000)}...
Soru: ${question}

Bu veriler ve soru için aşağıdakileri yap:
1. Soruyu analiz et 
2. Bu analizi gerçekleştirmek için Python kodu oluştur
3. Kod, pandas, matplotlib ve/veya seaborn kullanmalı
4. Verilen veriler için bu kodu uygula ve sonuçlarını açıkla
`
        }
      ],
      model: "gpt-4o",
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return response.choices[0].message.content || "Yanıt alınamadı.";
  } catch (error) {
    console.error("GPT API hatası:", error);
    return "Bir hata oluştu: " + error;
  }
}
