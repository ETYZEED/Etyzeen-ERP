import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Tooltip, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Briefcase } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';
import { CustomTooltip } from '../components/SharedComponents';

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

const FinanceDashboardContent = ({ theme, financialSummary }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg flex flex-col justify-between`} style={{ backgroundColor: theme.secondary }}>
          <div className="flex items-start justify-between mb-4">
            <h3 className={`text-sm font-bold`} style={{ color: theme.accent }}>Total Pendapatan</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme.special }}>
              <TrendingUp style={{ color: theme.text }} size={24} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`} style={{ color: '#34d399' }}>{financialSummary.revenue}</p>
            <p className={`text-sm font-medium`} style={{ color: theme.accent }}>+12% dari bulan lalu</p>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-lg flex flex-col justify-between`} style={{ backgroundColor: theme.secondary }}>
          <div className="flex items-start justify-between mb-4">
            <h3 className={`text-sm font-bold`} style={{ color: theme.accent }}>Total Pengeluaran</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme.special }}>
              <TrendingDown style={{ color: theme.text }} size={24} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`} style={{ color: '#ef4444' }}>{financialSummary.expenses}</p>
            <p className={`text-sm font-medium`} style={{ color: theme.accent }}>+5% dari bulan lalu</p>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-lg flex flex-col justify-between`} style={{ backgroundColor: theme.secondary }}>
          <div className="flex items-start justify-between mb-4">
            <h3 className={`text-sm font-bold`} style={{ color: theme.accent }}>Laba Bersih</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme.special }}>
              <Wallet style={{ color: theme.text }} size={24} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`} style={{ color: theme.text }}>{financialSummary.profit}</p>
            <p className={`text-sm font-medium`} style={{ color: theme.accent }}>Perkiraan bulan ini</p>
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-lg flex flex-col justify-between`} style={{ backgroundColor: theme.secondary }}>
          <div className="flex items-start justify-between mb-4">
            <h3 className={`text-sm font-bold`} style={{ color: theme.accent }}>Saldo Kas</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme.special }}>
              <Briefcase style={{ color: theme.text }} size={24} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`} style={{ color: '#60a5fa' }}>{financialSummary.cash}</p>
            <p className={`text-sm font-medium`} style={{ color: theme.accent }}>Total saldo saat ini</p>
          </div>
        </div>
      </div>
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
    </>
  );
};

export default FinanceDashboardContent;