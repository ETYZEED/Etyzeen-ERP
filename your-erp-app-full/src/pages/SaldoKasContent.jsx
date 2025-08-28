import React from 'react';
import { Briefcase } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

const SaldoKasContent = ({ theme, financialSummary }) => (
  <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
    <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Ringkasan Saldo Kas</h3>
    <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Detail saldo kas dan alirannya.</p>
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.background }}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-sm font-bold`} style={{ color: theme.accent }}>Saldo Kas Saat Ini</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme.special }}>
          <Briefcase style={{ color: theme.text }} size={24} />
        </div>
      </div>
      <p className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`} style={{ color: '#60a5fa' }}>{financialSummary.cash}</p>
    </div>
  </div>
);

export default SaldoKasContent;