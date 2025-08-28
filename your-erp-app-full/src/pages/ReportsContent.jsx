import React from 'react';
import { ArrowRight } from 'lucide-react';

const ReportsContent = ({ theme }) => (
  <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
    <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Laporan & Analitik</h2>
    <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Dapatkan wawasan bisnis dengan berbagai laporan yang dapat disesuaikan.</p>
    <ul className={`space-y-2`} style={{ color: theme.accent }}>
      <li className="flex items-center font-medium"><ArrowRight className={`mr-2`} style={{ color: theme.special }} size={16} /> Laporan Penjualan Harian/Bulanan</li>
      <li className="flex items-center font-medium"><ArrowRight className={`mr-2`} style={{ color: theme.special }} size={16} /> Analisis Performa Produk</li>
      <li className="flex items-center font-medium"><ArrowRight className={`mr-2`} style={{ color: theme.special }} size={16} /> Laporan Laba Rugi</li>
    </ul>
  </div>
);

export default ReportsContent;