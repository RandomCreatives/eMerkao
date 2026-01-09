
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Heart, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Star, 
  Wallet, 
  Zap, 
  ShoppingBag, 
  Truck,
  CheckCircle2,
  Gift,
  TrendingUp,
  Receipt,
  CreditCard,
  Calendar,
  Eye,
  Filter,
  Download,
  Bell,
  Award,
  Target,
  LogOut
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import { useAuth } from '../components/AuthProvider';

interface Props {
  user: { 
    id: string;
    full_name: string; 
    user_type: string;
    region?: string;
    trust_score?: number;
  };
  onNavigate: (page: string) => void;
}

const BuyerDashboard: React.FC<Props> = ({ user, onNavigate }) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Mock data for buyer dashboard
  const activeOrders = [
    { 
      id: 'EM-4401', 
      status: 'shipped', 
      date: 'Oct 24', 
      total: 4500, 
      item: 'Handwoven Habesha Kemis',
      seller: "Kebebush's Traditional Boutique",
      tracking: 'ETH-TRK-001234',
      estimatedDelivery: 'Oct 26',
      image: 'https://picsum.photos/seed/kemis/200/200'
    },
    { 
      id: 'EM-4402', 
      status: 'processing', 
      date: 'Oct 25', 
      total: 350, 
      item: 'Pure Berbere Spice (500g)',
      seller: 'Addis Spice Market',
      tracking: null,
      estimatedDelivery: 'Oct 28',
      image: 'https://picsum.photos/seed/berbere/200/200'
    },
    { 
      id: 'EM-4403', 
      status: 'delivered', 
      date: 'Oct 20', 
      total: 850, 
      item: 'Traditional Jebena Set',
      seller: 'Ethiopian Coffee Culture',
      tracking: 'ETH-TRK-001122',
      estimatedDelivery: 'Oct 22',
      image: 'https://picsum.photos/seed/jebena/200/200'
    }
  ];

  const wishlistItems = MOCK_PRODUCTS.slice(0, 6);

  const paymentHistory = [
    {
      id: 'PAY-001',
      date: '2024-10-24',
      amount: 4500,
      method: 'Telebirr',
      status: 'completed',
      orderId: 'EM-4401',
      merchant: "Kebebush's Traditional Boutique"
    },
    {
      id: 'PAY-002',
      date: '2024-10-25',
      amount: 350,
      method: 'CBE Birr',
      status: 'completed',
      orderId: 'EM-4402',
      merchant: 'Addis Spice Market'
    },
    {
      id: 'PAY-003',
      date: '2024-10-20',
      amount: 850,
      method: 'Telebirr',
      status: 'completed',
      orderId: 'EM-4403',
      merchant: 'Ethiopian Coffee Culture'
    }
  ];

  const regionalTrends = [
    {
      category: 'Habesha Clothes',
      trend: '+25%',
      reason: 'Ethiopian New Year celebrations approaching',
      products: ['Traditional Kemis', 'Ceremonial Shawls', 'Cultural Accessories']
    },
    {
      category: 'Coffee Sets',
      trend: '+18%',
      reason: 'Coffee ceremony season in Addis Ababa',
      products: ['Jebena Sets', 'Coffee Cups', 'Roasting Pans']
    },
    {
      category: 'Spices',
      trend: '+12%',
      reason: 'Fasting season preparation',
      products: ['Berbere Blends', 'Mitmita', 'Shiro Powder']
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase flex items-center gap-3">
            Selam, {user.full_name.split(' ')[0]} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-stone-500 text-sm font-medium">Welcome back to your eMerkato dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Telebirr Balance</div>
              <div className="text-sm font-black text-stone-900">1,240.50 ETB</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl border border-emerald-100">
            <Award className="w-5 h-5" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest">Trust Score</div>
              <div className="text-sm font-black">{user.trust_score || 92}%</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest hidden md:block">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: Target },
          { id: 'orders', label: 'My Orders', icon: Package },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'trends', label: 'Regional Trends', icon: TrendingUp },
          { id: 'payments', label: 'Payment History', icon: Receipt }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-orange-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'My Orders', value: activeOrders.length.toString(), color: 'bg-orange-50 text-orange-600', trend: '+2 this month' },
              { icon: Heart, label: 'Wishlist', value: wishlistItems.length.toString(), color: 'bg-pink-50 text-pink-600', trend: '+5 items' },
              { icon: Star, label: 'Reviews', value: '8', color: 'bg-yellow-50 text-yellow-600', trend: '4.9 avg rating' },
              { icon: Zap, label: 'Rewards', value: '850', color: 'bg-emerald-50 text-emerald-600', trend: '150 this week' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-stone-900">{stat.value}</div>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{stat.label}</div>
                <div className="text-[9px] text-emerald-600 font-bold mt-1">{stat.trend}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-stone-800">Recent Orders</h2>
              <button 
                onClick={() => setActiveTab('orders')}
                className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {activeOrders.slice(0, 2).map(order => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                  <img src={order.image} alt={order.item} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="font-bold text-stone-900">{order.item}</div>
                    <div className="text-sm text-stone-500">{order.seller}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-[9px] text-stone-400">{order.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-stone-900">{order.total} ETB</div>
                    {order.tracking && (
                      <div className="text-[9px] text-blue-600 font-bold">Track: {order.tracking}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight text-stone-800">Order Tracking</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
                <Filter className="w-5 h-5 text-stone-600" />
              </button>
              <button className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
                <Bell className="w-5 h-5 text-stone-600" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <img src={order.image} alt={order.item} className="w-20 h-20 rounded-2xl object-cover" />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-black text-stone-900 text-lg">{order.item}</div>
                        <div className="text-stone-500 text-sm font-medium">{order.seller}</div>
                        <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">
                          Order #{order.id} • {order.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-stone-900">{order.total} ETB</div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                    </div>

                    {/* Order Progress */}
                    <div className="bg-stone-50 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Order Progress</span>
                        <span className="text-[10px] font-black text-stone-600">Est. Delivery: {order.estimatedDelivery}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-stone-300'}`}></div>
                        <div className={`flex-1 h-1 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-stone-300'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-stone-300'}`}></div>
                        <div className={`flex-1 h-1 ${order.status === 'delivered' ? 'bg-orange-600' : 'bg-stone-300'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-orange-600' : 'bg-stone-300'}`}></div>
                      </div>
                      
                      <div className="flex justify-between mt-2 text-[9px] font-bold text-stone-500">
                        <span>Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {order.tracking && (
                        <button className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors">
                          Track Package
                        </button>
                      )}
                      <button className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors">
                        Contact Seller
                      </button>
                      {order.status === 'delivered' && (
                        <button className="flex-1 bg-orange-50 text-orange-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-100 transition-colors">
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-800">Cultural Wishlist</h2>
              <p className="text-stone-500 text-sm">Your curated collection of traditional Ethiopian items</p>
            </div>
            <button className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
              Share List
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                <div className="aspect-square relative overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-pink-600 shadow-sm hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  {item.isCultural && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-stone-900 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                      Cultural
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{item.category}</div>
                  <div className="text-sm font-bold text-stone-900 truncate mt-1">{item.name}</div>
                  <div className="text-orange-600 font-black text-sm mt-2">{item.price.toLocaleString()} ETB</div>
                  <button className="w-full mt-3 bg-stone-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-800">Regional Trends</h2>
              <p className="text-stone-500 text-sm">AI-powered insights for {user.region || 'Addis Ababa'}</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl border border-indigo-100">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">AI Powered</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionalTrends.map((trend, index) => (
              <div key={index} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-stone-900">{trend.category}</h3>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-black">{trend.trend}</span>
                  </div>
                </div>
                
                <p className="text-stone-600 text-sm mb-4 leading-relaxed">{trend.reason}</p>
                
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Popular Items</div>
                  {trend.products.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <span className="text-stone-700 font-medium">{product}</span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 bg-stone-100 text-stone-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  Explore Category
                </button>
              </div>
            ))}
          </div>

          {/* Regional Insights */}
          <div className="bg-gradient-to-br from-indigo-900 to-stone-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <MapPin className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-lg">Location Insights</h3>
                  <p className="text-indigo-200 text-sm">{user.region || 'Addis Ababa'} Market Analysis</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">2.4x</div>
                  <div className="text-indigo-200 text-sm">Faster delivery in your area</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">156</div>
                  <div className="text-indigo-200 text-sm">Local sellers nearby</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">92%</div>
                  <div className="text-indigo-200 text-sm">Cultural authenticity rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-800">Payment History</h2>
              <p className="text-stone-500 text-sm">Telebirr & CBE transaction records with digital receipts</p>
            </div>
            <button className="flex items-center gap-2 bg-stone-100 text-stone-600 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="space-y-4">
            {paymentHistory.map(payment => (
              <div key={payment.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${payment.method === 'Telebirr' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-black text-stone-900">{payment.merchant}</div>
                      <div className="text-stone-500 text-sm">Order #{payment.orderId}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{payment.method}</span>
                        <span className="text-[9px] text-stone-400">•</span>
                        <span className="text-[9px] text-stone-400">{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-black text-stone-900">{payment.amount.toLocaleString()} ETB</div>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 text-sm font-bold capitalize">{payment.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4 pt-4 border-t border-stone-100">
                  <button className="flex-1 bg-stone-100 text-stone-600 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors">
                    View Receipt
                  </button>
                  <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors">
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-8 rounded-[3rem] text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-2xl mb-2">Payment Summary</h3>
                <p className="text-white/80 text-sm">This month's transaction overview</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
                <div className="text-white/80 text-sm">Total Spent (ETB)</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <div className="text-lg font-black">{paymentHistory.length}</div>
                <div className="text-white/80 text-xs uppercase tracking-widest">Transactions</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <div className="text-lg font-black">100%</div>
                <div className="text-white/80 text-xs uppercase tracking-widest">Success Rate</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <div className="text-lg font-black">2.1s</div>
                <div className="text-white/80 text-xs uppercase tracking-widest">Avg Speed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
