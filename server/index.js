require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import e-commerce integration
const ecommerceIntegration = require('./ecommerce');

// Production Module Data Storage (in-memory for demo)
let productionPlans = [
  {
    id: 'PROD-001',
    productName: 'Headphone Nirkabel',
    plannedQuantity: 50,
    startDate: '2024-08-01',
    endDate: '2024-08-05',
    status: 'Planning',
    bom: [
      { material: 'Plastic Case', quantity: 50, unit: 'pcs', availableStock: 200 },
      { material: 'Speaker Driver', quantity: 100, unit: 'pcs', availableStock: 150 },
      { material: 'Battery', quantity: 50, unit: 'pcs', availableStock: 75 },
      { material: 'Cable', quantity: 50, unit: 'pcs', availableStock: 100 }
    ],
    progress: 0,
    assignedWorkers: ['Dewi Lestari', 'Fandi Ahmad']
  },
  {
    id: 'PROD-002',
    productName: 'Smartwatch',
    plannedQuantity: 30,
    startDate: '2024-08-03',
    endDate: '2024-08-08',
    status: 'In Progress',
    bom: [
      { material: 'Display Screen', quantity: 30, unit: 'pcs', availableStock: 45 },
      { material: 'Microcontroller', quantity: 30, unit: 'pcs', availableStock: 60 },
      { material: 'Strap', quantity: 30, unit: 'pcs', availableStock: 80 },
      { material: 'Sensor Module', quantity: 30, unit: 'pcs', availableStock: 25 }
    ],
    progress: 35,
    assignedWorkers: ['Rina Utami']
  }
];

let productionOrders = [
  {
    id: 'ORDER-001',
    planId: 'PROD-001',
    productName: 'Headphone Nirkabel',
    quantity: 50,
    startDate: '2024-08-01',
    status: 'Planning',
    stages: [
      { name: 'Assembly', progress: 0, estimatedTime: '2 days' },
      { name: 'Testing', progress: 0, estimatedTime: '1 day' },
      { name: 'Packaging', progress: 0, estimatedTime: '1 day' }
    ],
    materialsUsed: [],
    completedDate: null
  },
  {
    id: 'ORDER-002',
    planId: 'PROD-002',
    productName: 'Smartwatch',
    quantity: 30,
    startDate: '2024-08-03',
    status: 'In Progress',
    stages: [
      { name: 'Assembly', progress: 70, estimatedTime: '2 days' },
      { name: 'Testing', progress: 50, estimatedTime: '1 day' },
      { name: 'Packaging', progress: 0, estimatedTime: '1 day' }
    ],
    materialsUsed: [
      { material: 'Display Screen', quantity: 15, unit: 'pcs' },
      { material: 'Microcontroller', quantity: 15, unit: 'pcs' }
    ],
    completedDate: null
  }
];

// Inventory data for BOM validation
let inventoryItems = [
  { id: 1, name: 'Plastic Case', stock: 200, reorderPoint: 50 },
  { id: 2, name: 'Speaker Driver', stock: 150, reorderPoint: 30 },
  { id: 3, name: 'Battery', stock: 75, reorderPoint: 25 },
  { id: 4, name: 'Cable', stock: 100, reorderPoint: 20 },
  { id: 5, name: 'Display Screen', stock: 45, reorderPoint: 15 },
  { id: 6, name: 'Microcontroller', stock: 60, reorderPoint: 20 },
  { id: 7, name: 'Strap', stock: 80, reorderPoint: 25 },
  { id: 8, name: 'Sensor Module', stock: 25, reorderPoint: 10 }
];

const app = express();
app.use(express.json());
app.use(helmet());

// izinkan origin frontend Anda (sesuaikan jika perlu)
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5001'] }));

// rate limiter sederhana
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use('/api/', limiter);

// Initialize e-commerce integration
ecommerceIntegration.initialize().catch(console.error);

// health check for API
app.get('/api', (req, res) => res.send('API proxy OK'));

// E-commerce integration endpoints
app.get('/api/ecommerce/status', (req, res) => {
  try {
    const status = ecommerceIntegration.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ecommerce/orders', (req, res) => {
  try {
    const orders = ecommerceIntegration.getSyncedOrders();
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/sync', async (req, res) => {
  try {
    const result = await ecommerceIntegration.manualSync();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/sync/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const result = await ecommerceIntegration.manualSync(platform);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoints for each platform
app.post('/api/webhook/shopee', async (req, res) => {
  try {
    const result = await ecommerceIntegration.handleWebhook('shopee', req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/webhook/tokopedia', async (req, res) => {
  try {
    const result = await ecommerceIntegration.handleWebhook('tokopedia', req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/webhook/tiktokshop', async (req, res) => {
  try {
    const result = await ecommerceIntegration.handleWebhook('tiktokshop', req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Platform configuration endpoints
app.post('/api/ecommerce/connect/shopee', async (req, res) => {
  try {
    const { apiKey, apiSecret, partnerId, shopId } = req.body;
    await ecommerceIntegration.connectPlatform('shopee', {
      apiKey, apiSecret, partnerId, shopId, enabled: true
    });
    res.json({ success: true, message: 'Shopee connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/connect/tokopedia', async (req, res) => {
  try {
    const { clientId, clientSecret, fsId } = req.body;
    await ecommerceIntegration.connectPlatform('tokopedia', {
      clientId, clientSecret, fsId, enabled: true
    });
    res.json({ success: true, message: 'Tokopedia connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/connect/tiktokshop', async (req, res) => {
  try {
    const { appKey, appSecret, shopId, authCode } = req.body;
    await ecommerceIntegration.connectPlatform('tiktokshop', {
      appKey, appSecret, shopId, authCode, enabled: true
    });
    res.json({ success: true, message: 'TikTok Shop connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Disconnect platform
app.post('/api/ecommerce/disconnect/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    ecommerceIntegration.disconnectPlatform(platform);
    res.json({ success: true, message: `${platform} disconnected successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// proxy endpoint with mock fallback when no API key
app.post('/api/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response for local development / testing
      return res.json({
        mock: true,
        message: 'No GEMINI_API_KEY configured — returning mock response for development',
        input: req.body,
        generated: [
          { text: 'AI singkat: AI memproses data dan menghasilkan prediksi atau teks.' },
        ],
      });
    }

    // real request to Gemini (only when API key present)
    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Production Module API Endpoints

// Get all production plans
app.get('/api/production/plans', (req, res) => {
  try {
    res.json({ success: true, plans: productionPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new production plan
app.post('/api/production/plans', (req, res) => {
  try {
    const { productName, plannedQuantity, startDate, endDate, assignedWorkers, bom } = req.body;

    if (!productName || !plannedQuantity || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const planId = `PROD-${Date.now()}`;
    const newPlan = {
      id: planId,
      productName,
      plannedQuantity: parseInt(plannedQuantity),
      startDate,
      endDate,
      status: 'Planning',
      bom: bom || [],
      progress: 0,
      assignedWorkers: assignedWorkers || []
    };

    productionPlans.push(newPlan);
    res.json({ success: true, plan: newPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update production plan
app.put('/api/production/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const planIndex = productionPlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) {
      return res.status(404).json({ success: false, error: 'Production plan not found' });
    }

    productionPlans[planIndex] = { ...productionPlans[planIndex], ...updates };
    res.json({ success: true, plan: productionPlans[planIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete production plan
app.delete('/api/production/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const planIndex = productionPlans.findIndex(plan => plan.id === id);

    if (planIndex === -1) {
      return res.status(404).json({ success: false, error: 'Production plan not found' });
    }

    productionPlans.splice(planIndex, 1);
    res.json({ success: true, message: 'Production plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all production orders
app.get('/api/production/orders', (req, res) => {
  try {
    res.json({ success: true, orders: productionOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new production order
app.post('/api/production/orders', (req, res) => {
  try {
    const { planId, productName, quantity, startDate } = req.body;

    if (!planId || !productName || !quantity || !startDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const orderId = `ORDER-${Date.now()}`;
    const newOrder = {
      id: orderId,
      planId,
      productName,
      quantity: parseInt(quantity),
      startDate,
      status: 'Planning',
      stages: [
        { name: 'Assembly', progress: 0, estimatedTime: '2 days' },
        { name: 'Testing', progress: 0, estimatedTime: '1 day' },
        { name: 'Packaging', progress: 0, estimatedTime: '1 day' }
      ],
      materialsUsed: [],
      completedDate: null
    };

    productionOrders.push(newOrder);
    res.json({ success: true, order: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update production order
app.put('/api/production/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const orderIndex = productionOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, error: 'Production order not found' });
    }

    productionOrders[orderIndex] = { ...productionOrders[orderIndex], ...updates };
    res.json({ success: true, order: productionOrders[orderIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start production for a plan
app.post('/api/production/plans/:id/start', (req, res) => {
  try {
    const { id } = req.params;
    const planIndex = productionPlans.findIndex(plan => plan.id === id);

    if (planIndex === -1) {
      return res.status(404).json({ success: false, error: 'Production plan not found' });
    }

    // Update plan status
    productionPlans[planIndex].status = 'In Progress';

    // Create production order if it doesn't exist
    const existingOrder = productionOrders.find(order => order.planId === id);
    if (!existingOrder) {
      const newOrder = {
        id: `ORDER-${Date.now()}`,
        planId: id,
        productName: productionPlans[planIndex].productName,
        quantity: productionPlans[planIndex].plannedQuantity,
        startDate: productionPlans[planIndex].startDate,
        status: 'In Progress',
        stages: [
          { name: 'Assembly', progress: 0, estimatedTime: '2 days' },
          { name: 'Testing', progress: 0, estimatedTime: '1 day' },
          { name: 'Packaging', progress: 0, estimatedTime: '1 day' }
        ],
        materialsUsed: [],
        completedDate: null
      };
      productionOrders.push(newOrder);
    }

    res.json({ success: true, plan: productionPlans[planIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete production order
app.post('/api/production/orders/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = productionOrders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, error: 'Production order not found' });
    }

    // Update order status
    productionOrders[orderIndex].status = 'Completed';
    productionOrders[orderIndex].completedDate = new Date().toISOString().split('T')[0];

    // Update plan progress
    const planIndex = productionPlans.findIndex(plan => plan.id === productionOrders[orderIndex].planId);
    if (planIndex !== -1) {
      productionPlans[planIndex].status = 'Completed';
      productionPlans[planIndex].progress = 100;
    }

    res.json({ success: true, order: productionOrders[orderIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate BOM for production plan
app.post('/api/production/validate-bom', (req, res) => {
  try {
    const { bom } = req.body;

    if (!bom || !Array.isArray(bom)) {
      return res.status(400).json({ success: false, error: 'Invalid BOM data' });
    }

    const validationResults = bom.map(item => {
      const inventoryItem = inventoryItems.find(inv => inv.name === item.material);
      if (!inventoryItem) {
        return {
          material: item.material,
          required: item.quantity,
          available: 0,
          sufficient: false,
          message: 'Material not found in inventory'
        };
      }

      const sufficient = inventoryItem.stock >= item.quantity;
      return {
        material: item.material,
        required: item.quantity,
        available: inventoryItem.stock,
        sufficient,
        message: sufficient ? 'Sufficient stock' : 'Insufficient stock'
      };
    });

    const allSufficient = validationResults.every(result => result.sufficient);

    res.json({
      success: true,
      valid: allSufficient,
      results: validationResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update inventory stock (deduct materials when production starts)
app.post('/api/production/update-stock', (req, res) => {
  try {
    const { material, quantity } = req.body;

    if (!material || quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, error: 'Invalid material or quantity' });
    }

    const inventoryItem = inventoryItems.find(inv => inv.name === material);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, error: 'Material not found in inventory' });
    }

    if (inventoryItem.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        available: inventoryItem.stock,
        required: quantity
      });
    }

    // Deduct the quantity from inventory
    inventoryItem.stock -= quantity;

    res.json({
      success: true,
      message: 'Stock updated successfully',
      material: material,
      deducted: quantity,
      updatedStock: inventoryItem.stock
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete production stock (add finished products to inventory)
app.post('/api/production/complete-stock', (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid product or quantity' });
    }

    // Find or create the finished product in inventory
    let inventoryItem = inventoryItems.find(inv => inv.name === product);

    if (!inventoryItem) {
      // Create new inventory item for finished product
      const newId = Math.max(...inventoryItems.map(item => item.id)) + 1;
      inventoryItem = {
        id: newId,
        name: product,
        stock: 0,
        reorderPoint: 10, // Default reorder point
        location: 'Production Warehouse',
        serial: `PROD-${Date.now()}`,
        category: 'Finished Goods'
      };
      inventoryItems.push(inventoryItem);
    }

    // Add the quantity to inventory
    inventoryItem.stock += quantity;

    res.json({
      success: true,
      message: 'Finished product added to inventory',
      product: product,
      added: quantity,
      updatedStock: inventoryItem.stock
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inventory items for BOM
app.get('/api/production/inventory', (req, res) => {
  try {
    res.json({ success: true, inventory: inventoryItems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 4000;
// Serve frontend build (production) if present
const buildDir = path.resolve(__dirname, '../your-erp-app-full/build');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  // SPA fallback (except API routes) - Express 5 compatible
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
  console.log(`Serving frontend from ${buildDir}`);
} else {
  console.warn(`Frontend build not found at ${buildDir}. Run frontend build to enable static serving.`);
}

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
