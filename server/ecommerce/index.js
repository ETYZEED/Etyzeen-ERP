const axios = require('axios');
const crypto = require('crypto');
const cron = require('node-cron');

// Import platform-specific modules
const shopeeAPI = require('./shopee-api');
const tokopediaAPI = require('./tokopedia-api');
const tiktokshopAPI = require('./tiktokshop-api');

class EcommerceIntegration {
  // Removed duplicate constructor
  constructor() {
    this.platforms = {
      shopee: shopeeAPI,
      tokopedia: tokopediaAPI,
      tiktokshop: tiktokshopAPI
    };

    this.connections = {};
    this.syncIntervals = {};
    this.syncedOrders = {}; // Store synced orders by platform
    this.syncedProducts = {}; // Store synced products by platform
  }

  // Initialize all platform connections
  async initialize() {
    console.log('Initializing e-commerce integrations...');
    
    // Load saved configurations from database or file
    // For now, we'll use environment variables
    const configs = this.loadConfigurations();
    
    for (const [platform, config] of Object.entries(configs)) {
      if (config.enabled && config.apiKey && config.apiSecret) {
        await this.connectPlatform(platform, config);
      }
    }
    
    // Start scheduled sync
    this.startScheduledSync();
  }

  loadConfigurations() {
    return {
      shopee: {
        enabled: process.env.SHOPEE_ENABLED === 'true',
        apiKey: process.env.SHOPEE_API_KEY,
        apiSecret: process.env.SHOPEE_API_SECRET,
        partnerId: process.env.SHOPEE_PARTNER_ID,
        shopId: process.env.SHOPEE_SHOP_ID
      },
      tokopedia: {
        enabled: process.env.TOKOPEDIA_ENABLED === 'true',
        clientId: process.env.TOKOPEDIA_CLIENT_ID,
        clientSecret: process.env.TOKOPEDIA_CLIENT_SECRET,
        fsId: process.env.TOKOPEDIA_FS_ID
      },
      tiktokshop: {
        enabled: process.env.TIKTOKSHOP_ENABLED === 'true',
        appKey: process.env.TIKTOKSHOP_APP_KEY,
        appSecret: process.env.TIKTOKSHOP_APP_SECRET,
        shopId: process.env.TIKTOKSHOP_SHOP_ID
      }
    };
  }

  async connectPlatform(platform, config) {
    try {
      const api = this.platforms[platform];
      if (api) {
        this.connections[platform] = await api.initialize(config);
        console.log(`✅ ${platform.toUpperCase()} connected successfully`);
        
        // Start platform-specific sync
        await this.syncPlatform(platform);
      }
    } catch (error) {
      console.error(`❌ Failed to connect to ${platform}:`, error.message);
    }
  }

  async syncPlatform(platform) {
    try {
      const api = this.connections[platform];
      if (api) {
        console.log(`🔄 Syncing ${platform} data...`);

        // Sync orders
        const orders = await api.getOrders();
        console.log(`📦 ${platform}: Fetched ${orders.length} orders`);

        // Sync products
        const products = await api.getProducts();
        console.log(`📊 ${platform}: Fetched ${products.length} products`);

        // Store the synced data
        this.syncedOrders[platform] = orders || [];
        this.syncedProducts[platform] = products || [];

        return { orders, products };
      }
    } catch (error) {
      console.error(`❌ Sync failed for ${platform}:`, error.message);
      // Return empty arrays on error to avoid undefined
      this.syncedOrders[platform] = [];
      this.syncedProducts[platform] = [];
    }
  }

  startScheduledSync() {
    // Sync every 30 minutes
    this.syncIntervals.main = cron.schedule('*/30 * * * *', async () => {
      console.log('🔄 Running scheduled e-commerce sync...');
      for (const platform of Object.keys(this.connections)) {
        await this.syncPlatform(platform);
      }
    });
  }

  // Get connection status for all platforms
  getStatus() {
    const status = {};
    for (const [platform, connection] of Object.entries(this.connections)) {
      status[platform] = {
        connected: !!connection,
        lastSync: new Date().toISOString(),
        // Add more status info as needed
      };
    }
    return status;
  }

  // Webhook handler for platform notifications
  async handleWebhook(platform, payload) {
    try {
      const api = this.connections[platform];
      if (api && api.handleWebhook) {
        return await api.handleWebhook(payload);
      }
      return { success: false, message: 'Webhook not supported' };
    } catch (error) {
      console.error(`Webhook error for ${platform}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Manual sync trigger
  async manualSync(platform) {
    if (platform) {
      return await this.syncPlatform(platform);
    } else {
      const results = {};
      for (const platform of Object.keys(this.connections)) {
        results[platform] = await this.syncPlatform(platform);
      }
      return results;
    }
  }

  // Disconnect platform
  disconnectPlatform(platform) {
    if (this.connections[platform]) {
      delete this.connections[platform];
      console.log(`🔌 Disconnected from ${platform}`);
    }
  }

  // Get all synced orders
  getSyncedOrders() {
    const allOrders = [];
    for (const [platform, orders] of Object.entries(this.syncedOrders)) {
      orders.forEach(order => {
        allOrders.push({
          ...order,
          platform,
          source: 'ecommerce'
        });
      });
    }
    return allOrders;
  }

  // Get synced orders by platform
  getSyncedOrdersByPlatform(platform) {
    return this.syncedOrders[platform] || [];
  }
}

module.exports = new EcommerceIntegration();
