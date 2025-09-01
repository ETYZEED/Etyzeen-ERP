import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Eye, Edit, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

const RecentTransactions = ({ theme, transactions = [], onViewTransaction, onEditTransaction, setActivePage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data if no transactions provided
  const mockTransactions = [
    {
      id: 1,
      type: 'income',
      description: 'Penjualan Produk A',
      amount: 2500000,
      date: '2024-01-15',
      category: 'Penjualan',
      status: 'completed'
    },
    {
      id: 2,
      type: 'expense',
      description: 'Pembelian Bahan Baku',
      amount: 1500000,
      date: '2024-01-14',
      category: 'Pembelian',
      status: 'completed'
    },
    {
      id: 3,
      type: 'income',
      description: 'Jasa Konsultasi',
      amount: 3000000,
      date: '2024-01-13',
      category: 'Jasa',
      status: 'pending'
    },
    {
      id: 4,
      type: 'expense',
      description: 'Biaya Operasional',
      amount: 500000,
      date: '2024-01-12',
      category: 'Operasional',
      status: 'completed'
    },
    {
      id: 5,
      type: 'income',
      description: 'Penjualan Online',
      amount: 1800000,
      date: '2024-01-11',
      category: 'E-commerce',
      status: 'completed'
    },
    {
      id: 6,
      type: 'expense',
      description: 'Pembayaran Gaji',
      amount: 4000000,
      date: '2024-01-10',
      category: 'Gaji',
      status: 'completed'
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  // Pagination logic
  const totalPages = Math.ceil(displayTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = displayTransactions.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#34d399';
      case 'pending':
        return '#fbbf24';
      case 'failed':
        return '#ef4444';
      default:
        return theme.text;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold`} style={{ color: theme.text }}>
          Transaksi Terbaru
        </h3>
        <button
          onClick={() => setActivePage('finance-dashboard')}
          className="text-sm font-medium px-3 py-1 rounded-md transition-colors duration-200 hover:bg-opacity-20"
          style={{ color: theme.accent, backgroundColor: `${theme.accent}20` }}
        >
          Lihat Semua
        </button>
      </div>

      <div className="space-y-3">
        {currentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: theme.background,
              borderColor: theme.special
            }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-2 rounded-full"
                style={{
                  backgroundColor: transaction.type === 'income' ? '#dcfce7' : '#fef2f2',
                  color: transaction.type === 'income' ? '#166534' : '#dc2626'
                }}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownLeft size={16} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-sm" style={{ color: theme.text }}>
                    {transaction.description}
                  </p>
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: `${getStatusColor(transaction.status)}20`,
                      color: getStatusColor(transaction.status)
                    }}
                  >
                    {getStatusText(transaction.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs" style={{ color: theme.text, opacity: 0.7 }}>
                    {transaction.category}
                  </span>
                  <span className="text-xs" style={{ color: theme.text, opacity: 0.7 }}>
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p
                  className={`font-semibold text-sm ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatRupiah(transaction.amount)}
                </p>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onViewTransaction && onViewTransaction(transaction)}
                  className="p-1 rounded-md transition-colors duration-200 hover:bg-opacity-20"
                  style={{ color: theme.text }}
                  title="Lihat Detail"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => onEditTransaction && onEditTransaction(transaction)}
                  className="p-1 rounded-md transition-colors duration-200 hover:bg-opacity-20"
                  style={{ color: theme.text }}
                  title="Edit Transaksi"
                >
                  <Edit size={14} />
                </button>
                <button
                  className="p-1 rounded-md transition-colors duration-200 hover:bg-opacity-20"
                  style={{ color: theme.text }}
                  title="Opsi Lain"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
            Menampilkan {startIndex + 1}-{Math.min(endIndex, displayTransactions.length)} dari {displayTransactions.length} transaksi
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                border: `1px solid ${theme.special}`
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                    currentPage === page ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: currentPage === page ? theme.accent : theme.background,
                    color: currentPage === page ? theme.background : theme.text,
                    border: `1px solid ${theme.special}`
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                border: `1px solid ${theme.special}`
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {displayTransactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
            Belum ada transaksi
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
