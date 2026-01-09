
import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, X, SlidersHorizontal, Search } from 'lucide-react';
import { Product, Language } from '../types';
import { MOCK_PRODUCTS, CULTURAL_CATEGORIES, REGIONS } from '../constants';
import ProductCard from '../components/ProductCard';

interface Props {
  lang: Language;
  onNavigate: (page: string) => void;
  onAddToast: (msg: string) => void;
  onProductClick: (product: Product) => void;
}

const Shop: React.FC<Props> = ({ lang, onNavigate, onAddToast, onProductClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [onlyTrusted, setOnlyTrusted] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = ['All', ...CULTURAL_CATEGORIES, 'Electronics', 'General'];

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => p.price <= priceRange);

    if (selectedLocation !== 'All') {
      result = result.filter(p => p.location === selectedLocation);
    }

    if (onlyTrusted) {
      result = result.filter(p => p.isTrusted);
    }

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [selectedCategory, priceRange, selectedLocation, onlyTrusted, sortBy]);

  const FilterSection = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Categories</h4>
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === cat ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Max Price</h4>
          <span className="text-xs font-black text-orange-600">{priceRange.toLocaleString()} ETB</span>
        </div>
        <input 
          type="range" 
          min="100" 
          max="50000" 
          step="500"
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="w-full accent-orange-600 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Location</h4>
        <select 
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none"
        >
          <option value="All">All Regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Trust Toggle */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="flex items-center gap-2">
           <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Filter className="w-3 h-3" /></div>
           <span className="text-[10px] font-black uppercase text-emerald-800 tracking-tight">Trusted Only</span>
        </div>
        <button 
          onClick={() => setOnlyTrusted(!onlyTrusted)}
          className={`w-10 h-6 rounded-full transition-all relative ${onlyTrusted ? 'bg-emerald-600' : 'bg-stone-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${onlyTrusted ? 'left-5' : 'left-1'}`}></div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-none sticky top-24 h-fit">
        <div className="flex items-center gap-2 mb-8">
          <SlidersHorizontal className="w-5 h-5 text-stone-400" />
          <h2 className="text-xl font-black uppercase tracking-tight">Filters</h2>
        </div>
        <FilterSection />
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter">Market</h1>
            <span className="text-[10px] font-black text-stone-400 bg-stone-100 px-2 py-1 rounded-full">{filteredProducts.length} Results</span>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest outline-none appearance-none pr-10"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onClick={() => onProductClick(p)} 
                onBuyNow={() => onNavigate('cart')}
                onAddToCart={(name) => onAddToast(`Added ${name} to bag!`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-300">
                <Search className="w-10 h-10" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tight">No products found</h3>
                <p className="text-stone-400 text-sm">Try adjusting your filters to find what you're looking for.</p>
             </div>
             <button 
               onClick={() => {
                 setSelectedCategory('All');
                 setPriceRange(50000);
                 setSelectedLocation('All');
                 setOnlyTrusted(false);
               }}
               className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline"
             >
               Reset All Filters
             </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-200">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-stone-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <FilterSection />
            <div className="mt-8 pt-6 border-t border-stone-100">
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
