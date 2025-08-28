const axios = require('axios');
const crypto = require('crypto');

class TikTokShopAPI {
  constructor() {
    this.baseURL = 'https://open-api.tiktokglobalshop.com';
    this.authURL = 'https://auth.tiktok-shops.com';
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
      console.error('TikTok Shop API initialization failed:', error.message);
      throw error;
    }
  }

  // Generate TikTok Shop signature
  generateSignature(path, timestamp, accessToken = '') {
    const baseString = `${this.config.appKey}${path}${timestamp}${accessToken}${this.config.appSecret}`;
    return crypto.createHash('sha256').update(baseString).digest('hex');
  }

  // Authenticate and get access token
  async authenticate() {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/api/token/get';
      
      const signature = this.generateSignature(path, timestamp);

      const response = await axios.post(`${this.authURL}${path}`, {
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
        grant_type: 'authorization_code',
        auth_code: this.config.authCode || 'default_auth_code', // Need auth code from OAuth flow
        timestamp: timestamp,
        sign: signature
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data && response.data.data.access_token) {
        this.accessToken = response.data.data.access_token;
        this.refreshToken = response.data.data.refresh_token;
        this.tokenExpires = Date.now() + (response.data.data.expire_in * 1000);
        console.log('✅ TikTok Shop authentication successful');
        return response.data.data;
      } else {
        throw new Error('Authentication failed: No access token received');
      }
    } catch (error) {
      console.error('TikTok Shop authentication error:', error.response?.data || error.message);
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
      console.log(`✅ TikTok Shop connected to shop: ${shopInfo.shop_name}`);
      return shopInfo;
    } catch (error) {
      console.error('TikTok Shop connection test failed:', error.message);
      throw error;
    }
  }

  // Generic request method with auth handling
  async makeRequest(method, endpoint, data = null, params = {}) {
    try {
      if (this.needsRefresh()) {
        await this.authenticate();
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = this.generateSignature(endpoint, timestamp, this.accessToken);

      const config = {
        method: method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'x-tts-access-token': this.accessToken,
          'x-tts-timestamp': timestamp.toString(),
          'x-tts-sign': signature,
          'x-tts-shop-id': this.config.shopId
        },
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? data : undefined
      };

      const response = await axios(config);
      
      if (response.data && response.data.code !== 0) {
        throw new Error(`TikTok Shop API Error: ${response.data.message}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('TikTok Shop API request failed:', error.response?.data || error.message);
      
      // Handle token expiration
      if (error.response?.status === 401 || error.response?.data?.code === 1000004) {
        console.log('🔄 TikTok Shop access token expired, refreshing...');
        await this.authenticate();
        return await this.makeRequest(method, endpoint, data, params);
      }
      
      throw error;
    }
  }

  // Get shop information
  async getShopInfo() {
    const endpoint = '/api/shop/get_shop_info';
    return await this.makeRequest('GET', endpoint);
  }

  // Get orders
  async getOrders(pageSize = 20, cursor = '', orderStatus = 0) {
    const endpoint = '/api/orders/search';
    const data = {
      page_size: pageSize,
      cursor: cursor,
      order_status: orderStatus
    };
    
    return await this.makeRequest('POST', endpoint, data);
  }

  // Get order details
  async getOrderDetails(orderId) {
    const endpoint = '/api/orders/detail/query';
    const data = {
      order_id_list: [orderId]
    };
    
    return await this.makeRequest('POST', endpoint, data);
  }

  // Get products
  async getProducts(pageSize = 20, cursor = '', status = 1) {
    const endpoint = '/api/products/search';
    const data = {
      page_size: pageSize,
      cursor: cursor,
      product_status: status
    };
    
    return await this.makeRequest('POST', endpoint, data);
  }

  // Update product stock
  async updateStock(productId, skuId, stock) {
    const endpoint = '/api/products/stocks';
    const data = {
      product_id: productId,
      sku_id: skuId,
      stock_infos: [{
        available_stock: stock
      }]
    };
    
    return await this.makeRequest('POST', endpoint, data);
  }

  // Update order status (ship order)
  async shipOrder(orderId, trackingNumber, providerId) {
    const endpoint = '/api/orders/rts';
    const data = {
      order_id: orderId,
      tracking_number: trackingNumber,
      shipping_provider_id: providerId
    };
    
    return await this.makeRequest('POST', endpoint, data);
  }

  // Get shipping providers
  async getShippingProviders() {
    const endpoint = '/api/logistics/shipping_providers';
    return await this.makeRequest('GET', endpoint);
  }

  // Get categories
  async getCategories() {
    const endpoint = '/api/products/categories';
    return await this.makeRequest('GET', endpoint);
  }

  // Webhook handler
  async handleWebhook(payload) {
    try {
      const { type, data } = payload;
      
      switch (type) {
        case 'ORDER_STATUS_CHANGED':
          console.log('🛒 TikTok Shop order status changed');
          const order = await this.getOrderDetails(data.order_id);
          return { event: 'order_update', data: order };
          
        case 'PRODUCT_STATUS_CHANGED':
          console.log('📊 TikTok Shop product status changed');
          return { event: 'product_update', data };
          
        case 'NEW_ORDER':
          console.log('🛒 New TikTok Shop order received');
          const newOrder = await this.getOrderDetails(data.order_id);
          return { event: 'new_order', data: newOrder };
          
        default:
          console.log('ℹ️ Unknown TikTok Shop webhook:', type);
          return { event: 'unknown', data };
      }
    } catch (error) {
      console.error('TikTok Shop webhook handling error:', error);
      throw error;
    }
  }

  // Get OAuth URL for user authorization
  getOAuthUrl(redirectUri, state = '') {
    const baseUrl = 'https://auth.tiktok-shops.com/oauth/authorize';
    const params = new URLSearchParams({
      app_key: this.config.appKey,
      redirect_uri: redirectUri,
      state: state,
      response_type: 'code'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
}

module.exports = new TikTokShopAPI();
