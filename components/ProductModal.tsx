import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../types';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (name: string) => void;
  onNavigate: (page: string) => void;
  onProductSelect: (product: Product) => void;
  initialSection?: string;
}

const ProductModal: React.FC<Props> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onNavigate,
  onProductSelect,
  initialSection 
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-stone-900">{product.name}</h2>
            <button 
              onClick={onClose}
              className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover rounded-2xl mb-6"
          />
          
          <div className="space-y-4">
            <div className="text-2xl font-black text-orange-600">
              {product.price.toLocaleString()} ETB
            </div>
            
            <p className="text-stone-600 leading-relaxed">
              {product.description}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => onAddToCart(product.name)}
                className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => {
                  onNavigate('cart');
                  onClose();
                }}
                className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-stone-800 transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;