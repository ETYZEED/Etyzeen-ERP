import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Briefcase, CreditCard, BellRing, MessageSquare, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import DateFilter from '../components/DateFilter';
import RecentTransactions from '../components/RecentTransactions';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { CustomTooltip, CustomTooltipPie, ActivePieShape } from '../components/SharedComponents';
import { formatRupiah, getThemeTransition, getThemeGradient, getThemeShadow, getResponsiveClasses } from '../utils/helpers';
import { calculateTrends } from '../utils/financialCalculations';
// import DashboardAI from '../components/DashboardAI';

// Data simulasi untuk demonstrasi
const financeData = [
  { month: 'Jan', Pendapatan: 4000000, Pengeluaran: 2400000 },
  { month: 'Feb', Pendapatan: 3000000, Pengeluaran: 1398000 },
  { month: 'Mar', Pendapatan: 2000000, Pengeluaran: 9800000 },
  { month: 'Apr', Pendapatan: 2780000, Pengeluaran: 3908000 },
  { month: 'Mei', Pendapatan: 1890000, Pengeluaran: 4800000 },
  { month: 'Jun', Pendapatan: 2390000, Pengeluaran: 3800000 },
  { month: 'Jul', Pendapatan: 3490000, Pengeluaran: 4300000 },
  { month: 'Agu', Pendapatan: 4500000, Pengeluaran: 2500000 },
  { month: 'Sep', Pendapatan: 5500000, Pengeluaran: 3000000 },
  { month: 'Okt', Pendapatan: 6000000, Pengeluaran: 3200000 },
  { month: 'Nov', Pendapatan: 6200000, Pengeluaran: 3500000 },
  { month: 'Des', Pendapatan: 7000000, Pengeluaran: 4000000 },
];

const DashboardContent = ({ theme, allSales, allOrders, salesByPlatformData, bestSellingProducts, receivables, payables, setActivePage, lowStockItems }) => {
    const [filter, setFilter] = useState('bulan_ini');
    const [activeIndexSales, setActiveIndexSales] = useState(-1);
    const [activeIndexStock, setActiveIndexStock] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const onPieEnterSales = useCallback((_, index) => {
      setActiveIndexSales(index);
    }, []);
    const onPieEnterStock = useCallback((_, index) => {
      setActiveIndexStock(index);
    }, []);

    const financialTrends = useMemo(() => {
      try {
        return calculateTrends(filter, allSales, allOrders);
      } catch (error) {
        console.error('Error calculating trends:', error);
        setError('Error calculating financial trends');
        // Fallback to basic calculation
        return {
          revenue: { value: 'Rp 0', trend: 0, rawValue: 0 },
          expenses: { value: 'Rp 0', trend: 0, rawValue: 0 },
          profit: { value: 'Rp 0', trend: 0, rawValue: 0 },
          cash: { value: 'Rp 50,000,000', trend: 0, rawValue: 50000000 }
        };
      }
    }, [filter, allSales, allOrders]);

    // Simulate loading state for demo
    useEffect(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setError(null);
      }, 1000);
      return () => clearTimeout(timer);
    }, [filter]);

    return (
        <>
            <div className="flex items-center space-x-4 mb-8">
                <DateFilter
                  theme={theme}
                  selectedFilter={filter}
                  onFilterChange={(key, customRange) => {
                    if (key === 'custom') {
                      // Handle custom range filter
                      // You can update state or fetch data accordingly
                      console.log('Custom range selected:', customRange);
                    } else {
                      setFilter(key);
                    }
                  }}
                />
            </div>
            {lowStockItems.length > 0 && (
                <div
                    className={`p-4 mb-6 rounded-lg bg-red-500/20 text-red-400 border border-red-400 flex items-start space-x-2 animate-pulse cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                    onClick={() => setActivePage('inventory')}
                >
                    <BellRing size={20} />
                    <p className="font-semibold text-sm">Peringatan: Ada {lowStockItems.length} produk dengan stok menipis! Klik untuk melihat.</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard title="Total Pendapatan" value={financialTrends.revenue.value} icon={TrendingUp} theme={theme} onClick={() => setActivePage('finance-pemasukan')} valueColor="#34d399" trend={financialTrends.revenue.trend} />
                <DashboardCard title="Total Pengeluaran" value={financialTrends.expenses.value} icon={TrendingDown} theme={theme} onClick={() => setActivePage('finance-pengeluaran')} valueColor="#ef4444" trend={financialTrends.expenses.trend} />
                <DashboardCard title="Laba Bersih" value={financialTrends.profit.value} icon={Wallet} theme={theme} onClick={() => setActivePage('finance-dashboard')} valueColor={theme.text} trend={financialTrends.profit.trend} />
                <DashboardCard title="Saldo Kas" value={financialTrends.cash.value} icon={Briefcase} theme={theme} onClick={() => setActivePage('finance-saldokas')} valueColor="#60a5fa" trend={financialTrends.cash.trend} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <DashboardCard title="Total Piutang" value={`${receivables.length} Piutang`} icon={CreditCard} theme={theme} onClick={() => setActivePage('finance-payables')} valueColor={theme.text} />
                <DashboardCard title="Total Utang" value={`${payables.length} Utang`} icon={CreditCard} theme={theme} onClick={() => setActivePage('finance-payables')} valueColor={theme.text} />
            </div>
            {/* <DashboardAI theme={theme} financialSummary={filteredFinancialSummary} selectedFilter={filter} /> */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
                    <h3 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Grafik Laba/Rugi Bulanan</h3>
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                      <ResponsiveContainer width={1000} height={400}>
                          <BarChart
                            data={financeData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                              <CartesianGrid strokeDasharray="3 3" stroke={`#404040`} />
                              <XAxis
                                dataKey="month"
                                stroke={`#a3a3a3`}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                  stroke={`#a3a3a3`}
                                  tickFormatter={(value) => formatRupiah(value)}
                                  tick={{ fontSize: 12 }}
                              />
                              <Tooltip content={<CustomTooltip theme={theme} />} />
                              <Legend />
                              <Bar
                                dataKey="Pendapatan"
                                fill="#34d399"
                                radius={[4, 4, 0, 0]}
                                animationBegin={0}
                                animationDuration={1000}
                                animationEasing="ease-out"
                              />
                              <Bar
                                dataKey="Pengeluaran"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                animationBegin={200}
                                animationDuration={1000}
                                animationEasing="ease-out"
                              />
                          </BarChart>
                      </ResponsiveContainer>
                    </div>
                </div>
                <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
                    <h3 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Penjualan per Platform E-commerce</h3>
                    <div className="relative w-full h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByPlatformData.map(item => ({
                              ...item,
                              total: salesByPlatformData.reduce((sum, d) => sum + d.value, 0)
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={150}
                            paddingAngle={5}
                            fill="#8884d8"
                            activeIndex={activeIndexSales}
                            activeShape={(props) => <ActivePieShape {...props} theme={theme} />}
                            onMouseEnter={onPieEnterSales}
                            onMouseLeave={() => setActiveIndexSales(-1)}
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {salesByPlatformData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#fff"
                                strokeWidth={2}
                                style={{
                                  filter: activeIndexSales === index ? `drop-shadow(0px 0px 12px ${entry.color})` : 'none',
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltipPie theme={theme}/>} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                          <ShoppingCart size={40} style={{ color: theme.accent, filter: `drop-shadow(0 2px 2px ${theme.secondary})` }} />
                      </div>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      {salesByPlatformData.map((item, index) => (
                        <div
                          key={item.name}
                          className={`flex items-center cursor-pointer transition-all duration-200 hover:scale-105 ${activeIndexSales === index ? 'scale-105' : ''}`}
                          onMouseEnter={() => setActiveIndexSales(index)}
                          onMouseLeave={() => setActiveIndexSales(-1)}
                        >
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <span className={`text-sm font-medium`} style={{ color: theme.text }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="mb-8">
                <RecentTransactions
                  theme={theme}
                  transactions={[]} // Pass actual transactions data when available
                  onViewTransaction={(transaction) => {
                    console.log('View transaction:', transaction);
                    // Handle view transaction logic
                  }}
                  onEditTransaction={(transaction) => {
                    console.log('Edit transaction:', transaction);
                    // Handle edit transaction logic
                  }}
                  setActivePage={setActivePage}
                />
            </div>
        </>
    );
};

export default DashboardContent;