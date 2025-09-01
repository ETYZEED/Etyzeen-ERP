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
  FileText,
  Download,
  Upload,
  MoreVertical,
  X,
  Save,
  Target,
  Activity,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialProductionOrders } from '../data/initialData';
import { formatRupiah } from '../utils/helpers';

const WorkOrderManagement = ({ theme }) => {
  const [workOrders, setWorkOrders] = useState(initialProductionOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Form states for creating new work order
  const [newOrder, setNewOrder] = useState({
    productName: '',
    quantity: '',
    priority: 'Medium',
    dueDate: '',
    assignedWorker: '',
    notes: ''
  });

  // Filter work orders based on search and status
  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'active' && order.status === 'In Progress') ||
                      (activeTab === 'pending' && order.status === 'Planning') ||
                      (activeTab === 'completed' && order.status === 'Completed');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleCreateOrder = () => {
    if (!newOrder.productName || !newOrder.quantity || !newOrder.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const orderId = `WO-${Date.now()}`;
    const newWorkOrder = {
      id: orderId,
      productName: newOrder.productName,
      quantity: parseInt(newOrder.quantity),
      priority: newOrder.priority,
      dueDate: newOrder.dueDate,
      assignedWorker: newOrder.assignedWorker,
      status: 'Planning',
      createdDate: new Date().toISOString().split('T')[0],
      notes: newOrder.notes,
      stages: [
        { name: 'Planning', progress: 0, estimatedTime: '1 day' },
        { name: 'Preparation', progress: 0, estimatedTime: '2 days' },
        { name: 'Production', progress: 0, estimatedTime: '5 days' },
        { name: 'Quality Check', progress: 0, estimatedTime: '1 day' },
        { name: 'Packaging', progress: 0, estimatedTime: '1 day' }
      ],
      materialsUsed: [],
      completedDate: null
    };

    setWorkOrders([...workOrders, newWorkOrder]);
    setNewOrder({
      productName: '',
      quantity: '',
      priority: 'Medium',
      dueDate: '',
      assignedWorker: '',
      notes: ''
    });
    setShowCreateForm(false);
  };

  const handleStartOrder = (orderId) => {
    setWorkOrders(orders =>
      orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'In Progress' }
          : order
      )
    );
  };

  const handleCompleteOrder = (orderId) => {
    setWorkOrders(orders =>
      orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] }
          : order
      )
    );
  };

  const handleUpdateStage = (orderId, stageIndex, progress) => {
    setWorkOrders(orders =>
      orders.map(order =>
        order.id === orderId
          ? {
              ...order,
              stages: order.stages.map((stage, index) =>
                index === stageIndex
                  ? { ...stage, progress: Math.min(100, Math.max(0, progress)) }
                  : stage
              )
            }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Work Order Management</h2>
          <p className="text-sm opacity-70" style={{ color: theme.accent }}>
            Create, track, and manage production work orders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            <Plus size={18} />
            New Work Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: theme.special }}>
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
          Active
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'pending' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Pending
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
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.accent }} />
          <input
            type="text"
            placeholder="Search work orders..."
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

      {/* Work Orders Grid */}
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
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: getPriorityColor(order.priority), color: 'white' }}
                >
                  {order.priority}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: theme.accent }}>Status:</span>
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

              <div className="flex justify-between items-center text-sm">
                <span style={{ color: theme.accent }}>Quantity:</span>
                <span style={{ color: theme.text }}>{order.quantity}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span style={{ color: theme.accent }}>Due Date:</span>
                <span style={{ color: theme.text }}>{order.dueDate}</span>
              </div>

              {order.assignedWorker && (
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: theme.accent }}>Assigned:</span>
                  <span style={{ color: theme.text }}>{order.assignedWorker}</span>
                </div>
              )}
            </div>

            {/* Progress Stages */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium" style={{ color: theme.text }}>Progress</h4>
              {order.stages.slice(0, 3).map((stage, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs flex-1" style={{ color: theme.accent }}>{stage.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${stage.progress}%`,
                        backgroundColor: theme.primary
                      }}
                    ></div>
                  </div>
                  <span className="text-xs" style={{ color: theme.text }}>{stage.progress}%</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs" style={{ color: theme.accent }}>
                Created: {order.createdDate}
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
                  <FileText size={16} />
                </button>
                {order.status === 'Planning' && (
                  <button
                    onClick={() => handleStartOrder(order.id)}
                    className="p-1 rounded hover:bg-opacity-20"
                    style={{ color: theme.primary }}
                    title="Start Order"
                  >
                    <Play size={16} />
                  </button>
                )}
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

      {/* Create Work Order Modal */}
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
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>Create Work Order</h3>
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
                  <input
                    type="text"
                    value={newOrder.productName}
                    onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.special,
                      color: theme.text,
                      '--tw-ring-color': theme.primary
                    }}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Quantity</label>
                    <input
                      type="number"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
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
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Priority</label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.secondary,
                        borderColor: theme.special,
                        color: theme.text,
                        '--tw-ring-color': theme.primary
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Due Date</label>
                    <input
                      type="date"
                      value={newOrder.dueDate}
                      onChange={(e) => setNewOrder({...newOrder, dueDate: e.target.value})}
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
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Assigned Worker</label>
                    <input
                      type="text"
                      value={newOrder.assignedWorker}
                      onChange={(e) => setNewOrder({...newOrder, assignedWorker: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.secondary,
                        borderColor: theme.special,
                        color: theme.text,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Worker name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>Notes</label>
                  <textarea
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.special,
                      color: theme.text,
                      '--tw-ring-color': theme.primary
                    }}
                    placeholder="Additional notes..."
                    rows={3}
                  />
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
                    onClick={handleCreateOrder}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: theme.primary, color: 'white' }}
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>Work Order Details</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-1 rounded hover:bg-opacity-20"
                  style={{ color: theme.accent }}
                >
                  <X size={20} />
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
                        <span style={{ color: theme.accent }}>Priority:</span>
                        <span style={{ color: getPriorityColor(selectedOrder.priority) }}>{selectedOrder.priority}</span>
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
                      <div className="flex justify-between">
                        <span style={{ color: theme.accent }}>Due Date:</span>
                        <span style={{ color: theme.text }}>{selectedOrder.dueDate}</span>
                      </div>
                      {selectedOrder.assignedWorker && (
                        <div className="flex justify-between">
                          <span style={{ color: theme.accent }}>Assigned Worker:</span>
                          <span style={{ color: theme.text }}>{selectedOrder.assignedWorker}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: theme.text }}>Notes</h4>
                      <p className="text-sm" style={{ color: theme.accent }}>{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: theme.text }}>Production Stages</h4>
                    <div className="space-y-3">
                      {selectedOrder.stages.map((stage, index) => (
                        <div key={index} className="p-3 rounded border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium" style={{ color: theme.text }}>{stage.name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={stage.progress}
                                onChange={(e) => handleUpdateStage(selectedOrder.id, index, parseInt(e.target.value))}
                                className="w-16 px-2 py-1 text-xs rounded border"
                                style={{
                                  backgroundColor: theme.background,
                                  borderColor: theme.special,
                                  color: theme.text
                                }}
                              />
                              <span className="text-sm" style={{ color: theme.accent }}>%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkOrderManagement;
