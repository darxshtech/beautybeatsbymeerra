require('dotenv').config();
const axios = require('axios');

/**
 * WhatsappService
 * Handles communication with the Meta WhatsApp Graph API.
 * 
 * IMPORTANT FOR PRODUCTION:
 * 1. For numbers that haven't messaged you in 24 hours, you MUST use a Template message.
 * 2. If using a Test Number, you can ONLY send to verified numbers in your developer portal.
 */
class WhatsappService {
  constructor() {
    this.token = process.env.WHATSAPP_TOKEN;
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.baseUrl = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(to, body) {
    if (!this.token || !this.phoneNumberId) {
      console.error('[WHATSAPP] Error: Credentials missing in .env');
      return { success: false, message: 'WhatsApp credentials missing on server.' };
    }

    let formattedPhone = to ? String(to).replace(/[^0-9]/g, '') : '';
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    console.log(`[WHATSAPP] Attempting to send message to ${formattedPhone}...`);

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: body }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[WHATSAPP] ✅ Success: Message sent to ${formattedPhone}`);
      return { success: true, data: response.data };
    } catch (error) {
      const errData = error.response?.data?.error;
      const errorCode = errData?.code;
      const errorMsg = errData?.message || error.message;

      console.error(`[WHATSAPP] ❌ Failed to send to ${formattedPhone}:`, errorMsg);

      // Detailed Troubleshooting for the USER
      if (errorCode === 131030) {
        console.error('   -> CAUSE: Recipient number is not in your allowed list (Sandbox limitation).');
      } else if (errorCode === 131047) {
        console.error('   -> CAUSE: 24-hour window closed. You MUST use a Template message for this number.');
      } else if (errorCode === 190) {
        console.error('   -> CAUSE: Invalid or Expired WhatsApp Token.');
      }

      // Handle Sandbox gracefully in development
      if (errorCode === 131030 && process.env.NODE_ENV === 'development') {
        return { 
          success: true, 
          simulated: true, 
          message: `[SANDBOX] Recipient ${formattedPhone} is not verified. (Simulated success)`
        };
      }

      return { 
        success: false, 
        error: errorMsg,
        code: errorCode,
        instructions: errorCode === 131030 ? 'Verify this number in your Meta Developer Portal' : 'Use a Template message if 24h window is closed'
      };
    }
  }

  async sendTemplateMessage(to, templateName, components = []) {
    let formattedPhone = to ? String(to).replace(/[^0-9]/g, '') : '';
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en_US' },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('[WHATSAPP] Template Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }
}

module.exports = new WhatsappService();
