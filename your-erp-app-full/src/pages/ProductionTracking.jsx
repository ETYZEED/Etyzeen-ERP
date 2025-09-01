import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  Target,
  Zap,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialProductionOrders, productionKPIs } from '../data/initialData';
import { formatRupiah } from '../utils/helpers';

const ProductionTracking = ({ theme }) => {
  const [productionOrders, setProductionOrders] = useState(initialProductionOrders);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Filter production orders based on search and status
  const filteredOrders = productionOrders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'active' && order.status === 'In Progress') ||
                      (activeTab === 'completed' && order.status === 'Completed') ||
                      (activeTab === 'planning' && order.status === 'Planning');
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Calculate KPIs
  const kpis = {
    activeOrders: productionOrders.filter(order => order.status === 'In Progress').length,
    completedToday: productionOrders.filter(order =>
      order.status === 'Completed' &&
      new Date(order.completedDate).toDateString() === new Date().toDateString()
    ).length,
    averageCompletionTime: '4.2 hours',
    efficiencyRate: 87,
    onTimeDelivery: 94,
    qualityScore: 96
  };

  const handleUpdateStageProgress = (orderId, stageIndex, newProgress) => {
    setProductionOrders(orders =>
      orders.map(order =>
        order.id === orderId
          ? {
              ...order,
              stages: order.stages.map((stage, index) =>
                index === stageIndex
                  ? { ...stage, progress: Math.min(100, Math.max(0, newProgress)) }
                  : stage
              )
            }
          : order
      )
    );
  };

  const handleCompleteStage = (orderId, stageIndex) => {
    handleUpdateStageProgress(orderId, stageIndex, 100);

    // Auto-advance to next stage if not the last stage
    const order = productionOrders.find(o => o.id === orderId);
    if (order && stageIndex < order.stages.length - 1) {
      setTimeout(() => {
        handleUpdateStageProgress(orderId, stageIndex + 1, 25);
      }, 1000);
    }
  };

  const handleCompleteOrder = (orderId) => {
    setProductionOrders(orders =>
      orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] }
          : order
      )
    );
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

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      setProductionOrders(orders =>
        orders.map(order => {
          if (order.status === 'In Progress') {
            return {
              ...order,
              stages: order.stages.map(stage => ({
                ...stage,
                progress: Math.min(100, stage.progress + Math.random() * 2)
              }))
            };
          }
          return order;
        })
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Production Tracking</h2>
          <p className="text-sm opacity-70" style={{ color: theme.accent }}>
            Monitor real-time production progress and manage work orders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              realTimeUpdates ? 'bg-green-500' : 'bg-gray-500'
            } text-white`}
          >
            <RefreshCw size={18} className={realTimeUpdates ? 'animate-spin' : ''} />
            {realTimeUpdates ? 'Live Updates ON' : 'Live Updates OFF'}
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
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Active Orders</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.activeOrders}</p>
            </div>
            <Activity size={24} style={{ color: theme.primary }} />
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
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Completed Today</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.completedToday}</p>
            </div>
            <CheckCircle size={24} style={{ color: theme.primary }} />
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
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Efficiency Rate</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.efficiencyRate}%</p>
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
              <p className="text-sm opacity-70" style={{ color: theme.accent }}>Quality Score</p>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{kpis.qualityScore}%</p>
            </div>
            <Target size={24} style={{ color: theme.primary }} />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: theme.special }}>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'active' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'active' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Active Orders
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'completed' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'completed' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'all' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          All Orders
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search production orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
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

      {/* Production Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: theme.secondary, borderColor: theme.special }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold" style={{ color: theme.text }}>{order.productName}</h3>
                <p className="text-sm opacity-70" style={{ color: theme.accent }}>{order.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}
                >
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {order.stages.map((stage, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{stage.name}</span>
                    <span className="text-xs" style={{ color: theme.accent }}>{stage.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${stage.progress}%`,
                        backgroundColor: theme.primary
                      }}
                    ></div>
                  </div>
                  {order.status === 'In Progress' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateStageProgress(order.id, index, stage.progress + 10)}
                        className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => handleCompleteStage(order.id, index)}
                        className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm" style={{ color: theme.accent }}>
                Quantity: {order.quantity}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetails(true);
                  }}
                  className="p-1 rounded hover:bg-opacity-20"
                  style={{ color: theme.accent }}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
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
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
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
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>Order Details</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-1 rounded hover:bg-opacity-20"
                  style={{ color: theme.accent }}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Order ID:</span>
                        <span style={{ color: theme.text }}>{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Product:</span>
                        <span style={{ color: theme.text }}>{selectedOrder.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Quantity:</span>
                        <span style={{ color: theme.text }}>{selectedOrder.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Status:</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: getStatusColor(selectedOrder.status), color: 'white' }}
                          >
                            {getStatusIcon(selectedOrder.status)}
                            {selectedOrder.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Production Stages</h4>
                    <div className="space-y-3">
                      {selectedOrder.stages.map((stage, index) => (
                        <div key={index} className="p-3 rounded border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium" style={{ color: theme.text }}>{stage.name}</span>
                            <span className="text-sm" style={{ color: theme.accent }}>{stage.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${stage.progress}%`,
                                backgroundColor: theme.primary
                              }}
                            ></div>
                          </div>
                          <div className="text-xs" style={{ color: theme.accent }}>
                            Estimated: {stage.estimatedTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Materials Used</h4>
                    <div className="space-y-2">
                      {selectedOrder.materialsUsed.map((material, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                          <div>
                            <div className="font-medium" style={{ color: theme.text }}>{material.material}</div>
                            <div className="text-sm" style={{ color: theme.accent }}>
                              Used: {material.quantity} {material.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm" style={{ color: theme.text }}>
                              Cost: {formatRupiah(material.cost)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Quality Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded border text-center" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                        <div className="text-2xl font-bold" style={{ color: theme.primary }}>98%</div>
                        <div className="text-xs" style={{ color: theme.accent }}>Quality Score</div>
                      </div>
                      <div className="p-3 rounded border text-center" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                        <div className="text-2xl font-bold" style={{ color: theme.primary }}>2</div>
                        <div className="text-xs" style={{ color: theme.accent }}>Defects Found</div>
                      </div>
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

export default ProductionTracking;
