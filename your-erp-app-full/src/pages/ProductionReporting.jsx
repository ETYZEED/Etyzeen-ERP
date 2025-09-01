import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialProductionOrders, productionKPIs } from '../data/initialData';
import { formatRupiah } from '../utils/helpers';

const ProductionReporting = ({ theme }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [productionData, setProductionData] = useState(initialProductionOrders);
  const [kpis, setKpis] = useState(productionKPIs);

  // Calculate report data based on time range
  const reportData = {
    totalOrders: productionData.length,
    completedOrders: productionData.filter(order => order.status === 'Completed').length,
    activeOrders: productionData.filter(order => order.status === 'In Progress').length,
    averageCompletionTime: '4.2 days',
    efficiencyRate: 87,
    costVariance: -3.2,
    qualityScore: 96,
    onTimeDelivery: 94
  };

  // Monthly production data for charts
  const monthlyData = [
    { month: 'Jan', orders: 45, completed: 42, efficiency: 85 },
    { month: 'Feb', orders: 52, completed: 48, efficiency: 88 },
    { month: 'Mar', orders: 48, completed: 45, efficiency: 90 },
    { month: 'Apr', orders: 61, completed: 55, efficiency: 87 },
    { month: 'May', orders: 55, completed: 52, efficiency: 89 },
    { month: 'Jun', orders: 67, completed: 63, efficiency: 92 }
  ];

  // Product performance data
  const productPerformance = [
    { product: 'Widget A', orders: 25, completed: 23, avgTime: '3.5 days', efficiency: 92 },
    { product: 'Widget B', orders: 18, completed: 17, avgTime: '4.2 days', efficiency: 88 },
    { product: 'Widget C', orders: 32, completed: 30, avgTime: '2.8 days', efficiency: 95 },
    { product: 'Widget D', orders: 15, completed: 14, avgTime: '5.1 days', efficiency: 85 }
  ];

  // Cost analysis data
  const costAnalysis = {
    materialCosts: 1250000,
    laborCosts: 850000,
    overheadCosts: 325000,
    totalCosts: 2425000,
    budgetedCosts: 2500000,
    variance: -75000
  };

  const handleExportReport = () => {
    // Simulate report export
    const reportData = {
      timeRange,
      reportType,
      data: reportData,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Production Reports</h2>
          <p className="text-sm opacity-70" style={{ color: theme.accent }}>
            Comprehensive production analytics and performance insights
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme.secondary,
              borderColor: theme.special,
              color: theme.text,
              '--tw-ring-color': theme.primary
            }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex border-b" style={{ borderColor: theme.special }}>
        <button
          onClick={() => setReportType('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            reportType === 'overview' ? 'border-b-2' : ''
          }`}
          style={{
            color: reportType === 'overview' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setReportType('performance')}
          className={`px-4 py-2 font-medium transition-colors ${
            reportType === 'performance' ? 'border-b-2' : ''
          }`}
          style={{
            color: reportType === 'performance' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Performance
        </button>
        <button
          onClick={() => setReportType('costs')}
          className={`px-4 py-2 font-medium transition-colors ${
            reportType === 'costs' ? 'border-b-2' : ''
          }`}
          style={{
            color: reportType === 'costs' ? theme.primary : theme.accent,
            borderColor: theme.primary
          }}
        >
          Cost Analysis
        </button>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
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
                  <p className="text-sm opacity-70" style={{ color: theme.accent }}>Total Orders</p>
                  <p className="text-2xl font-bold" style={{ color: theme.text }}>{reportData.totalOrders}</p>
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
                  <p className="text-sm opacity-70" style={{ color: theme.accent }}>Completed Orders</p>
                  <p className="text-2xl font-bold" style={{ color: theme.text }}>{reportData.completedOrders}</p>
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
                  <p className="text-2xl font-bold" style={{ color: theme.text }}>{reportData.efficiencyRate}%</p>
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
                  <p className="text-sm opacity-70" style={{ color: theme.accent }}>On-Time Delivery</p>
                  <p className="text-2xl font-bold" style={{ color: theme.text }}>{reportData.onTimeDelivery}%</p>
                </div>
                <Target size={24} style={{ color: theme.primary }} />
              </div>
            </motion.div>
          </div>

          {/* Monthly Production Chart */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Monthly Production Overview</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1 mb-2">
                    <div
                      className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                      style={{
                        height: `${(data.orders / 70) * 200}px`,
                        backgroundColor: theme.primary,
                        maxHeight: '200px'
                      }}
                    ></div>
                    <div
                      className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                      style={{
                        height: `${(data.completed / 70) * 200}px`,
                        backgroundColor: '#10b981',
                        maxHeight: '200px'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium" style={{ color: theme.accent }}>{data.month}</span>
                  <span className="text-xs" style={{ color: theme.text }}>{data.orders}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.primary }}></div>
                <span className="text-sm" style={{ color: theme.accent }}>Total Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-sm" style={{ color: theme.accent }}>Completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Report */}
      {reportType === 'performance' && (
        <div className="space-y-6">
          {/* Product Performance Table */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Product Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: theme.background }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Product</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Orders</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Completed</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Avg Time</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: theme.accent }}>Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerformance.map((product, index) => (
                    <tr key={index} className="border-b" style={{ borderColor: theme.special }}>
                      <td className="px-4 py-3 font-medium" style={{ color: theme.text }}>{product.product}</td>
                      <td className="px-4 py-3" style={{ color: theme.text }}>{product.orders}</td>
                      <td className="px-4 py-3" style={{ color: theme.text }}>{product.completed}</td>
                      <td className="px-4 py-3" style={{ color: theme.text }}>{product.avgTime}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${product.efficiency}%`,
                                backgroundColor: product.efficiency >= 90 ? '#10b981' : product.efficiency >= 85 ? '#f59e0b' : '#ef4444'
                              }}
                            ></div>
                          </div>
                          <span className="text-sm" style={{ color: theme.text }}>{product.efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Quality Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Quality Score</span>
                  <span className="font-bold" style={{ color: theme.text }}>{reportData.qualityScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Defect Rate</span>
                  <span className="font-bold" style={{ color: theme.text }}>2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Rework Rate</span>
                  <span className="font-bold" style={{ color: theme.text }}>1.8%</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Time Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Avg Completion Time</span>
                  <span className="font-bold" style={{ color: theme.text }}>{reportData.averageCompletionTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>On-Time Delivery</span>
                  <span className="font-bold" style={{ color: theme.text }}>{reportData.onTimeDelivery}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Schedule Variance</span>
                  <span className="font-bold" style={{ color: theme.text }}>-2.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis Report */}
      {reportType === 'costs' && (
        <div className="space-y-6">
          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Material Costs</span>
                  <span className="font-bold" style={{ color: theme.text }}>{formatRupiah(costAnalysis.materialCosts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Labor Costs</span>
                  <span className="font-bold" style={{ color: theme.text }}>{formatRupiah(costAnalysis.laborCosts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Overhead Costs</span>
                  <span className="font-bold" style={{ color: theme.text }}>{formatRupiah(costAnalysis.overheadCosts)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: theme.special }}>
                  <span className="font-bold" style={{ color: theme.text }}>Total Costs</span>
                  <span className="font-bold" style={{ color: theme.text }}>{formatRupiah(costAnalysis.totalCosts)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Budget vs Actual</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Budgeted Costs</span>
                  <span className="font-bold" style={{ color: theme.text }}>{formatRupiah(costAnalysis.budgetedCosts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: theme.accent }}>Actual Costs</span>
                  <span className="font-bold" style={{ color: theme.text }}>{formatRupiah(costAnalysis.totalCosts)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: theme.special }}>
                  <span className="font-bold" style={{ color: theme.text }}>Variance</span>
                  <span
                    className={`font-bold ${costAnalysis.variance < 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {costAnalysis.variance < 0 ? '-' : '+'}{formatRupiah(Math.abs(costAnalysis.variance))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Trend Chart */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.secondary, borderColor: theme.special }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Cost Trend Analysis</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[85, 92, 88, 95, 87, 90].map((efficiency, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${(efficiency / 100) * 200}px`,
                      backgroundColor: efficiency >= 90 ? '#10b981' : efficiency >= 85 ? '#f59e0b' : '#ef4444',
                      maxHeight: '200px'
                    }}
                  ></div>
                  <span className="text-xs font-medium mt-2" style={{ color: theme.accent }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <span className="text-sm" style={{ color: theme.accent }}>Cost Efficiency Trend (%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionReporting;
