# eMerkato Local Setup Guide

## ✅ Current Status
Your eMerkato application is now running locally at **http://localhost:3000**

## 🚀 What's Working
- ✅ Next.js application with TypeScript
- ✅ Tailwind CSS styling
- ✅ Basic authentication UI
- ✅ Product catalog and shopping cart
- ✅ Seller and buyer dashboards
- ✅ Multi-language support (UI ready)
- ✅ Telegram bot integration (API endpoints ready)
- ✅ Database schema (ready for Supabase)

## 🔧 Next Steps to Complete Setup

### 1. Set Up Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run these migration files in order:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_rls_policies.sql
   supabase/migrations/003_seed_data.sql
   supabase/migrations/004_auth_triggers.sql
   ```

### 2. Configure Environment Variables
Update `.env.local` with your actual values:
```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key

# Optional: For Telegram bot
TELEGRAM_BOT_TOKEN=your_bot_token
```

### 3. Test the Application
1. Visit http://localhost:3000
2. Try creating an account (will work once Supabase is configured)
3. Browse products and test the shopping cart
4. Switch between buyer and seller modes

## 🎯 Key Features Available

### For Buyers:
- Browse Ethiopian cultural products
- Multi-language interface
- Shopping cart functionality
- Order tracking (once database is connected)

### For Sellers:
- Product management dashboard
- AI-powered product descriptions
- Telegram bot integration for product sync
- Analytics and insights
- Cross-platform posting setup

### Admin Features:
- Complete database schema with RLS
- User management and verification
- Product moderation
- Analytics tracking

## 🤖 Telegram Bot Setup (Optional)
1. Create a bot with [@BotFather](https://t.me/botfather)
2. Add your bot token to `.env.local`
3. Set webhook URL to: `https://yourdomain.com/api/telegram/webhook`
4. Users can link accounts via `/link` command

## 🔍 Testing Without Database
The app will run in demo mode with mock data until you connect Supabase:
- Authentication will show UI but won't persist
- Products display from constants file
- Cart works with local state
- Seller dashboard shows mock analytics

## 📱 Mobile Experience
- Responsive design works on all devices
- Bottom navigation on mobile
- Touch-optimized interactions
- Ethiopian cultural design elements

## 🌍 Multi-Language Support
Currently configured for:
- English (default)
- Amharic (አማርኛ)
- Oromo (Afaan Oromoo)
- Tigrinya (ትግርኛ)

## 🚨 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### Missing Dependencies
```bash
npm install
```

### TypeScript Errors
```bash
npm run type-check
```

## 📞 Need Help?
- Check the console for any errors
- Ensure all environment variables are set
- Verify Supabase migrations ran successfully
- Test API endpoints at `/api/telegram/webhook`

---

**🎉 Your Ethiopian digital marketplace is ready for development!**