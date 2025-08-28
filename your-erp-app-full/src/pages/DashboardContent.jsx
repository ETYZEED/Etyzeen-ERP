import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Briefcase, CreditCard, BellRing, MessageSquare, ShoppingCart } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { CustomTooltip, CustomTooltipPie, ActivePieShape } from '../components/SharedComponents';
import { formatRupiah } from '../utils/helpers';
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

    const onPieEnterSales = useCallback((_, index) => {
      setActiveIndexSales(index);
    }, []);
    const onPieEnterStock = useCallback((_, index) => {
      setActiveIndexStock(index);
    }, []);

    const filteredFinancialSummary = useMemo(() => {
      const now = new Date();
      
      const parseRupiah = (rupiahString) => parseFloat(rupiahString.replace(/[^0-9]/g, ''));

      const filterDataByDate = (data) => {
        return data.filter(item => {
          const itemDate = new Date(item.date);
          if (filter === 'hari_ini') {
            return now.toDateString() === itemDate.toDateString();
          } else if (filter === 'bulan_ini') {
            return now.getFullYear() === itemDate.getFullYear() && now.getMonth() === itemDate.getMonth();
          } else if (filter === 'tahun_ini') {
            return now.getFullYear() === itemDate.getFullYear();
          }
          return true;
        });
      };
    
      const filteredOfflineSales = filterDataByDate(allSales);
      const filteredEcomOrders = filterDataByDate(Object.values(allOrders).flat());
    
      const totalRevenue = filteredOfflineSales.reduce((sum, sale) => sum + parseRupiah(sale.total), 0) + 
                           filteredEcomOrders.reduce((sum, order) => sum + parseRupiah(order.total), 0);
      const totalExpenses = financeData.reduce((sum, item) => sum + item.Pengeluaran, 0);

      return {
        revenue: formatRupiah(totalRevenue),
        expenses: formatRupiah(totalExpenses),
        profit: formatRupiah(totalRevenue - totalExpenses),
        cash: formatRupiah(50000000), // Angka statis untuk demo
      };
    }, [filter, allSales, allOrders]);

    return (
        <>
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={() => setFilter('hari_ini')}
                    className={`font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${filter === 'hari_ini' ? 'font-bold' : ''}`}
                    style={{ backgroundColor: filter === 'hari_ini' ? theme.accent : theme.secondary, color: filter === 'hari_ini' ? theme.background : theme.text }}
                >
                    Hari Ini
                </button>
                <button
                    onClick={() => setFilter('bulan_ini')}
                    className={`font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${filter === 'bulan_ini' ? 'font-bold' : ''}`}
                    style={{ backgroundColor: filter === 'bulan_ini' ? theme.accent : theme.secondary, color: filter === 'bulan_ini' ? theme.background : theme.text }}
                >
                    Bulan Ini
                </button>
                <button
                    onClick={() => setFilter('tahun_ini')}
                    className={`font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${filter === 'tahun_ini' ? 'font-bold' : ''}`}
                    style={{ backgroundColor: filter === 'tahun_ini' ? theme.accent : theme.secondary, color: filter === 'tahun_ini' ? theme.background : theme.text }}
                >
                    Tahun Ini
                </button>
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
                <DashboardCard title="Total Pendapatan" value={filteredFinancialSummary.revenue} icon={TrendingUp} theme={theme} onClick={() => setActivePage('finance-pemasukan')} valueColor="#34d399" />
                <DashboardCard title="Total Pengeluaran" value={filteredFinancialSummary.expenses} icon={TrendingDown} theme={theme} onClick={() => setActivePage('finance-pengeluaran')} valueColor="#ef4444" />
                <DashboardCard title="Laba Bersih" value={filteredFinancialSummary.profit} icon={Wallet} theme={theme} onClick={() => setActivePage('finance-dashboard')} valueColor={theme.text} />
                <DashboardCard title="Saldo Kas" value={filteredFinancialSummary.cash} icon={Briefcase} theme={theme} onClick={() => setActivePage('finance-saldokas')} valueColor="#60a5fa" />
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
                          <BarChart data={financeData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={`#404040`} />
                              <XAxis dataKey="month" stroke={`#a3a3a3`} />
                              <YAxis 
                                  stroke={`#a3a3a3`} 
                                  tickFormatter={(value) => formatRupiah(value)}
                              />
                              <Tooltip content={<CustomTooltip theme={theme} />} />
                              <Legend />
                              <Bar dataKey="Pendapatan" fill="#34d399" />
                              <Bar dataKey="Pengeluaran" fill="#ef4444" />
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
                            data={salesByPlatformData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={150} // Radius diperbesar
                            paddingAngle={5}
                            fill="#8884d8"
                            activeIndex={activeIndexSales}
                            activeShape={(props) => <ActivePieShape {...props} theme={theme} />}
                            onMouseEnter={onPieEnterSales}
                            onMouseLeave={() => setActiveIndexSales(-1)}
                          >
                            {salesByPlatformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2}/>
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
                      {salesByPlatformData.map((item) => (
                        <div key={item.name} className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <span className={`text-sm font-medium`} style={{ color: theme.text }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardContent;