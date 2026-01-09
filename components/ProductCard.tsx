
import React from 'react';
import { Star, MapPin, Plus, ShieldCheck, ShoppingBag, MessageSquare } from 'lucide-react';
import { Product } from '../types';

interface Props {
  product: Product;
  onClick: (section?: string) => void;
  onAddToCart?: (name: string) => void;
  onBuyNow?: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onClick, onAddToCart, onBuyNow }) => {
  return (
    <div 
      onClick={() => onClick()}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-200 hover:shadow-2xl hover:shadow-orange-100 hover:-translate-y-1 transition-all cursor-pointer group active:scale-[0.97] touch-none select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-stone-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isCultural && (
            <div className="bg-yellow-400 text-stone-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-yellow-400/20 backdrop-blur-sm border border-yellow-300 scale-90 md:scale-100 origin-left">
              Cultural
            </div>
          )}
          {product.isTrusted && (
            <div className="bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center gap-1.5 border border-emerald-400/30 scale-90 md:scale-100 origin-left">
              <ShieldCheck className="w-3 h-3" />
              Trusted
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] truncate flex-1">{product.category}</span>
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 text-orange-500 fill-current" />
              <span className="text-[10px] font-black text-orange-700">{product.rating}</span>
            </div>
          </div>
          <h3 className="font-black text-stone-900 text-sm md:text-lg leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick('reviews');
            }}
            className="flex items-center gap-1.5 text-[9px] font-black text-stone-400 hover:text-orange-600 uppercase tracking-widest transition-colors py-1"
          >
            <MessageSquare className="w-3 h-3" />
            See Reviews
          </button>

          <div className="flex items-center gap-1 text-stone-400 text-[10px] font-bold uppercase tracking-wider mt-1">
            <MapPin className="w-3 h-3" />
            <span>{product.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
             <span className="text-xl md:text-2xl font-black text-stone-900 leading-none tracking-tighter">
                {product.price.toLocaleString()}
             </span>
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">ETB Total</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onBuyNow?.(); }}
              className="hidden sm:flex px-4 py-3 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-stone-900/10 active:scale-90"
            >
              Buy Now
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onAddToCart?.(product.name); 
              }}
              className="w-12 h-12 bg-white border-2 border-stone-100 text-stone-900 rounded-[1.25rem] flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-lg shadow-stone-200/50 active:scale-75"
              title="Add to Bag"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
