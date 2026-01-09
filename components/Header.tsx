
import React from 'react';
import { ShoppingCart, User, Search, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import LanguageSelector from './LanguageSelector';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
  onNavigate: (page: string) => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  user?: any;
}

const Header: React.FC<Props> = ({ 
  lang, 
  setLang, 
  onNavigate, 
  onBack, 
  onForward, 
  canGoBack, 
  canGoForward, 
  user 
}) => {
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS[Language.ENGLISH];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Nav History Controls */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-orange-600 p-2 rounded-lg group-hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20">
              <Store className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-orange-600 hidden sm:block">
              e<span className="text-stone-800">Merkato</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={(e) => { e.stopPropagation(); onBack(); }}
              disabled={!canGoBack}
              className={`p-1.5 rounded-lg transition-all ${canGoBack ? 'text-stone-900 hover:bg-white hover:shadow-sm' : 'text-stone-300 cursor-not-allowed'}`}
              title="Go Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-stone-200 mx-0.5" />
            <button
              onClick={(e) => { e.stopPropagation(); onForward(); }}
              disabled={!canGoForward}
              className={`p-1.5 rounded-lg transition-all ${canGoForward ? 'text-stone-900 hover:bg-white hover:shadow-sm' : 'text-stone-300 cursor-not-allowed'}`}
              title="Go Forward"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search - Desktop Only */}
        <div className="flex-1 max-w-xl hidden md:flex relative">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full bg-stone-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden xs:flex items-center">
             <LanguageSelector currentLang={lang} onSelect={setLang} />
          </div>
          
          <button 
            onClick={() => onNavigate('cart')}
            className="hidden md:flex p-2 text-stone-600 hover:text-orange-600 relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">2</span>
          </button>

          <button 
            onClick={() => onNavigate('seller')}
            className="hidden md:flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-xl hover:bg-black transition-all font-bold text-sm"
          >
            <Store className="w-4 h-4" />
            <span>{user?.type === 'seller' ? 'Dashboard' : 'Sell'}</span>
          </button>

          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1.5 md:p-2 text-stone-600 hover:text-orange-600 transition-colors"
          >
            {user?.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-xs border border-orange-200 shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-stone-900 truncate max-w-[80px]">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <User className="w-6 h-6" />
            )}
          </button>

          {/* Search Icon - Mobile Only */}
          <button 
            onClick={() => onNavigate('search')}
            className="md:hidden p-2 text-stone-600"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
