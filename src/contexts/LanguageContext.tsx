import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'auto' | 'en' | 'hin' | 'guj';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  auto: {
    'nav.dashboard': 'Dashboard',
    'nav.playground': 'RAG Playground',
    'nav.export': 'Export Session',
    'nav.logout': 'Logout',
    'chat.placeholder': 'Ask me about clinical guidelines (Type in Hindi, Gujarati, Hinglish, Gujlish, or English)...',
    'chat.send': 'Send',
    'admin.dashboard': 'Admin Intelligence Center',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.playground': 'RAG Playground',
    'nav.export': 'Export Session',
    'nav.logout': 'Logout',
    'chat.placeholder': 'Ask me about clinical guidelines...',
    'chat.send': 'Send',
    'admin.dashboard': 'Admin Intelligence Center',
  },
  hin: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.playground': 'RAG प्लेग्राउंड',
    'nav.export': 'सत्र निर्यात करें',
    'nav.logout': 'लॉग आउट',
    'chat.placeholder': 'क्लिनिकल दिशा-निर्देशों के बारे में पूछें...',
    'chat.send': 'भेजें',
    'admin.dashboard': 'व्यवस्थापक केंद्र',
  },
  guj: {
    'nav.dashboard': 'ડેશબોર્ડ',
    'nav.playground': 'RAG પ્લેગ્રાઉન્ડ',
    'nav.export': 'સત્ર નિકાસ કરો',
    'nav.logout': 'લૉગ આઉટ',
    'chat.placeholder': 'ક્લિનિકલ માર્ગદર્શિકા વિશે પૂછો...',
    'chat.send': 'મોકલો',
    'admin.dashboard': 'એડમિન કેન્દ્ર',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('auto');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
