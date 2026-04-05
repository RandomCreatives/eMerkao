
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import BottomNav from './components/BottomNav';
import ProductModal from './components/ProductModal';
import { Language, Product } from './types';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from './components/AuthProvider';

interface Toast {
  id: number;
  message: string;
}

const App: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [currentPage, setCurrentPage] = useState('home');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  
  // Product Expansion State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialSection, setInitialSection] = useState<string | undefined>(undefined);
  
  // Navigation History Management
  const [history, setHistory] = useState<string[]>(['home']);
  const [historyPointer, setHistoryPointer] = useState(0);

  // Check if we're in demo mode (no Supabase configured)
  const isDemoMode = !((typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL : null) || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : null));

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleProductClick = (product: Product, section?: string) => {
    setSelectedProduct(product);
    setInitialSection(section);
    setIsModalOpen(true);
  };

  const navigateTo = useCallback((page: string, replace = false) => {
    if (page === currentPage) return;

    if (replace) {
      const newHistory = [...history];
      newHistory[historyPointer] = page;
      setHistory(newHistory);
    } else {
      const newHistory = history.slice(0, historyPointer + 1);
      newHistory.push(page);
      setHistory(newHistory);
      setHistoryPointer(newHistory.length - 1);
    }
    setCurrentPage(page);
  }, [currentPage, history, historyPointer]);

  const goBack = useCallback(() => {
    if (historyPointer > 0) {
      const prevPage = history[historyPointer - 1];
      setHistoryPointer(historyPointer - 1);
      setCurrentPage(prevPage);
    }
  }, [history, historyPointer]);

  const goForward = useCallback(() => {
    if (historyPointer < history.length - 1) {
      const nextPage = history[historyPointer + 1];
      setHistoryPointer(historyPointer + 1);
      setCurrentPage(nextPage);
    }
  }, [history, historyPointer]);

  const handleLogin = (userData: any) => {
    // Check if it's a demo login with mock profile data
    if (userData.user_metadata) {
      // For demo users, navigate based on their type
      const destination = userData.user_metadata.user_type === 'seller' ? 'seller' : 'buyer-dashboard';
      navigateTo(destination);
    } else {
      // For real auth, navigation will be handled by auth state change
      const destination = userData.user_type === 'seller' ? 'seller' : 'buyer-dashboard';
      navigateTo(destination);
    }
  };

  const handleLogout = async () => {
    try {
      // Call the actual signOut function from AuthProvider
      await signOut();
      
      // Reset navigation state
      setHistory(['home']);
      setHistoryPointer(0);
      setCurrentPage('home');
      addToast('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      addToast('Logout failed. Please try again.');
    }
  };

  const renderPage = () => {
    // Show loading spinner while auth is loading
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    switch(currentPage) {
      case 'home': return <Home lang={lang} onNavigate={navigateTo} onAddToast={addToast} onProductClick={handleProductClick} />;
      case 'shop': return <Shop lang={lang} onNavigate={navigateTo} onAddToast={addToast} onProductClick={handleProductClick} />;
      case 'seller': 
        return user && profile?.user_type === 'seller' ? <SellerDashboard /> : <Auth onLogin={handleLogin} onBack={goBack} lang={lang} />;
      case 'buyer-dashboard':
        return user && profile?.user_type === 'buyer' ? <BuyerDashboard user={profile} onNavigate={navigateTo} /> : <Auth onLogin={handleLogin} onBack={goBack} lang={lang} />;
      case 'cart': return <Cart />;
      case 'auth': return <Auth onLogin={handleLogin} onBack={goBack} lang={lang} />;
      case 'search': return (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Search eMerkato</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              className="w-full bg-white border border-stone-200 rounded-2xl px-12 py-4 shadow-sm outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="absolute left-4 top-4 text-stone-400">🔍</div>
          </div>
        </div>
      );
      case 'profile': 
        if (!user || !profile) return <Auth onLogin={handleLogin} onBack={goBack} lang={lang} />;
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 px-4">
            <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner border-4 border-white">
              {profile.full_name.charAt(0)}
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Logged in as {profile.user_type}</div>
              <h2 className="text-3xl font-black tracking-tight">{profile.full_name}</h2>
              {profile.sellers?.store_name && <p className="text-stone-500 font-bold italic">"{profile.sellers.store_name}"</p>}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={() => navigateTo(profile.user_type === 'seller' ? 'seller' : 'buyer-dashboard')} 
                className="w-full bg-stone-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Go to Dashboard
              </button>
              <button onClick={handleLogout} className="w-full bg-white border border-stone-200 text-red-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                Logout
              </button>
            </div>
          </div>
        );
      default: return <Home lang={lang} onNavigate={navigateTo} onAddToast={addToast} onProductClick={handleProductClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-orange-200 selection:text-orange-900 pb-16 md:pb-0">
      {/* Demo Mode Banner */}
      {isDemoMode && showDemoBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-sm">
                <span className="font-bold">Demo Mode:</span> Running with mock data. 
                <a 
                  href="https://github.com/yourusername/emerkato#setup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline ml-1 hover:text-blue-200"
                >
                  Set up Supabase to enable full functionality
                </a>
              </div>
            </div>
            <button 
              onClick={() => setShowDemoBanner(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <Header 
        lang={lang} 
        setLang={setLang} 
        onNavigate={navigateTo}
        onBack={goBack}
        onForward={goForward}
        canGoBack={historyPointer > 0}
        canGoForward={historyPointer < history.length - 1}
        user={profile}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {renderPage()}
      </main>

      <BottomNav currentPage={currentPage} onNavigate={navigateTo} userType={profile?.user_type} />

      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialSection(undefined);
        }}
        onAddToCart={(name) => addToast(`Added ${name} to bag!`)}
        onNavigate={navigateTo}
        onProductSelect={(product) => setSelectedProduct(product)}
        initialSection={initialSection}
      />

      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 text-stone-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
