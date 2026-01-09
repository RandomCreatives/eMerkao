import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

const Cart: React.FC = () => {
  // Mock cart data for now
  const cartItems = [
    {
      id: '1',
      name: 'Handwoven Habesha Kemis',
      price: 4500,
      quantity: 1,
      image: 'https://picsum.photos/seed/kemis/200/200'
    },
    {
      id: '2',
      name: 'Pure Berbere Spice (500g)',
      price: 350,
      quantity: 2,
      image: 'https://picsum.photos/seed/berbere/200/200'
    }
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-8 pb-24 md:pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-orange-600 p-3 rounded-2xl text-white">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Shopping Bag</h1>
          <p className="text-stone-500 text-sm">{cartItems.length} items in your bag</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-xl font-black text-stone-900 mb-2">Your bag is empty</h2>
          <p className="text-stone-500 mb-6">Add some products to get started</p>
          <button className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-900 mb-1">{item.name}</h3>
                    <p className="text-orange-600 font-black">{item.price.toLocaleString()} ETB</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-black text-stone-900 w-8 text-center">{item.quantity}</span>
                    <button className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm h-fit">
            <h2 className="font-black text-stone-900 text-lg uppercase tracking-tight mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-bold">{total.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="border-t border-stone-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-black text-stone-900">Total</span>
                  <span className="font-black text-xl">{total.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20">
              Proceed to Checkout
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-stone-500">
                🔒 Secure checkout with Telebirr
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;