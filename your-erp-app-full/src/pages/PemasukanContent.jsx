import React from 'react';
import { formatRupiah } from '../utils/helpers';

const PemasukanContent = ({ theme }) => (
  <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
    <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Daftar Pemasukan</h3>
    <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Detail transaksi pemasukan akan ditampilkan di sini.</p>
    <div className="overflow-x-auto">
      <table className={`min-w-full text-left`}>
        <thead>
          <tr className={`border-b`} style={{ borderColor: theme.special }}>
            <th className={`py-3 px-4 font-bold`}
              style={{ color: theme.accent }}>Tanggal</th>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Deskripsi</th>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr className={`border-b`} style={{ borderColor: theme.special }}>
            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>2024-07-25</td>
            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>Penjualan Produk</td>
            <td className={`py-3 px-4 font-medium text-green-400`}>Rp 5.250.000</td>
          </tr>
          <tr className={`border-b`} style={{ borderColor: theme.special }}>
            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>2024-07-24</td>
            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>Penjualan Produk</td>
            <td className={`py-3 px-4 font-medium text-green-400`}>Rp 8.700.000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default PemasukanContent;