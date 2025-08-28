const axios = require('axios');
const crypto = require('crypto');

class TokopediaAPI {
  constructor() {
    this.baseURL = 'https://fs.tokopedia.net';
    this.authURL = 'https://accounts.tokopedia.com';
    this.config = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpires = null;
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
      console.error('Tokopedia API initialization failed:', error.message);
      throw error;
    }
  }

  // Authenticate and get access token
  async authenticate() {
    try {
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.authURL}/token?grant_type=client_credentials`, {}, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        this.tokenExpires = Date.now() + (response.data.expires_in * 1000);
        console.log('✅ Tokopedia authentication successful');
        return response.data;
      } else {
        throw new Error('Authentication failed: No access token received');
      }
    } catch (error) {
      console.error('Tokopedia authentication error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Check if token needs refresh
  needsRefresh() {
    return !this.accessToken || Date.now() >= this.tokenExpires - 300000; // Refresh 5 minutes before expiry
  }

  // Test connection
  async testConnection() {
    try {
      const shopInfo = await this.getShopInfo();
      console.log(`✅ Tokopedia connected to shop: ${shopInfo.shop_name}`);
      return shopInfo;
    } catch (error) {
      console.error('Tokopedia connection test failed:', error.message);
      throw error;
    }
  }

  // Generic request method with auth handling
  async makeRequest(method, endpoint, data = null, params = {}) {
    try {
      if (this.needsRefresh()) {
        await this.authenticate();
      }

      const config = {
        method: method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? data : undefined
      };

      const response = await axios(config);
      
      if (response.data && response.data.header && response.data.header.error_code !== 0) {
        throw new Error(`Tokopedia API Error: ${response.data.header.reason}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Tokopedia API request failed:', error.response?.data || error.message);
      
      // Handle token expiration
      if (error.response?.status === 401) {
        console.log('🔄 Tokopedia access token expired, refreshing...');
        await this.authenticate();
        return await this.makeRequest(method, endpoint, data, params);
      }
      
      throw error;
    }
  }

  // Get shop information
  async getShopInfo() {
    const endpoint = '/v1/shop/fs/12345/shop-info'; // FS ID will be replaced dynamically
    return await this.makeRequest('GET', endpoint.replace('12345', this.config.fsId));
  }

  // Get orders
  async getOrders(page = 1, perPage = 100, fromDate = null, toDate = null) {
    const endpoint = `/v2/order/list`;
    const params = {
      fs_id: this.config.fsId,
      page: page,
      per_page: perPage,
      from_date: fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to_date: toDate || new Date().toISOString().split('T')[0]
    };
    
    return await this.makeRequest('GET', endpoint, null, params);
  }

  // Get order details
  async getOrderDetails(orderId) {
    const endpoint = `/v2/order/${orderId}`;
    const params = {
      fs_id: this.config.fsId
    };
    
    return await this.makeRequest('GET', endpoint, null, params);
  }

  // Get products
  async getProducts(page = 1, perPage = 100, shopId = null) {
    const endpoint = '/inventory/v1/fs/12345/stock-inventory';
    const params = {
      page: page,
      per_page: perPage,
      shop_id: shopId || this.config.fsId
    };
    
    return await this.makeRequest('GET', endpoint.replace('12345', this.config.fsId), null, params);
  }

  // Update product stock
  async updateStock(productId, stock) {
    const endpoint = '/inventory/v1/fs/12345/stock/update';
    const data = {
      product_id: productId,
      stock: stock,
      shop_id: this.config.fsId
    };
    
    return await this.makeRequest('POST', endpoint.replace('12345', this.config.fsId), data);
  }

  // Update order status (accept order)
  async acceptOrder(orderId) {
    const endpoint = '/v1/order/12345/ack';
    const data = {
      order_id: orderId
    };
    
    return await this.makeRequest('POST', endpoint.replace('12345', this.config.fsId), data);
  }

  // Update order status (ship order)
  async shipOrder(orderId, trackingNumber, logisticsId) {
    const endpoint = '/v1/order/12345/fs/45678/ship';
    const data = {
      order_id: orderId,
      tracking_number: trackingNumber,
      logistics_id: logisticsId
    };
    
    return await this.makeRequest('POST', endpoint.replace('12345', this.config.fsId).replace('45678', this.config.fsId), data);
  }

  // Get categories
  async getCategories() {
    const endpoint = '/inventory/v1/fs/12345/category';
    return await this.makeRequest('GET', endpoint.replace('12345', this.config.fsId));
  }

  // Webhook handler
  async handleWebhook(payload) {
    try {
      const { event, data } = payload;
      
      switch (event) {
        case 'order_notification':
          console.log('🛒 New Tokopedia order received');
          const order = await this.getOrderDetails(data.order_id);
          return { event: 'new_order', data: order };
          
        case 'order_status':
          console.log('📦 Tokopedia order status updated');
          return { event: 'order_update', data };
          
        case 'product_notification':
          console.log('📊 Tokopedia product updated');
          return { event: 'product_update', data };
          
        default:
          console.log('ℹ️ Unknown Tokopedia webhook:', event);
          return { event: 'unknown', data };
      }
    } catch (error) {
      console.error('Tokopedia webhook handling error:', error);
      throw error;
    }
  }

  // Get logistics providers
  async getLogistics() {
    const endpoint = '/v1/logistics/fs/12345/info';
    return await this.makeRequest('GET', endpoint.replace('12345', this.config.fsId));
  }
}

module.exports = new TokopediaAPI();
