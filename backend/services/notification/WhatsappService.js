require('dotenv').config();
const axios = require('axios');

class WhatsappService {
  constructor() {
    this.token = process.env.WHATSAPP_TOKEN;
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.baseUrl = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(to, body) {
    if (!this.token || !this.phoneNumberId) {
      console.error('WhatsApp credentials missing');
      return { success: false, message: 'Credentials missing' };
    }

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

      return { success: true, data: response.data };
    } catch (error) {
      const errData = error.response?.data?.error;
      console.error('WhatsApp Send Error:', errData || error.message);

      // Handle Sandbox "not in allowed list" error (#131030) gracefully in development
      if (errData?.code === 131030 && process.env.NODE_ENV === 'development') {
        console.warn(`[SANDBOX] Simulating success for ${formattedPhone} (Recipient not in allowed list)`);
        return { 
          success: true, 
          simulated: true, 
          message: `[SANDBOX] Recipient ${formattedPhone} is not in your allow-list. Simulated success for testing.`
        };
      }

      return { 
        success: false, 
        error: errData?.message || error.message 
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
      console.error('WhatsApp Template Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }
}

module.exports = new WhatsappService();
