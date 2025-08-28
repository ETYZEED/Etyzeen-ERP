const axios = require('axios');
const crypto = require('crypto');

class ShopeeAPI {
  constructor() {
    this.baseURL = 'https://partner.shopeemobile.com';
    this.apiVersion = '/api/v2';
    this.config = null;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async initialize(config) {
    this.config = config;
    
    try {
      // Get access token if not available
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      // Test connection
      await this.testConnection();
      
      return this;
    } catch (error) {
      console.error('Shopee API initialization failed:', error.message);
      throw error;
    }
  }

  // Generate Shopee signature
  generateSignature(path, parameters) {
    const baseString = `${this.config.partnerId}${path}${Date.now() / 1000}${this.config.accessToken || ''}`;
    return crypto.createHmac('sha256', this.config.apiSecret)
      .update(baseString)
      .digest('hex');
  }

  // Authenticate and get access token
  async authenticate() {
    try {
      const path = '/api/v2/auth/token/get';
      const timestamp = Math.floor(Date.now() / 1000);
      
      const signature = crypto.createHmac('sha256', this.config.apiSecret)
        .update(`${this.config.partnerId}${path}${timestamp}`)
        .digest('hex');

      const response = await axios.post(`${this.baseURL}${path}`, {
        partner_id: parseInt(this.config.partnerId),
        shop_id: parseInt(this.config.shopId),
        timestamp: timestamp,
        sign: signature
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        console.log('✅ Shopee authentication successful');
        return response.data;
      } else {
        throw new Error('Authentication failed: No access token received');
      }
    } catch (error) {
      console.error('Shopee authentication error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const shopInfo = await this.getShopInfo();
      console.log(`✅ Shopee connected to shop: ${shopInfo.shop_name}`);
      return shopInfo;
    } catch (error) {
      console.error('Shopee connection test failed:', error.message);
      throw error;
    }
  }

  // Get shop information
  async getShopInfo() {
    const path = '/api/v2/shop/get_shop_info';
    return await this.makeRequest('GET', path);
  }

  // Get orders
  async getOrders(status = 'UNPAID', pageSize = 100, cursor = '') {
    const path = '/api/v2/order/get_order_list';
    const params = {
      order_status: status,
      page_size: pageSize,
      cursor: cursor
    };
    
    return await this.makeRequest('GET', path, params);
  }

  // Get order details
  async getOrderDetails(orderSn) {
    const path = '/api/v2/order/get_order_detail';
    const params = {
      order_sn_list: orderSn
    };
    
    return await this.makeRequest('GET', path, params);
  }

  // Get products
  async getProducts(offset = 0, pageSize = 100, itemStatus = 'NORMAL') {
    const path = '/api/v2/product/get_item_list';
    const params = {
      offset: offset,
      page_size: pageSize,
      item_status: itemStatus
    };
    
    return await this.makeRequest('GET', path, params);
  }

  // Update product stock
  async updateStock(itemId, stock) {
    const path = '/api/v2/product/update_stock';
    const data = {
      item_id: itemId,
      stock: stock
    };
    
    return await this.makeRequest('POST', path, data);
  }

  // Update order status (ship order)
  async shipOrder(orderSn, trackingNumber) {
    const path = '/api/v2/order/ship_order';
    const data = {
      order_sn: orderSn,
      tracking_number: trackingNumber
    };
    
    return await this.makeRequest('POST', path, data);
  }

  // Generic request method
  async makeRequest(method, path, params = {}) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      let signature;
      
      if (this.accessToken) {
        signature = this.generateSignature(path, params);
      } else {
        signature = crypto.createHmac('sha256', this.config.apiSecret)
          .update(`${this.config.partnerId}${path}${timestamp}`)
          .digest('hex');
      }

      const config = {
        method: method,
        url: `${this.baseURL}${path}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : '',
        },
        params: {
          partner_id: this.config.partnerId,
          shop_id: this.config.shopId,
          timestamp: timestamp,
          sign: signature,
          ...params
        }
      };

      if (method === 'POST') {
        config.data = params;
      }

      const response = await axios(config);
      
      if (response.data.error) {
        throw new Error(`Shopee API Error: ${response.data.message}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Shopee API request failed:', error.response?.data || error.message);
      
      // Handle token expiration
      if (error.response?.data?.error === 'invalid_access_token') {
        console.log('🔄 Shopee access token expired, refreshing...');
        await this.authenticate();
        return await this.makeRequest(method, path, params);
      }
      
      throw error;
    }
  }

  // Webhook handler
  async handleWebhook(payload) {
    try {
      const { code, data, shop_id } = payload;
      
      switch (code) {
        case 101: // New order
          console.log('🛒 New Shopee order received');
          const order = await this.getOrderDetails(data.order_sn);
          return { event: 'new_order', data: order };
          
        case 102: // Order status update
          console.log('📦 Shopee order status updated');
          return { event: 'order_update', data };
          
        case 103: // Product update
          console.log('📊 Shopee product updated');
          return { event: 'product_update', data };
          
        default:
          console.log('ℹ️ Unknown Shopee webhook:', code);
          return { event: 'unknown', data };
      }
    } catch (error) {
      console.error('Shopee webhook handling error:', error);
      throw error;
    }
  }
}

module.exports = new ShopeeAPI();
