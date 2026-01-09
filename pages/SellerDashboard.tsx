
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  Zap, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Star,
  Calendar,
  Wallet,
  ClipboardList,
  Layers,
  LayoutDashboard,
  X,
  Sparkles,
  Type as TypeIcon,
  History,
  Clock,
  ChevronRight,
  Facebook,
  Instagram,
  Settings as SettingsIcon,
  ToggleLeft,
  ToggleRight,
  Globe,
  Share2,
  ShieldCheck,
  Medal,
  Link as LinkIcon,
  Lightbulb,
  CreditCard,
  BarChart3,
  LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateProductDescription, parseTelegramProduct } from '../services/geminiService';
import { MOCK_PRODUCTS, CULTURAL_CATEGORIES } from '../constants';
import { Product, CrossPostSettings } from '../types';
import { useAuth } from '../components/AuthProvider';

const MOCK_SALES_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const MOCK_ALL_ORDERS = [
  { id: 'ORD-772', items: [{ name: 'Habesha Kemis', qty: 1 }], total: 4500, status: 'pending', date: '2023-10-24' },
  { id: 'ORD-810', items: [{ name: 'Berbere Spice', qty: 2 }], total: 700, status: 'shipped', date: '2023-10-23' },
  { id: 'ORD-905', items: [{ name: 'Jebena Clay Pot', qty: 1 }], total: 850, status: 'delivered', date: '2023-10-20' },
  { id: 'ORD-441', items: [{ name: 'Tecno Spark 10 Pro', qty: 1 }], total: 18500, status: 'cancelled', date: '2023-10-15' },
  { id: 'ORD-212', items: [{ name: 'Berbere Spice', qty: 1 }, { name: 'Jebena', qty: 1 }], total: 1200, status: 'delivered', date: '2023-10-12' },
];

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string | any; 
  time: string;
  isSystem?: boolean;
}

const STORAGE_KEY = 'emerkato_bot_history';
const INTEGRATION_KEY = 'emerkato_integrations';

const SellerDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Consultant State
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Real-time Product State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Cross-Post Settings State
  const [integrations, setIntegrations] = useState<CrossPostSettings>({
    facebookEnabled: true,
    instagramEnabled: false,
    n8nWebhookUrl: 'https://n8n.emerkato.et/webhook/cross-post'
  });

  // New Product Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CULTURAL_CATEGORIES[0]);
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Bot Simulator State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth state change in App.tsx
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Load Insights
  useEffect(() => {
    if (activeTab === 'ai-consultant' && !aiInsights) {
      fetchInsights();
    }
  }, [activeTab]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    // Simulating context for Gemini
    const context = `Store sells: ${products.map(p => p.name).join(', ')}. Recent sales: 42.5K ETB. Current season: Ethiopian Wedding Season.`;
    try {
      const response = await generateProductDescription("My Entire Store", "Market Analysis");
      setAiInsights(response);
    } catch (e) {
      setAiInsights("Unable to reach AI consultant. Please check your connection.");
    }
    setLoadingInsights(false);
  };

  // Load integration settings
  useEffect(() => {
    const saved = localStorage.getItem(INTEGRATION_KEY);
    if (saved) setIntegrations(JSON.parse(saved));
  }, []);

  // Save integration settings
  useEffect(() => {
    localStorage.setItem(INTEGRATION_KEY, JSON.stringify(integrations));
  }, [integrations]);

  // Load chat history
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatMessages(parsed);
      } catch (e) {
        initBot();
      }
    } else {
      initBot();
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (chatMessages.length > 0) {
      const serializableMessages = chatMessages.map(msg => ({
        ...msg,
        content: typeof msg.content === 'string' ? msg.content : '[Dynamic Content]'
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableMessages));
    }
  }, [chatMessages]);

  const initBot = () => {
    setChatMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: "eMerkato Seller Assistant 🇪🇹. I'm monitoring your groups for product posts. Simply describe a product to sync it to your store!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      }
    ]);
  };

  const clearHistory = () => {
    if (confirm("Clear all bot interaction history?")) {
      localStorage.removeItem(STORAGE_KEY);
      initBot();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAiGenerate = async () => {
    if (!formName || !formCategory) {
      alert("Please provide a product name and category first!");
      return;
    }
    setIsGenerating(true);
    const result = await generateProductDescription(formName, formCategory);
    if (result) {
      setFormDescription(result);
    }
    setIsGenerating(false);
  };

  const triggerN8nAutomation = async (product: Product) => {
    const targets = [];
    if (integrations.facebookEnabled) targets.push('Facebook Marketplace');
    if (integrations.instagramEnabled) targets.push('Instagram Feed');
    return targets;
  };

  const handleSaveProduct = async () => {
    if (!formName || !formPrice) return;
    
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: formName,
      price: Number(formPrice),
      category: formCategory,
      image: `https://picsum.photos/seed/${formName}/600/600`,
      description: formDescription,
      location: 'Addis Ababa',
      rating: 5.0,
      sellerId: 's1',
      isCultural: CULTURAL_CATEGORIES.includes(formCategory),
      isTrusted: true
    };

    setProducts(prev => [newProduct, ...prev]);
    setIsAddingProduct(false);
    resetForm();
    setActiveTab('inventory');
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory(CULTURAL_CATEGORIES[0]);
    setFormPrice('');
    setFormDescription('');
  };

  const addBotMessage = (content: string | React.ReactNode) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const processSyncMessage = async (message: string) => {
    addBotMessage(
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3 h-3 animate-spin text-orange-500" />
        <span>AI Parsing Product Details...</span>
      </div>
    );
    
    const parsed = await parseTelegramProduct(message);
    
    if (parsed && parsed.name) {
      const newProduct: Product = {
        id: `sync-${Date.now()}`,
        name: parsed.name,
        price: parsed.price || 0,
        category: parsed.category || 'General',
        image: `https://picsum.photos/seed/${parsed.name}/600/600`,
        description: parsed.description || '',
        location: 'Addis Ababa',
        rating: 5.0,
        sellerId: 's1',
        isCultural: CULTURAL_CATEGORIES.includes(parsed.category),
        isTrusted: true
      };

      setProducts(prev => [newProduct, ...prev]);
      
      addBotMessage(
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" /> Product Synced Successfully
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3">
             <img src={newProduct.image} className="w-10 h-10 rounded-lg object-cover" />
             <div>
               <div className="text-xs font-bold">{newProduct.name}</div>
               <div className="text-[10px] text-orange-400 font-black">{newProduct.price} ETB</div>
             </div>
          </div>
          <button 
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-bold text-[10px] uppercase tracking-widest"
          >
            <LinkIcon className="w-3 h-3" /> View in Inventory
          </button>
        </div>
      );

      // Enhanced n8n automation flow
      const activeTargets = await triggerN8nAutomation(newProduct);
      if (activeTargets.length > 0) {
        addBotMessage(
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
              <Share2 className="w-3 h-3" /> n8n Workflow Triggered
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
              <p className="text-[10px] text-stone-300">Cross-posting to: {activeTargets.join(', ')}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-green-400 font-bold">Automation Active</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] text-stone-400">✓ Facebook Marketplace post scheduled</div>
              <div className="text-[9px] text-stone-400">✓ Instagram story created</div>
              <div className="text-[9px] text-stone-400">✓ WhatsApp Business catalog updated</div>
            </div>
          </div>
        );

        // Simulate "Mark as Delivered" trigger after a delay
        setTimeout(() => {
          addBotMessage(
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                <Truck className="w-3 h-3" /> Delivery Automation Ready
              </div>
              <p className="text-[10px] text-stone-300">
                When you mark orders as "delivered", n8n will automatically:
              </p>
              <div className="space-y-1">
                <div className="text-[9px] text-stone-400">• Send customer satisfaction survey</div>
                <div className="text-[9px] text-stone-400">• Request product review</div>
                <div className="text-[9px] text-stone-400">• Update inventory levels</div>
                <div className="text-[9px] text-stone-400">• Trigger restock alerts if needed</div>
              </div>
            </div>
          );
        }, 2000);
      }
    } else {
      addBotMessage("❌ Sync failed: I couldn't extract product details from that message. Try including Name, Category, and Price in ETB.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    const userMsg = inputValue;
    setChatMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInputValue('');
    setIsProcessing(true);
    
    const lowerMsg = userMsg.toLowerCase();

    if (lowerMsg.includes('price') || lowerMsg.includes('etb') || lowerMsg.includes('selling') || userMsg.length > 30) {
      await processSyncMessage(userMsg);
    } else if (lowerMsg === '/promote') {
      addBotMessage("🚀 Promotion Mode: Choose a product from your inventory to boost.");
    } else if (lowerMsg === '/ship') {
      addBotMessage("📦 Fulfillment Mode: Select a pending order to ship.");
    } else if (lowerMsg === '/trust' || lowerMsg === '/badge') {
      addBotMessage(
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
            <Medal className="w-3 h-3" /> Trust Status Report
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
             <div className="flex justify-between text-[10px]">
                <span className="text-stone-400">Order Delivery Rate</span>
                <span className="text-emerald-400 font-bold">98%</span>
             </div>
             <div className="flex justify-between text-[10px]">
                <span className="text-stone-400">Positive Reviews</span>
                <span className="text-emerald-400 font-bold">4.9/5</span>
             </div>
             <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]"></div>
             </div>
          </div>
          <p className="text-xs">You are currently a <b>Trusted Seller</b>. Keep maintaining fast deliveries to keep your badge!</p>
        </div>
      );
    } else {
      setTimeout(() => addBotMessage("I'm ready! Paste a product post from a Telegram group and I'll sync it to eMerkato for you. (Commands: /ship, /promote, /trust)"), 800);
    }
    setIsProcessing(false);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'ai-consultant', icon: Sparkles, label: 'AI Business Consultant' },
    { id: 'orders', icon: ClipboardList, label: 'Orders' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'bot', icon: Send, label: 'Bot Assistant' },
    { id: 'services', icon: Globe, label: 'Service Marketplace' },
    { id: 'integrations', icon: Share2, label: 'Store Sync' },
    { id: 'finance', icon: DollarSign, label: 'Earnings' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-24 md:pb-20 relative">
      {/* Creation Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-stone-900 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-xl"><Plus className="text-white w-5 h-5" /></div>
                <h2 className="text-white font-black uppercase tracking-tight">Add New Product</h2>
              </div>
              <button onClick={() => setIsAddingProduct(false)} className="text-stone-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 md:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Product Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                  placeholder="e.g. Premium Berbere" 
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Category</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value)} 
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 appearance-none font-medium"
                  >
                    {CULTURAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Electronics">Electronics</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Price (ETB)</label>
                  <input 
                    type="number" 
                    value={formPrice} 
                    onChange={(e) => setFormPrice(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                  />
                </div>
              </div>
              <div className="space-y-2 relative">
                <div className="flex justify-between px-1 items-center">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Description</label>
                  <button 
                    type="button"
                    onClick={handleAiGenerate} 
                    disabled={isGenerating || !formName} 
                    className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse text-orange-400' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {isGenerating ? 'AI Writing...' : 'Magic Generate'}
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    value={formDescription} 
                    onChange={(e) => setFormDescription(e.target.value)} 
                    placeholder="Craft a story about your product..." 
                    className={`w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 min-h-[140px] text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all ${isGenerating ? 'opacity-50' : ''}`} 
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-2xl">
                      <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={handleSaveProduct} 
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
              >
                List on eMerkato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Nav */}
      <nav className="flex lg:flex-col overflow-x-auto lg:w-64 gap-2 pb-2 lg:pb-0 sticky top-16 bg-stone-50 z-40 py-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-none lg:w-full flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all text-sm whitespace-nowrap ${isActive ? 'bg-stone-900 text-white shadow-lg' : 'bg-white border border-stone-200 text-stone-600'}`}>
              <Icon className={`w-4 h-4 ${isActive && item.id === 'ai-consultant' ? 'animate-pulse' : ''}`} /> {item.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 space-y-6">
        {activeTab === 'overview' && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-black text-stone-800 tracking-tight uppercase">Seller Hub</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Trusted Merchant</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest hidden md:block">Logout</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Revenue</div>
                <div className="text-2xl font-black">42.5K <span className="text-xs font-medium">ETB</span></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Orders</div>
                <div className="text-2xl font-black">{MOCK_ALL_ORDERS.length}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 text-emerald-100 group-hover:text-emerald-500 transition-colors">
                  <Medal className="w-12 h-12 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Trust Score</div>
                  <div className="text-2xl font-black">92%</div>
                  <div className="text-emerald-600 text-[9px] font-bold mt-1 uppercase">Top 5% of Sellers</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Rating</div>
                <div className="text-2xl font-black">4.8 <span className="text-xs">/ 5</span></div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xs uppercase tracking-widest text-stone-400">Sales Performance</h3>
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-600/20"
                >
                  <Plus className="w-3 h-3" /> Quick Add
                </button>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={MOCK_SALES_DATA}><Bar dataKey="sales" fill="#ea580c" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai-consultant' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">AI Business Consultant</h2>
                  <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Personalized advice for your eMerkato store</p>
                </div>
                <button 
                  onClick={fetchInsights}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingInsights ? 'animate-spin' : ''}`} />
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-900 to-stone-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                            <Lightbulb className="w-6 h-6 text-yellow-400" />
                         </div>
                         <h3 className="font-black uppercase tracking-widest text-sm">Gemini Market Insights</h3>
                      </div>
                      
                      {loadingInsights ? (
                        <div className="space-y-4">
                           <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                           <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
                           <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-sm">
                           <p className="text-stone-300 leading-relaxed italic">{aiInsights}</p>
                        </div>
                      )}
                      
                      <div className="mt-8 pt-8 border-t border-white/5">
                         <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-4">Recommended Actions</div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                               <TrendingUp className="w-4 h-4 text-emerald-400" />
                               <span className="text-xs font-bold text-stone-200">Boost "Habesha Kemis" for Holiday Season</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                               <DollarSign className="w-4 h-4 text-orange-400" />
                               <span className="text-xs font-bold text-stone-200">Adjust price on "Berbere" to match top sellers</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-sm">
                      <h4 className="font-black text-stone-900 uppercase tracking-tight mb-4">Inventory Prediction</h4>
                      <p className="text-xs text-stone-500 mb-6">Based on past trends, you are likely to sell out of <b>Coffee Sets</b> in the next 7 days.</p>
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                            <span>Coffee Sets Stock Level</span>
                            <span className="text-red-500">Critical (12 left)</span>
                         </div>
                         <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[15%]"></div>
                         </div>
                         <button className="w-full mt-4 bg-stone-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Update Stock Now</button>
                      </div>
                   </div>
                   
                   <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-indigo-100"><TrendingUp className="w-16 h-16" /></div>
                      <h4 className="font-black text-indigo-900 uppercase tracking-tight mb-2 relative z-10">Smart Growth</h4>
                      <p className="text-xs text-indigo-700 leading-relaxed relative z-10">Stores with automated Telegram sync (like yours) typically grow <b>40% faster</b>. You have synced 2 products today!</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight uppercase">Stock Management</h2>
              <button onClick={() => setIsAddingProduct(true)} className="p-2 bg-stone-900 text-white rounded-xl"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-3xl border border-stone-200 flex items-center gap-4 shadow-sm hover:border-orange-200 transition-colors group">
                  <img src={product.image} className="w-20 h-20 rounded-2xl object-cover" alt={product.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm md:text-base truncate group-hover:text-orange-600 transition-colors">{product.name}</h3>
                      {product.isTrusted && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="text-orange-600 font-black text-sm">{product.price.toLocaleString()} ETB</div>
                    <div className="text-[10px] font-black text-stone-400 uppercase mt-1 tracking-tighter">{product.category}</div>
                  </div>
                  <button className="p-3 bg-stone-50 text-stone-400 rounded-2xl hover:bg-stone-900 hover:text-white transition-all">
                    <Zap className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bot' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><History className="w-5 h-5 text-stone-400" /><h2 className="text-sm font-black uppercase tracking-widest text-stone-600">Sync & Fulfillment Assistant</h2></div>
              <button onClick={clearHistory} className="text-[10px] font-black uppercase text-red-500">Clear History</button>
            </div>
            
            <div className="bg-blue-600 text-white p-4 rounded-3xl text-xs font-medium shadow-lg shadow-blue-600/20">
              💡 <b>Tip:</b> Paste a product post like: <br/> 
              <i className="opacity-80">"Selling Habesha Kemis, high quality, 4500 ETB, Category: Habesha Clothes"</i>
            </div>

            <div className="bg-[#242F3D] rounded-3xl overflow-hidden shadow-2xl border border-stone-700">
              <div className="bg-[#17212B] p-4 flex items-center gap-4 border-b border-white/5">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold relative">
                   B
                   <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#17212B] rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm tracking-tight">eMerkato Group Sync Bot</div>
                  <div className="text-emerald-400 text-[9px] uppercase font-black animate-pulse">Online & Monitoring Groups</div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-white/5 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"><SettingsIcon className="w-4 h-4" /></div>
                </div>
              </div>
              
              <div className="h-[450px] p-6 space-y-4 overflow-y-auto bg-[#0E1621] flex flex-col scrollbar-hide">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`p-4 rounded-2xl max-w-[85%] text-sm ${msg.type === 'bot' ? 'bg-[#182533] text-white self-start border border-white/5' : 'bg-[#2B5278] text-white self-end shadow-lg shadow-black/20'}`}>
                    <div className="flex flex-col gap-1">
                      {msg.content}
                    </div>
                    <div className="text-[9px] text-stone-500 mt-2 text-right opacity-50">{msg.time}</div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="bg-[#182533] text-white self-start p-4 rounded-2xl animate-pulse flex items-center gap-2 text-xs">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="bg-[#17212B] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-stone-500 hover:text-white transition-colors cursor-pointer">
                    <Layers className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                    placeholder="Paste group post here..." 
                    className="flex-1 bg-[#242F3D] rounded-2xl px-5 py-3.5 text-white text-sm outline-none border border-transparent focus:border-white/10 transition-all" 
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!inputValue.trim() || isProcessing}
                    className={`p-3.5 rounded-2xl transition-all ${inputValue.trim() ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-stone-800 text-stone-600'}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4">
                   <button onClick={() => setInputValue('/ship')} className="text-[9px] font-black uppercase text-stone-500 hover:text-white transition-colors">/ship</button>
                   <button onClick={() => setInputValue('/promote')} className="text-[9px] font-black uppercase text-stone-500 hover:text-white transition-colors">/promote</button>
                   <button onClick={() => setInputValue('/trust')} className="text-[9px] font-black uppercase text-stone-500 hover:text-white transition-colors">/trust</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
             <h2 className="text-2xl font-black uppercase tracking-tight">Active Orders</h2>
             <div className="space-y-3">
                {MOCK_ALL_ORDERS.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-stone-200 flex justify-between items-center group hover:border-orange-200 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                          <Package className="w-6 h-6" />
                       </div>
                       <div>
                        <div className="font-black text-stone-900">{order.id}</div>
                        <div className="text-xs text-stone-500 font-medium">{order.items[0].name} • {order.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-black">{order.total} ETB</div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getStatusStyle(order.status)} shadow-sm`}>
                        {order.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Service Marketplace</h2>
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Onboard additional services to grow your business</p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl border border-indigo-100">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">New Services</span>
              </div>
            </div>

            {/* Service Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Delivery Services */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-blue-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Popular
                  </div>
                </div>
                <h3 className="font-black text-xl mb-3">Express Delivery</h3>
                <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  Partner with local delivery services for same-day delivery in Addis Ababa and 2-day nationwide shipping.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Setup Fee</span>
                    <span className="font-bold">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Commission</span>
                    <span className="font-bold">5% per delivery</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Coverage</span>
                    <span className="font-bold">All Ethiopia</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors">
                  Enable Service
                </button>
              </div>

              {/* Payment Processing */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-green-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Essential
                  </div>
                </div>
                <h3 className="font-black text-xl mb-3">Payment Gateway</h3>
                <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  Accept Telebirr, CBE Birr, and international payments. Automatic settlement to your bank account.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Setup Fee</span>
                    <span className="font-bold">500 ETB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Transaction Fee</span>
                    <span className="font-bold">2.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Settlement</span>
                    <span className="font-bold">Next day</span>
                  </div>
                </div>
                <button className="w-full bg-green-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-colors">
                  Setup Payments
                </button>
              </div>

              {/* Marketing Services */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-purple-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Growth
                  </div>
                </div>
                <h3 className="font-black text-xl mb-3">Digital Marketing</h3>
                <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  Professional product photography, social media management, and targeted advertising campaigns.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Photography</span>
                    <span className="font-bold">50 ETB/photo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Social Media</span>
                    <span className="font-bold">1,500 ETB/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Ad Campaigns</span>
                    <span className="font-bold">Custom pricing</span>
                  </div>
                </div>
                <button className="w-full bg-purple-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-colors">
                  Get Quote
                </button>
              </div>

              {/* Inventory Management */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-orange-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Smart
                  </div>
                </div>
                <h3 className="font-black text-xl mb-3">Smart Inventory</h3>
                <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  AI-powered inventory management with automatic reorder alerts and demand forecasting.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Monthly Fee</span>
                    <span className="font-bold">200 ETB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">AI Insights</span>
                    <span className="font-bold">Included</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Integrations</span>
                    <span className="font-bold">Unlimited</span>
                  </div>
                </div>
                <button className="w-full bg-orange-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-colors">
                  Try Free
                </button>
              </div>

              {/* Customer Support */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    24/7
                  </div>
                </div>
                <h3 className="font-black text-xl mb-3">Customer Support</h3>
                <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  Dedicated customer support team handling inquiries in Amharic, Oromo, and English.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Basic Plan</span>
                    <span className="font-bold">800 ETB/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Premium Plan</span>
                    <span className="font-bold">1,500 ETB/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Languages</span>
                    <span className="font-bold">3 supported</span>
                  </div>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Analytics & Insights */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-pink-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Pro
                  </div>
                </div>
                <h3 className="font-black text-xl mb-3">Advanced Analytics</h3>
                <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  Deep insights into customer behavior, sales patterns, and market trends with AI recommendations.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Monthly Reports</span>
                    <span className="font-bold">Unlimited</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">AI Insights</span>
                    <span className="font-bold">Weekly</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Price</span>
                    <span className="font-bold">300 ETB/month</span>
                  </div>
                </div>
                <button className="w-full bg-pink-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Service Onboarding CTA */}
            <div className="bg-gradient-to-br from-stone-900 to-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-2xl mb-2">Ready to Scale Your Business?</h3>
                    <p className="text-stone-300 text-sm">Get personalized service recommendations based on your store performance</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-white">85%</div>
                    <div className="text-stone-300 text-xs">Revenue increase with services</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-white">3.2x</div>
                    <div className="text-stone-300 text-xs">Faster customer acquisition</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-white">24/7</div>
                    <div className="text-stone-300 text-xs">Automated operations</div>
                  </div>
                </div>
                
                <button className="bg-white text-stone-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-stone-100 transition-colors shadow-xl">
                  Get Service Recommendations
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Store Sync Analytics</h2>
                <p className="text-stone-500 text-sm">Cross-platform performance and n8n automation insights</p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-2xl border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">All Systems Active</span>
              </div>
            </div>

            {/* Sync Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-emerald-600 text-xs font-black">+12%</div>
                </div>
                <div className="text-2xl font-black text-stone-900">2.4K</div>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Facebook Reach</div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-pink-50 p-2 rounded-xl">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-emerald-600 text-xs font-black">+8%</div>
                </div>
                <div className="text-2xl font-black text-stone-900">1.8K</div>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Instagram Views</div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-orange-50 p-2 rounded-xl">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-emerald-600 text-xs font-black">+25%</div>
                </div>
                <div className="text-2xl font-black text-stone-900">156</div>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Auto Syncs</div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-emerald-600 text-xs font-black">+18%</div>
                </div>
                <div className="text-2xl font-black text-stone-900">94%</div>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Success Rate</div>
              </div>
            </div>

            {/* Platform Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`bg-white p-8 rounded-[2.5rem] border transition-all ${integrations.facebookEnabled ? 'border-blue-200 shadow-lg shadow-blue-500/5' : 'border-stone-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                      <Facebook className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg">Facebook Marketplace</h3>
                      <p className="text-stone-500 text-sm">Auto-post to local groups</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIntegrations(prev => ({ ...prev, facebookEnabled: !prev.facebookEnabled }))}
                    className="p-1"
                  >
                    {integrations.facebookEnabled ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-stone-300" />}
                  </button>
                </div>
                
                {integrations.facebookEnabled && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-800 font-bold text-sm">This Week</span>
                        <span className="text-blue-600 text-xs font-black">+12% reach</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-lg font-black text-blue-900">24</div>
                          <div className="text-[9px] text-blue-600 uppercase font-bold">Posts</div>
                        </div>
                        <div>
                          <div className="text-lg font-black text-blue-900">2.4K</div>
                          <div className="text-[9px] text-blue-600 uppercase font-bold">Reach</div>
                        </div>
                        <div>
                          <div className="text-lg font-black text-blue-900">89</div>
                          <div className="text-[9px] text-blue-600 uppercase font-bold">Clicks</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-stone-500 leading-relaxed">
                      ✓ Auto-posting to 3 Addis Ababa groups<br/>
                      ✓ Optimal timing based on engagement data<br/>
                      ✓ Cultural product hashtags included
                    </div>
                  </div>
                )}
              </div>

              <div className={`bg-white p-8 rounded-[2.5rem] border transition-all ${integrations.instagramEnabled ? 'border-pink-200 shadow-lg shadow-pink-500/5' : 'border-stone-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl shadow-lg shadow-pink-600/20">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg">Instagram Business</h3>
                      <p className="text-stone-500 text-sm">Stories & feed posts</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIntegrations(prev => ({ ...prev, instagramEnabled: !prev.instagramEnabled }))}
                    className="p-1"
                  >
                    {integrations.instagramEnabled ? <ToggleRight className="w-10 h-10 text-pink-600" /> : <ToggleLeft className="w-10 h-10 text-stone-300" />}
                  </button>
                </div>
                
                {integrations.instagramEnabled ? (
                  <div className="space-y-4">
                    <div className="bg-pink-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-pink-800 font-bold text-sm">This Week</span>
                        <span className="text-pink-600 text-xs font-black">+8% views</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-lg font-black text-pink-900">18</div>
                          <div className="text-[9px] text-pink-600 uppercase font-bold">Stories</div>
                        </div>
                        <div>
                          <div className="text-lg font-black text-pink-900">1.8K</div>
                          <div className="text-[9px] text-pink-600 uppercase font-bold">Views</div>
                        </div>
                        <div>
                          <div className="text-lg font-black text-pink-900">156</div>
                          <div className="text-[9px] text-pink-600 uppercase font-bold">Likes</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-stone-500 leading-relaxed">
                      ✓ Daily story highlights for new products<br/>
                      ✓ Feed posts with cultural context<br/>
                      ✓ Shopping tags for direct purchases
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-stone-500 text-sm mb-4">Enable Instagram integration to reach younger Ethiopian customers</p>
                    <button 
                      onClick={() => setIntegrations(prev => ({ ...prev, instagramEnabled: true }))}
                      className="bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
                    >
                      Connect Instagram
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* n8n Workflow Analytics */}
            <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-lg">n8n Automation Analytics</h4>
                    <p className="text-stone-400 text-sm">Workflow performance and efficiency metrics</p>
                  </div>
                </div>
                <div className="bg-emerald-600 px-4 py-2 rounded-2xl">
                  <span className="text-white font-black text-xs uppercase tracking-widest">156 Workflows Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">98.5%</div>
                  <div className="text-stone-400 text-xs uppercase tracking-widest">Success Rate</div>
                  <div className="text-emerald-400 text-[9px] font-bold mt-1">+2.1% this week</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">1.2s</div>
                  <div className="text-stone-400 text-xs uppercase tracking-widest">Avg Response</div>
                  <div className="text-blue-400 text-[9px] font-bold mt-1">-0.3s faster</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">2,847</div>
                  <div className="text-stone-400 text-xs uppercase tracking-widest">Tasks Automated</div>
                  <div className="text-orange-400 text-[9px] font-bold mt-1">+18% this month</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">42h</div>
                  <div className="text-stone-400 text-xs uppercase tracking-widest">Time Saved</div>
                  <div className="text-purple-400 text-[9px] font-bold mt-1">This week</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Most Active Workflows</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                    <span className="text-sm font-bold">Product Sync → Social Media</span>
                    <span className="text-emerald-400 text-xs font-black">89 executions</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                    <span className="text-sm font-bold">Order Delivered → Customer Survey</span>
                    <span className="text-blue-400 text-xs font-black">67 executions</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                    <span className="text-sm font-bold">Low Stock → Reorder Alert</span>
                    <span className="text-orange-400 text-xs font-black">23 executions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="w-5 h-5 text-stone-600" />
                <h4 className="font-black uppercase tracking-widest text-sm text-stone-600">Webhook Configuration</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">n8n Webhook URL</label>
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={integrations.n8nWebhookUrl} 
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 outline-none" 
                    />
                    <button className="bg-stone-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-blue-800 text-xs font-medium leading-relaxed">
                    <strong>Status:</strong> Connected and receiving events. Last ping: 2 minutes ago. 
                    All product syncs, order updates, and delivery confirmations are being processed automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Earnings</h2>
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
               <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl"></div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100">
                     <Wallet className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Available Payout</span>
                  </div>
                  <div className="flex items-end justify-between">
                     <div>
                        <div className="text-5xl font-black tracking-tighter">12,450.00</div>
                        <div className="text-stone-400 text-xs font-black uppercase mt-2 tracking-widest">Ethiopian Birr (ETB)</div>
                     </div>
                     <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Withdraw Now</button>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Payout History</h4>
                  <div className="space-y-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex justify-between items-center text-sm border-b border-stone-50 pb-3">
                          <div className="font-bold">Telebirr Payout</div>
                          <div className="text-emerald-600 font-black">+2,500 ETB</div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-orange-600 text-white p-6 rounded-3xl shadow-lg shadow-orange-600/20">
                  <h4 className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-4">Fee Transparency</h4>
                  <p className="text-sm font-medium leading-relaxed">eMerkato charges a flat <span className="text-lg font-black">2%</span> commission on successful sales. No hidden listing fees!</p>
                  <button className="mt-4 text-[10px] font-black uppercase underline tracking-widest">Learn More</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
