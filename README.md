# eMerkato - Ethiopian Digital Marketplace

A comprehensive digital marketplace platform designed specifically for Ethiopian commerce, featuring AI-powered product management, Telegram bot integration, and cultural product categorization.

## 🚀 Features

### Core Marketplace
- **Multi-language Support**: English, Amharic, Oromo, Tigrinya
- **Cultural Categories**: Specialized for Ethiopian products (Habesha clothes, Berbere spices, Jebena coffee sets, etc.)
- **Trust System**: Verified sellers with trust scores and badges
- **Regional Delivery**: Optimized for Ethiopian locations with express delivery in Addis Ababa

### AI-Powered Features
- **Smart Product Suggestions** using Google Gemini AI
- **Automated Product Description Generation**
- **AI Business Consultant** for sellers with market insights
- **Telegram Message Parsing** for automatic product extraction

### Telegram Integration
- **Bot Assistant** for sellers to sync products from Telegram groups
- **Cloud Storage Integration** using Telegram's saved messages
- **Real-time Product Sync** from group posts
- **Multi-platform Cross-posting** (Facebook, Instagram via n8n)

### Seller Tools
- **Comprehensive Dashboard** with analytics and insights
- **Inventory Management** with stock tracking
- **Order Management** with status tracking
- **Integration Hub** for social media cross-posting
- **Trust Score System** with delivery rate tracking

## 🛠 Tech Stack

- **Frontend**: React 19.2.3, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Google Gemini AI
- **Bot**: Telegram Bot API
- **Charts**: Recharts
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Supabase account
- Google Gemini AI API key
- Telegram Bot Token (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/emerkato.git
cd emerkato
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in order:
   ```bash
   # In your Supabase SQL editor, run these files in order:
   # 1. supabase/migrations/001_initial_schema.sql
   # 2. supabase/migrations/002_rls_policies.sql  
   # 3. supabase/migrations/003_seed_data.sql
   # 4. supabase/migrations/004_auth_triggers.sql
   ```

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🤖 Telegram Bot Setup (Optional)

### 1. Create a Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command and follow instructions
3. Save the bot token

### 2. Set Up Webhook
```bash
# After deploying your app, initialize the webhook:
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
```

### 3. Link Telegram Account
1. Start a conversation with your bot
2. Use `/link` command
3. Follow the authentication flow

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **User Management**: Profiles, sellers, authentication
- **Product Catalog**: Products, categories, reviews, analytics
- **Order System**: Orders, order items, payment tracking
- **Telegram Integration**: Conversations, messages, sync history
- **Analytics**: Product views, sales metrics, seller performance

Key features:
- Row Level Security (RLS) for data protection
- Automatic triggers for metrics updates
- Full-text search capabilities
- Materialized views for performance
- Multi-language category support

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Telegram Integration
- `POST /api/telegram/webhook` - Telegram webhook handler
- `POST /api/telegram/link` - Link Telegram account

### Products
- `GET /api/products` - List products with filters
- `POST /api/products` - Create product (sellers only)
- `GET /api/products/[id]` - Get product details

## 🌍 Localization

The app supports multiple Ethiopian languages:
- **English** (en) - Default
- **Amharic** (am) - አማርኛ
- **Oromo** (om) - Afaan Oromoo  
- **Tigrinya** (ti) - ትግርኛ

Categories and UI elements are translated, with cultural context preserved.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

### Environment Setup for Production
- Set up Supabase production database
- Configure Telegram webhook URL
- Set up domain for the application
- Configure n8n webhooks (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ethiopian developer community
- Supabase for the excellent backend platform
- Google for Gemini AI capabilities
- Telegram for bot API
- The open-source community

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@emerkato.et
- Telegram: [@eMerkatoSupport](https://t.me/eMerkatoSupport)

---

**Built with ❤️ for Ethiopian entrepreneurs and the digital transformation of traditional commerce.**