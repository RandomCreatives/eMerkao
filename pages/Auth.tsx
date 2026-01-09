import React, { useState } from 'react';
import { Language } from '../types';
import { useAuth } from '../components/AuthProvider';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin, Zap, Store } from 'lucide-react';

interface Props {
  onLogin: (userData: any) => void;
  onBack: () => void;
  lang: Language;
}

// Sample credentials for demo
const SAMPLE_ACCOUNTS = {
  buyer: {
    email: 'abebe@emerkato.et',
    password: 'demo123',
    profile: {
      id: 'buyer-demo-001',
      full_name: 'Abebe Kebede',
      user_type: 'buyer' as const,
      phone_number: '+251 911 234 567',
      region: 'Addis Ababa',
      city: 'Bole',
      subcity: 'Bole Sub City',
      is_verified: true,
      trust_score: 92,
      email: 'abebe@emerkato.et',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  seller: {
    email: 'kebebush@emerkato.et',
    password: 'demo123',
    profile: {
      id: 'seller-demo-001',
      full_name: 'Kebebush Tadesse',
      user_type: 'seller' as const,
      phone_number: '+251 922 345 678',
      region: 'Addis Ababa',
      city: 'Merkato',
      subcity: 'Addis Ketema',
      is_verified: true,
      trust_score: 98,
      email: 'kebebush@emerkato.et',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sellers: {
        id: 'seller-demo-001',
        store_name: "Kebebush's Traditional Boutique",
        store_description: 'Authentic Ethiopian cultural items and traditional clothing. Serving the community for over 15 years.',
        store_logo_url: null,
        is_trusted_seller: true,
        total_sales: 125000,
        total_orders: 342,
        average_rating: 4.9,
        total_reviews: 156,
        available_balance: 8750,
        pending_balance: 2340,
        telegram_bot_enabled: true,
        facebook_enabled: true,
        instagram_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }
};

const Auth: React.FC<Props> = ({ onLogin, onBack, lang }) => {
  const { signIn, signUp, loading, setDemoUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    region: 'Addis Ababa',
    user_type: 'buyer' as 'buyer' | 'seller'
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        if (data.user) {
          onLogin(data.user);
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          user_type: formData.user_type,
          phone_number: formData.phone_number,
          region: formData.region
        });
        if (error) throw error;
        if (data.user) {
          onLogin(data.user);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleQuickLogin = (accountType: 'buyer' | 'seller') => {
    const account = SAMPLE_ACCOUNTS[accountType];
    
    // Simulate successful login with mock user data
    const mockUser = {
      id: account.profile.id,
      email: account.email,
      user_metadata: account.profile,
      app_metadata: {},
      aud: 'authenticated',
      created_at: account.profile.created_at,
      updated_at: account.profile.updated_at
    };

    // Use the AuthProvider method to set demo user state
    setDemoUser(mockUser, account.profile);
    
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              {isLogin ? 'Welcome Back' : 'Join eMerkato'}
            </h1>
            <p className="text-stone-500 text-sm">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>
        </div>

        {/* Quick Login Demo Buttons */}
        <div className="mb-8 space-y-4">
          <div className="text-center">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">
              🚀 Quick Demo Login
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleQuickLogin('buyer')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all group"
            >
              <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-blue-900 text-sm">Login as Buyer</div>
                <div className="text-blue-700 text-xs">Abebe Kebede • Addis Ababa</div>
              </div>
              <Zap className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => handleQuickLogin('seller')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl hover:from-orange-100 hover:to-red-100 transition-all group"
            >
              <div className="bg-orange-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-orange-900 text-sm">Login as Seller</div>
                <div className="text-orange-700 text-xs">Kebebush's Traditional Boutique</div>
              </div>
              <Zap className="w-4 h-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-stone-200"></div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, user_type: 'buyer' }))}
                    className={`p-4 rounded-2xl font-bold text-sm transition-all ${
                      formData.user_type === 'buyer' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, user_type: 'seller' }))}
                    className={`p-4 rounded-2xl font-bold text-sm transition-all ${
                      formData.user_type === 'seller' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Seller
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                  Region
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-medium appearance-none"
                  >
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Oromia">Oromia</option>
                    <option value="Amhara">Amhara</option>
                    <option value="Tigray">Tigray</option>
                    <option value="Sidama">Sidama</option>
                    <option value="SNNPR">SNNPR</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-600/20"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-stone-600 hover:text-orange-600 transition-colors text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-2">
            Demo Credentials
          </p>
          <div className="text-xs text-stone-600 space-y-1">
            <div><strong>Buyer:</strong> abebe@emerkato.et / demo123</div>
            <div><strong>Seller:</strong> kebebush@emerkato.et / demo123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;