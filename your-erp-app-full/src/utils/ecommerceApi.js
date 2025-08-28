import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Create axios instance with default config
const ecommerceApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token if needed
ecommerceApi.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
ecommerceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('E-commerce API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// E-commerce API functions
export const ecommerceApiService = {
  // Get integration status
  getStatus: () => ecommerceApi.get('/ecommerce/status'),

  // Manual sync
  sync: (platform = null) => 
    ecommerceApi.post(`/ecommerce/sync${platform ? `/${platform}` : ''}`),

  // Connect platforms
  connectShopee: (credentials) => 
    ecommerceApi.post('/ecommerce/connect/shopee', credentials),

  connectTokopedia: (credentials) => 
    ecommerceApi.post('/ecommerce/connect/tokopedia', credentials),

  connectTikTokShop: (credentials) => 
    ecommerceApi.post('/ecommerce/connect/tiktokshop', credentials),

  // Disconnect platform
  disconnect: (platform) => 
    ecommerceApi.post(`/ecommerce/disconnect/${platform}`),

  // Platform-specific functions
  getShopeeOrders: (status = 'UNPAID', pageSize = 100) => 
    ecommerceApi.get('/shopee/orders', { params: { status, pageSize } }),

  getTokopediaOrders: (page = 1, perPage = 100) => 
    ecommerceApi.get('/tokopedia/orders', { params: { page, perPage } }),

  getTikTokShopOrders: (pageSize = 20, orderStatus = 0) => 
    ecommerceApi.get('/tiktokshop/orders', { params: { pageSize, orderStatus } }),

  // Product management
  updateStock: (platform, productId, stock, skuId = null) => 
    ecommerceApi.post('/ecommerce/update-stock', { platform, productId, stock, skuId }),

  // Order management
  shipOrder: (platform, orderId, trackingNumber, additionalData = {}) => 
    ecommerceApi.post('/ecommerce/ship-order', { 
      platform, 
      orderId, 
      trackingNumber, 
      ...additionalData 
    }),
};

// Platform configuration templates
export const platformConfigs = {
  shopee: {
    name: 'Shopee',
    logo: '🛍️',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { name: 'partnerId', label: 'Partner ID', type: 'text', required: true },
      { name: 'shopId', label: 'Shop ID', type: 'text', required: true },
    ],
    documentation: 'https://open.shopee.com/documents?module=87&type=2'
  },
  tokopedia: {
    name: 'Tokopedia',
    logo: '📦',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'fsId', label: 'FS ID', type: 'text', required: true },
    ],
    documentation: 'https://developer.tokopedia.com/openapi/guide/'
  },
  tiktokshop: {
    name: 'TikTok Shop',
    logo: '🎵',
    fields: [
      { name: 'appKey', label: 'App Key', type: 'text', required: true },
      { name: 'appSecret', label: 'App Secret', type: 'password', required: true },
      { name: 'shopId', label: 'Shop ID', type: 'text', required: true },
      { name: 'authCode', label: 'Auth Code', type: 'text', required: false, 
        help: 'Dapatkan dari proses OAuth' },
    ],
    documentation: 'https://partner.tiktokshop.com/doc/page/262636'
  }
};

// Order status mapping
export const orderStatusMapping = {
  shopee: {
    UNPAID: 'Belum Bayar',
    READY_TO_SHIP: 'Siap Dikirim',
    PROCESSED: 'Diproses',
    SHIPPED: 'Dikirim',
    COMPLETED: 'Selesai',
    IN_CANCEL: 'Dalam Pembatalan',
    CANCELLED: 'Dibatalkan',
    INVOICE_PENDING: 'Menunggu Invoice'
  },
  tokopedia: {
    1: 'Menunggu Pembayaran',
    2: 'Sedang Dikemas',
    3: 'Dikirim',
    4: 'Selesai',
    5: 'Dibatalkan'
  },
  tiktokshop: {
    1: 'Unpaid',
    2: 'To Ship',
    3: 'Shipping',
    4: 'Delivered',
    5: 'Completed',
    6: 'Cancelled'
  }
};

// Helper functions
export const formatPlatformName = (platform) => {
  return platformConfigs[platform]?.name || platform;
};

export const getPlatformLogo = (platform) => {
  return platformConfigs[platform]?.logo || '📱';
};

export default ecommerceApi;
