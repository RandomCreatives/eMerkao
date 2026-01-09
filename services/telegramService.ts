import { db, supabaseAdmin } from '../lib/supabase'
import { parseTelegramProduct } from './geminiService'

interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  photo?: Array<{
    file_id: string
    file_unique_id: string
    width: number
    height: number
    file_size?: number
  }>
  document?: {
    file_name?: string
    mime_type?: string
    file_id: string
    file_unique_id: string
    file_size?: number
  }
  forward_from?: TelegramUser
  forward_from_chat?: TelegramChat
  forward_date?: number
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  channel_post?: TelegramMessage
  edited_channel_post?: TelegramMessage
}

class TelegramService {
  private botToken: string
  private webhookUrl: string
  private apiUrl: string

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN!
    this.webhookUrl = process.env.TELEGRAM_WEBHOOK_URL!
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`
  }

  // Initialize webhook
  async setWebhook() {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: this.webhookUrl,
          allowed_updates: ['message', 'edited_message', 'channel_post'],
          drop_pending_updates: true
        })
      })
      
      const result = await response.json()
      console.log('Webhook set:', result)
      return result
    } catch (error) {
      console.error('Error setting webhook:', error)
      throw error
    }
  }

  // Send message to Telegram
  async sendMessage(chatId: number, text: string, options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    reply_markup?: any
    disable_web_page_preview?: boolean
  }) {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...options
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Get file URL from Telegram
  async getFileUrl(fileId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/getFile?file_id=${fileId}`)
      const result = await response.json()
      
      if (result.ok) {
        return `https://api.telegram.org/file/bot${this.botToken}/${result.result.file_path}`
      }
      throw new Error('Failed to get file URL')
    } catch (error) {
      console.error('Error getting file URL:', error)
      throw error
    }
  }

  // Process incoming webhook update
  async processUpdate(update: TelegramUpdate) {
    try {
      const message = update.message || update.edited_message || update.channel_post

      if (!message || !message.from) {
        console.log('No message or sender found in update')
        return
      }

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(
        message.chat.id,
        message.from.id,
        message.from
      )

      // Process media URLs if present
      const mediaUrls: string[] = []
      if (message.photo && message.photo.length > 0) {
        // Get the largest photo
        const largestPhoto = message.photo[message.photo.length - 1]
        const photoUrl = await this.getFileUrl(largestPhoto.file_id)
        mediaUrls.push(photoUrl)
      }

      if (message.document) {
        const docUrl = await this.getFileUrl(message.document.file_id)
        mediaUrls.push(docUrl)
      }

      // Save message to database
      const savedMessage = await db.saveTelegramMessage(conversation.id, {
        telegram_message_id: message.message_id,
        telegram_chat_id: message.chat.id,
        message_type: 'user',
        content: message.text || '',
        media_urls: mediaUrls
      })

      // Process message for product extraction
      if (message.text && this.isProductMessage(message.text)) {
        await this.processProductMessage(savedMessage.id, message.text, conversation)
      }

      // Send appropriate response
      await this.sendResponse(message.chat.id, message.text || '', conversation)

    } catch (error) {
      console.error('Error processing update:', error)
    }
  }

  // Get or create conversation record
  private async getOrCreateConversation(chatId: number, userId: number, user: TelegramUser) {
    try {
      let conversation = await db.getTelegramConversation(chatId, userId)
      
      if (!conversation) {
        // Try to find existing user by telegram_user_id
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('telegram_user_id', userId)
          .single()

        // Create conversation
        const { data: newConversation, error } = await supabaseAdmin
          .from('telegram_conversations')
          .insert({
            telegram_chat_id: chatId,
            telegram_user_id: userId,
            user_id: existingProfile?.id || null,
            current_state: 'idle',
            language_preference: user.language_code || 'en'
          })
          .select()
          .single()

        if (error) throw error
        conversation = newConversation
      }

      return conversation
    } catch (error) {
      console.error('Error managing conversation:', error)
      throw error
    }
  }

  // Check if message contains product information
  private isProductMessage(text: string): boolean {
    const productKeywords = [
      'selling', 'price', 'etb', 'birr', 'for sale', 'available',
      'በሽያጭ', 'ዋጋ', 'ብር', // Amharic
      'gurgurtaa', 'gatii', // Oromo
      'category', 'ምድብ', 'ramadan', 'habesha', 'berbere', 'coffee'
    ]
    
    const lowerText = text.toLowerCase()
    return productKeywords.some(keyword => lowerText.includes(keyword)) && 
           (lowerText.includes('etb') || lowerText.includes('birr') || lowerText.includes('ብር'))
  }

  // Process product message with AI
  private async processProductMessage(messageId: string, text: string, conversation: any) {
    try {
      // Extract product data using Gemini AI
      const productData = await parseTelegramProduct(text)
      
      if (productData && productData.name && productData.price) {
        // Update message with extracted data
        await supabaseAdmin
          .from('telegram_messages')
          .update({
            extracted_product_data: productData,
            is_processed: true,
            processing_result: { status: 'success', extracted_at: new Date().toISOString() }
          })
          .eq('id', messageId)

        // If user is linked and is a seller, create product
        if (conversation.user_id) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('user_type, sellers(*)')
            .eq('id', conversation.user_id)
            .single()

          if (profile?.user_type === 'seller') {
            await this.createProductFromTelegram(conversation.user_id, productData, {
              telegram_message_id: parseInt(messageId),
              telegram_chat_id: conversation.telegram_chat_id
            })
          }
        }
      } else {
        // Mark as processed but failed
        await supabaseAdmin
          .from('telegram_messages')
          .update({
            is_processed: true,
            processing_result: { 
              status: 'failed', 
              error: 'Could not extract product data',
              processed_at: new Date().toISOString()
            }
          })
          .eq('id', messageId)
      }
    } catch (error) {
      console.error('Error processing product message:', error)
      
      // Mark as processed with error
      await supabaseAdmin
        .from('telegram_messages')
        .update({
          is_processed: true,
          processing_result: { 
            status: 'error', 
            error: error.message,
            processed_at: new Date().toISOString()
          }
        })
        .eq('id', messageId)
    }
  }

  // Create product from Telegram data
  private async createProductFromTelegram(sellerId: string, productData: any, telegramMeta: any) {
    try {
      // Get category ID
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('id, is_cultural')
        .ilike('name', `%${productData.category}%`)
        .single()

      if (!category) {
        throw new Error(`Category not found: ${productData.category}`)
      }

      // Create product
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .insert({
          seller_id: sellerId,
          category_id: category.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          currency: 'ETB',
          is_cultural: category.is_cultural,
          status: 'active',
          synced_from_telegram: true,
          telegram_message_id: telegramMeta.telegram_message_id,
          telegram_chat_id: telegramMeta.telegram_chat_id,
          images: ['https://picsum.photos/seed/' + encodeURIComponent(productData.name) + '/600/600']
        })
        .select()
        .single()

      if (error) throw error

      // Update telegram message with created product ID
      await supabaseAdmin
        .from('telegram_messages')
        .update({ created_product_id: product.id })
        .eq('telegram_message_id', telegramMeta.telegram_message_id)
        .eq('telegram_chat_id', telegramMeta.telegram_chat_id)

      return product
    } catch (error) {
      console.error('Error creating product from Telegram:', error)
      throw error
    }
  }

  // Send response based on message content
  private async sendResponse(chatId: number, text: string, conversation: any) {
    try {
      if (text?.toLowerCase().includes('/start')) {
        await this.sendWelcomeMessage(chatId)
      } else if (text?.toLowerCase().includes('/help')) {
        await this.sendHelpMessage(chatId)
      } else if (text?.toLowerCase().includes('/link')) {
        await this.sendLinkInstructions(chatId)
      } else if (this.isProductMessage(text || '')) {
        await this.sendProductProcessingMessage(chatId)
      } else {
        // Default response
        await this.sendMessage(chatId, 
          "👋 I'm the eMerkato bot! I can help you sync products to your store. " +
          "Just send me product details with name, price, and category.\n\n" +
          "Commands:\n/help - Show help\n/link - Link your account"
        )
      }
    } catch (error) {
      console.error('Error sending response:', error)
    }
  }

  private async sendWelcomeMessage(chatId: number) {
    const message = `
🇪🇹 *Welcome to eMerkato Bot!*

I help Ethiopian sellers sync products from Telegram groups to their eMerkato store.

*What I can do:*
• 📦 Auto-sync product posts to your store
• 💰 Extract prices and details using AI
• 🏪 Manage your inventory remotely
• 📊 Track sales and analytics

*Getting Started:*
1. Create an account on eMerkato
2. Use /link to connect your Telegram
3. Start posting products in your groups!

*Commands:*
/help - Show this help
/link - Link your eMerkato account
/status - Check sync status
/products - View your products

Ready to digitize your business? 🚀
    `
    
    await this.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  }

  private async sendHelpMessage(chatId: number) {
    const message = `
📚 *eMerkato Bot Help*

*Product Sync Format:*
"Selling [Product Name], [Category], [Price] ETB"

*Example:*
"Selling Habesha Kemis, Habesha Clothes, 4500 ETB"

*Supported Categories:*
• Habesha Clothes
• Ceremonial Wear  
• Spices (Berbere)
• Coffee Sets (Jebena)
• Religious Goods
• Electronics
• General

*Tips:*
✅ Include price in ETB
✅ Mention category clearly
✅ Add product description
❌ Don't use abbreviations

Need more help? Visit emerkato.et
    `
    
    await this.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  }

  private async sendLinkInstructions(chatId: number) {
    const linkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/telegram-link?chat_id=${chatId}`
    
    const message = `
🔗 *Link Your eMerkato Account*

To sync products automatically:

1. Click the link below
2. Login to your eMerkato seller account
3. Authorize the connection

[🔗 Link Account](${linkUrl})

After linking, I'll automatically sync your product posts to your eMerkato store!
    `
    
    await this.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔗 Link Account', url: linkUrl }
        ]]
      }
    })
  }

  private async sendProductProcessingMessage(chatId: number) {
    await this.sendMessage(chatId, 
      "🤖 Processing your product post with AI...\n" +
      "I'll extract the details and sync to your eMerkato store!"
    )
  }

  // Cloud storage integration - save messages to Telegram's cloud
  async saveToTelegramCloud(chatId: number, content: string, options?: {
    title?: string
    tags?: string[]
  }) {
    try {
      // Use Telegram's "Saved Messages" feature by forwarding to the user
      const message = `📝 *${options?.title || 'eMerkato Sync'}*\n\n${content}`
      
      if (options?.tags) {
        message + `\n\n🏷️ Tags: ${options.tags.join(', ')}`
      }
      
      await this.sendMessage(chatId, message, { parse_mode: 'Markdown' })
      
      return true
    } catch (error) {
      console.error('Error saving to Telegram cloud:', error)
      return false
    }
  }

  // Retrieve conversation history from database (acts as cloud storage)
  async getConversationHistory(chatId: number, userId: number, limit: number = 50) {
    try {
      const conversation = await db.getTelegramConversation(chatId, userId)
      if (!conversation) return []

      const messages = await db.getTelegramMessages(conversation.id, limit)
      return messages
    } catch (error) {
      console.error('Error getting conversation history:', error)
      return []
    }
  }

  // Sync conversation to user's "Saved Messages"
  async syncConversationToCloud(chatId: number, userId: number) {
    try {
      const history = await this.getConversationHistory(chatId, userId, 20)
      
      if (history.length === 0) return

      let summary = "📋 *eMerkato Conversation Summary*\n\n"
      
      history.reverse().forEach((msg, index) => {
        const date = new Date(msg.created_at).toLocaleDateString()
        summary += `${index + 1}. ${date}: ${msg.content?.substring(0, 100)}...\n`
      })

      await this.saveToTelegramCloud(chatId, summary, {
        title: 'Conversation Backup',
        tags: ['emerkato', 'backup', 'conversation']
      })

      return true
    } catch (error) {
      console.error('Error syncing to cloud:', error)
      return false
    }
  }
}

export const telegramService = new TelegramService()

// Webhook handler for Next.js API route
export async function handleTelegramWebhook(update: TelegramUpdate) {
  return await telegramService.processUpdate(update)
}

// Initialize webhook (call this once during deployment)
export async function initializeTelegramBot() {
  return await telegramService.setWebhook()
}