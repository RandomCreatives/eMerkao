import React from 'react';
import { Home, Search, ShoppingBag, User, Store } from 'lucide-react';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  userType?: 'buyer' | 'seller';
}

const BottomNav: React.FC<Props> = ({ currentPage, onNavigate, userType }) => {
  const getAccountRoute = () => {
    if (!userType) return 'profile';
    return userType === 'seller' ? 'seller' : 'buyer-dashboard';
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart' },
    { id: getAccountRoute(), icon: userType === 'seller' ? Store : User, label: userType === 'seller' ? 'Store' : 'Account' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-2 md:hidden z-40">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;