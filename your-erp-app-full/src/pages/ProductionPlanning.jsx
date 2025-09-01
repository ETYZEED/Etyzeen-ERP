import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
  Eye,
  FileText,
  Download,
  Upload,
  MoreVertical,
  ChevronDown,
  X,
  Save,
  Target,
  Zap,
  Activity,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialProductionPlans, initialProductionOrders, productionKPIs, initialInventoryItems } from '../data/initialData';
import { formatRupiah } from '../utils/helpers';

const ProductionPlanning = ({ theme }) => {
  const [productionPlans, setProductionPlans] = useState(initialProductionPlans);
  const [productionOrders, setProductionOrders] = useState(initialProductionOrders);
  const [activeTab, setActiveTab] = useState('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  // Form states for creating new production plan
  const [newPlan, setNewPlan] = useState({
    productName: '',
    plannedQuantity: '',
    startDate: '',
    endDate: '',
    assignedWorkers: [],
    bom: []
  });

  const [availableMaterials, setAvailableMaterials] = useState(initialInventoryItems);

  // BOM templates for different products
  const bomTemplates = {
    'Headphone Nirkabel': [
      { material: 'Plastic Case', quantity: 1, unit: 'pcs' },
      { material: 'Speaker Driver', quantity: 2, unit: 'pcs' },
      { material: 'Battery', quantity: 1, unit: 'pcs' },
      { material: 'Cable', quantity: 1, unit: 'pcs' }
    ],
    'Smartwatch': [
      { material: 'Display Screen', quantity: 1, unit: 'pcs' },
      { material: 'Microcontroller', quantity: 1, unit: 'pcs' },
      { material: 'Strap', quantity: 1, unit: 'pcs' },
      { material: 'Sensor Module', quantity: 1, unit: 'pcs' }
    ]
  };

  // Function to handle product selection and auto-populate BOM
  const handleProductSelection = (productName) => {
    const template = bomTemplates[productName];
    if (template) {
      // Auto-populate BOM with template data and current stock levels
      const bomWithStock = template.map(item => {
        const inventoryItem = availableMaterials.find(mat => mat.name === item.material);
        return {
          ...item,
          availableStock: inventoryItem ? inventoryItem.stock : 0
        };
      });
      setNewPlan(prev => ({
        ...prev,
        productName,
        bom: bomWithStock
      }));
    } else {
      setNewPlan(prev => ({
        ...prev,
        productName,
        bom: []
      }));
    }
  };

  // BOM Validation Function
  const validateBOM = async (bom) => {
    try {
      const response = await fetch('http://localhost:4000/api/production/validate-bom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bom }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to validate BOM',
          details: null
        };
      }

      return {
        success: result.valid,
        error: result.valid ? null : 'Insufficient materials for production',
        details: result.results
      };
    } catch (error) {
      console.error('BOM validation error:', error);
      return {
        success: false,
        error: 'Network error during BOM validation',
        details: null
      };
    }
  };

  // Inventory Stock Update Function
  const updateInventoryStock = async (material, quantity) => {
    try {
      const response = await fetch('http://localhost:4000/api/production/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ material, quantity }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update inventory stock'
        };
      }

      return {
        success: true,
        updatedStock: result.updatedStock
      };
    } catch (error) {
      console.error('Stock update error:', error);
      return {
        success: false,
        error: 'Network error during stock update'
      };
    }
  };

  // Filter production plans based on search and status
  const filteredPlans = productionPlans.filter(plan => {
    const matchesSearch = plan.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plan.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const kpis = {
    totalPlans: productionPlans.length,
    activeOrders: productionOrders.filter(order => order.status === 'In Progress').length,
    completedThisMonth: productionOrders.filter(order =>
      order.status === 'Completed' &&
      new Date(order.completedDate).getMonth() === new Date().getMonth()
    ).length,
    averageCompletionTime: '5 days',
    materialEfficiency: 95,
    laborProductivity: 85
  };

  const handleCreatePlan = () => {
    if (!newPlan.productName || !newPlan.plannedQuantity || !newPlan.startDate || !newPlan.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const planId = `PROD-${Date.now()}`;
    const newProductionPlan = {
      id: planId,
      productName: newPlan.productName,
      plannedQuantity: parseInt(newPlan.plannedQuantity),
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      status: 'Planning',
      bom: newPlan.bom.map(material => ({
        ...material,
        quantity: material.quantity * parseInt(newPlan.plannedQuantity)
      })),
      progress: 0,
      assignedWorkers: newPlan.assignedWorkers
    };

    setProductionPlans([...productionPlans, newProductionPlan]);
    setNewPlan({
      productName: '',
      plannedQuantity: '',
      startDate: '',
      endDate: '',
      assignedWorkers: [],
      bom: []
    });
    setShowCreateForm(false);
  };

  const handleStartProduction = async (planId) => {
    // Validate BOM before starting production
    const plan = productionPlans.find(p => p.id === planId);
    if (!plan) return;

    const validationResult = await validateBOM(plan.bom);
    if (!validationResult.success) {
      alert(`Cannot start production: ${validationResult.error || 'Insufficient materials'}`);
      return;
    }

    // Update plan status to 'In Progress'
    setProductionPlans(plans =>
      plans.map(plan =>
        plan.id === planId
          ? { ...plan, status: 'In Progress' }
          : plan
      )
    );

    // Create production order
    const newOrder = {
      id: `ORDER-${Date.now()}`,
      planId: planId,
      productName: plan.productName,
      quantity: plan.plannedQuantity,
      startDate: plan.startDate,
      status: 'In Progress',
      stages: [
        { name: 'Assembly', progress: 0, estimatedTime: '2 days' },
        { name: 'Testing', progress: 0, estimatedTime: '1 day' },
        { name: 'Packaging', progress: 0, estimatedTime: '1 day' }
      ],
      materialsUsed: [],
      completedDate: null
    };
    setProductionOrders([...productionOrders, newOrder]);

    // Update inventory stock based on BOM
    plan.bom.forEach(material => {
      updateInventoryStock(material.material, material.quantity);
    });
  };

  const handleCompleteOrder = async (orderId) => {
    const order = productionOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
      // Add finished products to inventory
      const completeStockResult = await fetch('http://localhost:4000/api/production/complete-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: order.productName,
          quantity: order.quantity
        }),
      });

      const completeStockData = await completeStockResult.json();

      if (!completeStockResult.ok) {
        alert(`Failed to update inventory: ${completeStockData.error || 'Unknown error'}`);
        return;
      }

      // Update order status
      setProductionOrders(orders =>
        orders.map(order =>
          order.id === orderId
            ? { ...order, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] }
            : order
        )
      );

      // Update plan progress
      setProductionPlans(plans =>
        plans.map(plan =>
          plan.id === order.planId
            ? { ...plan, status: 'Completed', progress: 100 }
            : plan
        )
      );

      alert(`Production completed successfully! ${completeStockData.added} ${order.productName} added to inventory.`);
    } catch (error) {
      console.error('Complete order error:', error);
      alert('Network error while completing production. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return '#fbbf24';
      case 'In Progress': return '#3b82f6';
      case 'Completed': return '#10b981';
      case 'On Hold': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Planning': return <Clock size={16} />;
      case 'In Progress': return <Activity size={16} />;
      case 'Completed': return <CheckCircle size={16} />;
      case 'On Hold': return <Pause size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Production Planning</h2>
          <p className="text-sm opacity-70" style={{ color: theme.accent }}>
            Manage production plans, track orders, and monitor manufacturing progress
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            <Plus size={18} />
            New Production Plan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border"
          style={{ backgroundColor: theme.secondary, borderColor: theme.special }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Total Plans</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.totalPlans}</p>
            </div>
            <Package size={24} style={{ color: theme.primary }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border"
          style={{ backgroundColor: theme.secondary, borderColor: theme.special }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Active Orders</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.activeOrders}</p>
            </div>
            <Activity size={24} style={{ color: theme.primary }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border"
          style={{ backgroundColor: theme.secondary, borderColor: theme.special }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Material Efficiency</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.materialEfficiency}%</p>
            </div>
            <TrendingUp size={24} style={{ color: theme.primary }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg border"
          style={{ backgroundColor: theme.secondary, borderColor: theme.special }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Labor Productivity</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.laborProductivity}%</p>
            </div>
            <Users size={24} style={{ color: theme.primary }} />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: theme.special }}>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'plans' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'plans' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Production Plans
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'orders' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'orders' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Production Orders
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.accent }} />
          <input
            type="text"
            placeholder="Search production plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme.secondary,
              borderColor: theme.special,
              color: theme.text,
              '--tw-ring-color': theme.primary
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: theme.secondary,
            borderColor: theme.special,
            color: theme.text,
            '--tw-ring-color': theme.primary
          }}
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on hold">On Hold</option>
        </select>
      </div>

      {/* Production Plans Table */}
      {activeTab === 'plans' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: theme.secondary }}>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Product</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Quantity</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Start Date</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>End Date</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Status</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Progress</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.special }}>
                  <td className="px-4 py-3" style={{ color: theme.text }}>
                    <div className="font-medium">{plan.productName}</div>
                    <div className="text-sm opacity-70" style={{ color: theme.accent }}>{plan.id}</div>
                  </td>
                  <td className="px-4 py-3" style={{ color: theme.text }}>{plan.plannedQuantity}</td>
                  <td className="px-4 py-3" style={{ color: theme.text }}>{plan.startDate}</td>
                  <td className="px-4 py-3" style={{ color: theme.text }}>{plan.endDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: getStatusColor(plan.status), color: 'white' }}
                      >
                        {getStatusIcon(plan.status)}
                        {plan.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${plan.progress}%`,
                            backgroundColor: theme.primary
                          }}
                        ></div>
                      </div>
                      <span className="text-sm" style={{ color: theme.text }}>{plan.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {plan.status === 'Planning' && (
                        <button
                          onClick={() => handleStartProduction(plan.id)}
                          className="p-1 rounded hover:bg-opacity-20"
                          style={{ color: theme.primary }}
                          title="Start Production"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowPlanDetails(true);
                        }}
                        className="p-1 rounded hover:bg-opacity-20"
                        style={{ color: theme.accent }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-opacity-20"
                        style={{ color: theme.accent }}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Production Orders Table */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: theme.secondary }}>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Order ID</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Product</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Quantity</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Status</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Stages</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productionOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.special }}>
                  <td className="px-4 py-3" style={{ color: theme.text }}>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm opacity-70" style={{ color: theme.accent }}>{order.planId}</div>
                  </td>
                  <td className="px-4 py-3" style={{ color: theme.text }}>{order.productName}</td>
                  <td className="px-4 py-3" style={{ color: theme.text }}>{order.quantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {order.stages.map((stage, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: theme.text }}>{stage.name}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className="h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${stage.progress}%`,
                                backgroundColor: theme.primary
                              }}
                            ></div>
                          </div>
                          <span className="text-xs" style={{ color: theme.accent }}>{stage.progress}%</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {order.status === 'In Progress' && (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="p-1 rounded hover:bg-opacity-20"
                          style={{ color: theme.primary }}
                          title="Complete Order"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        className="p-1 rounded hover:bg-opacity-20"
                        style={{ color: theme.accent }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Production Plan Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-lg p-6"
              style={{ backgroundColor: theme.background }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>Create Production Plan</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded hover:bg-opacity-20"
                  style={{ color: theme.accent }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Product Name</label>
                  <select
                    value={newPlan.productName}
                    onChange={(e) => handleProductSelection(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.special,
                      color: theme.text,
                      '--tw-ring-color': theme.primary
                    }}
                  >
                    <option value="">Select Product</option>
                    {Object.keys(bomTemplates).map(productName => (
                      <option key={productName} value={productName}>{productName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Planned Quantity</label>
                    <input
                      type="number"
                      value={newPlan.plannedQuantity}
                      onChange={(e) => setNewPlan({...newPlan, plannedQuantity: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.secondary,
                        borderColor: theme.special,
                        color: theme.text,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Assigned Workers</label>
                    <input
                      type="text"
                      value={newPlan.assignedWorkers.join(', ')}
                      onChange={(e) => setNewPlan({...newPlan, assignedWorkers: e.target.value.split(', ')})}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.secondary,
                        borderColor: theme.special,
                        color: theme.text,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Worker names (comma separated)"
                    />
                  </div>
                </div>

                {/* BOM Display */}
                {newPlan.bom.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Bill of Materials (Auto-populated)</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {newPlan.bom.map((material, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                          <div>
                            <div className="font-medium" style={{ color: theme.text }}>{material.material}</div>
                            <div className="text-sm" style={{ color: theme.accent }}>
                              Required: {material.quantity} {material.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm" style={{ color: theme.text }}>
                              Available: {material.availableStock}
                            </div>
                            <div className={`text-xs ${material.availableStock >= material.quantity ? 'text-green-500' : 'text-red-500'}`}>
                              {material.availableStock >= material.quantity ? 'Sufficient' : 'Insufficient'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Start Date</label>
                    <input
                      type="date"
                      value={newPlan.startDate}
                      onChange={(e) => setNewPlan({...newPlan, startDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.secondary,
                        borderColor: theme.special,
                        color: theme.text,
                        '--tw-ring-color': theme.primary
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>End Date</label>
                    <input
                      type="date"
                      value={newPlan.endDate}
                      onChange={(e) => setNewPlan({...newPlan, endDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.secondary,
                        borderColor: theme.special,
                        color: theme.text,
                        '--tw-ring-color': theme.primary
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ color: theme.accent }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: theme.primary, color: 'white' }}
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Details Modal */}
      <AnimatePresence>
        {showPlanDetails && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: theme.background }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>Production Plan Details</h3>
                <button
                  onClick={() => setShowPlanDetails(false)}
                  className="p-1 rounded hover:bg-opacity-20"
                  style={{ color: theme.accent }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Plan Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Plan ID:</span>
                        <span style={{ color: theme.text }}>{selectedPlan.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Product:</span>
                        <span style={{ color: theme.text }}>{selectedPlan.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Quantity:</span>
                        <span style={{ color: theme.text }}>{selectedPlan.plannedQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Status:</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: getStatusColor(selectedPlan.status), color: 'white' }}
                          >
                            {getStatusIcon(selectedPlan.status)}
                            {selectedPlan.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Progress:</span>
                        <span style={{ color: theme.text }}>{selectedPlan.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Assigned Workers</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.assignedWorkers.map((worker, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: theme.secondary, color: theme.text }}
                        >
                          {worker}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Bill of Materials (BOM)</h4>
                    <div className="space-y-2">
                      {selectedPlan.bom.map((material, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                          <div>
                            <div className="font-medium" style={{ color: theme.text }}>{material.material}</div>
                            <div className="text-sm" style={{ color: theme.accent }}>
                              Required: {material.quantity} {material.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm" style={{ color: theme.text }}>
                              Available: {material.availableStock}
                            </div>
                            <div className={`text-xs ${material.availableStock >= material.quantity ? 'text-green-500' : 'text-red-500'}`}>
                              {material.availableStock >= material.quantity ? 'Sufficient' : 'Insufficient'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionPlanning;
