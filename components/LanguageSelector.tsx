import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ currentLang, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: Language.ENGLISH, name: 'English', flag: '🇺🇸' },
    { code: Language.AMHARIC, name: 'አማርኛ', flag: '🇪🇹' },
    { code: Language.OROMO, name: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: Language.TIGRINYA, name: 'ትግርኛ', flag: '🇪🇹' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
      >
        <Globe className="w-4 h-4 text-stone-600" />
        <span className="text-sm font-medium text-stone-600">{currentLanguage.flag}</span>
        <ChevronDown className="w-4 h-4 text-stone-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 min-w-[200px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelect(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                currentLang === lang.code ? 'bg-orange-50 text-orange-600' : 'text-stone-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;