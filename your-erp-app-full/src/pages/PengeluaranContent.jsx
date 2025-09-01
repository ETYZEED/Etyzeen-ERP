import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Search, Filter, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

const LS_KEY_EXPENSES = 'pengeluaran_entries';
const LS_KEY_CATEGORIES = 'pengeluaran_categories';

const loadExpenses = () => {
  try { const raw = localStorage.getItem(LS_KEY_EXPENSES); return raw ? JSON.parse(raw) : []; } catch { return []; }
};

const saveExpenses = (arr) => { localStorage.setItem(LS_KEY_EXPENSES, JSON.stringify(arr)); };

const loadCategories = () => {
  try { const raw = localStorage.getItem(LS_KEY_CATEGORIES); return raw ? JSON.parse(raw) : ['Gaji Karyawan', 'Biaya Operasional', 'Biaya Marketing', 'Biaya Transportasi', 'Biaya Utilitas', 'Biaya Sewa', 'Biaya Lainnya']; } catch { return ['Gaji Karyawan', 'Biaya Operasional', 'Biaya Marketing', 'Biaya Transportasi', 'Biaya Utilitas', 'Biaya Sewa', 'Biaya Lainnya']; }
};

const saveCategories = (arr) => { localStorage.setItem(LS_KEY_CATEGORIES, JSON.stringify(arr)); };

const PengeluaranContent = ({ theme }) => {
  // State
  const [expenses, setExpenses] = useState(loadExpenses());
  const [categories, setCategories] = useState(loadCategories());
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().slice(0,10),
    category: '',
    description: '',
    amount: '',
    reference: '',
    paymentMethod: 'Transfer'
  });
  const [editingId, setEditingId] = useState(null);
  const [editExpense, setEditExpense] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errors, setErrors] = useState({});

  // Payment methods
  const paymentMethods = ['Transfer', 'Cash', 'Debit Card', 'Credit Card', 'E-Wallet'];

  // Save to localStorage when expenses or categories change
  useEffect(() => { saveExpenses(expenses); }, [expenses]);
  useEffect(() => { saveCategories(categories); }, [categories]);

  // Form validation
  const validateExpense = (expense) => {
    const errs = {};
    if (!expense.date) errs.date = 'Tanggal wajib diisi';
    if (!expense.category) errs.category = 'Kategori wajib dipilih';
    if (!expense.description.trim()) errs.description = 'Deskripsi wajib diisi';
    if (!expense.amount || isNaN(expense.amount) || Number(expense.amount) <= 0) errs.amount = 'Jumlah harus angka positif';
    if (!expense.paymentMethod) errs.paymentMethod = 'Metode pembayaran wajib dipilih';
    return errs;
  };

  // Add new expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const errs = validateExpense(newExpense);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const expense = {
      id: 'EXP-' + Date.now(),
      ...newExpense,
      amount: Number(newExpense.amount)
    };
    setExpenses([expense, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().slice(0,10),
      category: '',
      description: '',
      amount: '',
      reference: '',
      paymentMethod: 'Transfer'
    });
  };

  // Edit expense
  const handleEditExpense = (id) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditingId(id);
      setEditExpense({ ...expense });
    }
  };

  // Save edited expense
  const handleSaveEdit = () => {
    const errs = validateExpense(editExpense);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setExpenses(expenses.map(e => e.id === editingId ? { ...editExpense, amount: Number(editExpense.amount) } : e));
    setEditingId(null);
    setEditExpense({});
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditExpense({});
    setErrors({});
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
    setDeleteConfirm(null);
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchSearch = !q ||
        expense.description.toLowerCase().includes(q.toLowerCase()) ||
        expense.reference.toLowerCase().includes(q.toLowerCase()) ||
        expense.category.toLowerCase().includes(q.toLowerCase());

      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
      const matchPaymentMethod = selectedPaymentMethods.length === 0 || selectedPaymentMethods.includes(expense.paymentMethod);

      const expenseDate = new Date(expense.date);
      const matchStartDate = !startDate || expenseDate >= new Date(startDate);
      const matchEndDate = !endDate || expenseDate <= new Date(endDate);

      return matchSearch && matchCategory && matchPaymentMethod && matchStartDate && matchEndDate;
    });
  }, [expenses, q, selectedCategories, selectedPaymentMethods, startDate, endDate]);

  // Summary calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = filteredExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const largestExpense = monthlyExpenses.length > 0 ? Math.max(...monthlyExpenses.map(e => e.amount)) : 0;
  const dailyAverage = monthlyExpenses.length > 0 ? totalMonthlyExpenses / new Date(currentYear, currentMonth + 1, 0).getDate() : 0;

  // Chart data for expenses by category
  const categoryChartData = useMemo(() => {
    const categoryTotals = {};
    monthlyExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  }, [monthlyExpenses]);

  // Chart data for expense trends (daily for current month)
  const trendChartData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayExpenses = monthlyExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getDate() === day;
      });
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        day: day.toString(),
        amount: total
      };
    });
    return dailyTotals;
  }, [monthlyExpenses, currentMonth, currentYear]);

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <div className="text-sm font-bold" style={{ color: theme.accent }}>Total Pengeluaran Bulan Ini</div>
          <div className="text-2xl font-bold" style={{ color: theme.text }}>{formatRupiah(totalMonthlyExpenses)}</div>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <div className="text-sm font-bold" style={{ color: theme.accent }}>Pengeluaran Terbesar</div>
          <div className="text-2xl font-bold" style={{ color: theme.text }}>{formatRupiah(largestExpense)}</div>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <div className="text-sm font-bold" style={{ color: theme.accent }}>Rata-rata Harian</div>
          <div className="text-2xl font-bold" style={{ color: theme.text }}>{formatRupiah(dailyAverage)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Chart */}
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className="font-semibold mb-3" style={{ color: theme.text }}>Pengeluaran per Kategori</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`#404040`} />
              <XAxis dataKey="category" stroke={`#a3a3a3`} />
              <YAxis stroke={`#a3a3a3`} />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="amount" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Chart */}
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className="font-semibold mb-3" style={{ color: theme.text }}>Tren Pengeluaran Harian</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`#404040`} />
              <XAxis dataKey="day" stroke={`#a3a3a3`} />
              <YAxis stroke={`#a3a3a3`} />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add/Edit Expense Form */}
      <div className={`p-4 rounded-lg mb-6`} style={{ backgroundColor: theme.background }}>
        <h4 className="font-semibold mb-3" style={{ color: theme.text }}>
          {editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
        </h4>
        <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleAddExpense} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <input
              type="date"
              className={`w-full py-2 px-3 rounded-lg border ${errors.date ? 'border-red-500' : ''}`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: errors.date ? '#ef4444' : theme.special }}
              value={editingId ? editExpense.date : newExpense.date}
              onChange={(e) => editingId ? setEditExpense({...editExpense, date: e.target.value}) : setNewExpense({...newExpense, date: e.target.value})}
              required
            />
            {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
          </div>

          <div className="relative">
            <select
              className={`w-full py-2 px-3 rounded-lg border ${errors.category ? 'border-red-500' : ''}`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: errors.category ? '#ef4444' : theme.special }}
              value={editingId ? editExpense.category : newExpense.category}
              onChange={(e) => editingId ? setEditExpense({...editExpense, category: e.target.value}) : setNewExpense({...newExpense, category: e.target.value})}
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
            {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
          </div>

          <div className="md:col-span-2">
            <input
              className={`w-full py-2 px-3 rounded-lg border ${errors.description ? 'border-red-500' : ''}`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: errors.description ? '#ef4444' : theme.special }}
              placeholder="Deskripsi"
              value={editingId ? editExpense.description : newExpense.description}
              onChange={(e) => editingId ? setEditExpense({...editExpense, description: e.target.value}) : setNewExpense({...newExpense, description: e.target.value})}
              required
            />
            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
          </div>

          <div>
            <input
              className={`w-full py-2 px-3 rounded-lg border ${errors.amount ? 'border-red-500' : ''}`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: errors.amount ? '#ef4444' : theme.special }}
              placeholder="Jumlah (Rp)"
              value={editingId ? editExpense.amount : newExpense.amount}
              onChange={(e) => editingId ? setEditExpense({...editExpense, amount: e.target.value}) : setNewExpense({...newExpense, amount: e.target.value})}
              required
            />
            {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
          </div>

          <div>
            <select
              className={`w-full py-2 px-3 rounded-lg border ${errors.paymentMethod ? 'border-red-500' : ''}`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: errors.paymentMethod ? '#ef4444' : theme.special }}
              value={editingId ? editExpense.paymentMethod : newExpense.paymentMethod}
              onChange={(e) => editingId ? setEditExpense({...editExpense, paymentMethod: e.target.value}) : setNewExpense({...newExpense, paymentMethod: e.target.value})}
              required
            >
              {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
            </select>
            {errors.paymentMethod && <div className="text-red-500 text-xs mt-1">{errors.paymentMethod}</div>}
          </div>

          <div className="flex gap-2">
            {editingId ? (
              <>
                <button type="submit" className="py-2 px-3 rounded-lg font-bold flex items-center" style={{ backgroundColor: theme.accent, color: theme.background }}>
                  <Check size={16} className="mr-1" /> Simpan
                </button>
                <button type="button" onClick={handleCancelEdit} className="py-2 px-3 rounded-lg font-bold flex items-center" style={{ backgroundColor: '#6b7280', color: 'white' }}>
                  <X size={16} className="mr-1" /> Batal
                </button>
              </>
            ) : (
              <button type="submit" className="py-2 px-3 rounded-lg font-bold flex items-center" style={{ backgroundColor: theme.accent, color: theme.background }}>
                <Plus size={16} className="mr-1" /> Tambah
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4`} style={{ backgroundColor: theme.background }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Tambah Kategori Baru</h3>
            <input
              className="w-full py-2 px-3 rounded-lg border mb-4"
              style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }}
              placeholder="Nama kategori"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleAddCategory} className="py-2 px-4 rounded-lg font-bold" style={{ backgroundColor: theme.accent, color: theme.background }}>
                Tambah
              </button>
              <button onClick={() => { setShowAddCategory(false); setNewCategory(''); }} className="py-2 px-4 rounded-lg font-bold" style={{ backgroundColor: '#6b7280', color: 'white' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: theme.accent }} />
          <input
            className="w-full py-2 pl-10 pr-3 rounded-lg border"
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }}
            placeholder="Cari pengeluaran..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          className="py-2 px-3 rounded-lg border"
          style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }}
          value={selectedCategories.join(',')}
          onChange={(e) => setSelectedCategories(e.target.value ? e.target.value.split(',') : [])}
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select
          className="py-2 px-3 rounded-lg border"
          style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }}
          value={selectedPaymentMethods.join(',')}
          onChange={(e) => setSelectedPaymentMethods(e.target.value ? e.target.value.split(',') : [])}
        >
          <option value="">Semua Metode Pembayaran</option>
          {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            className="py-2 px-3 rounded-lg border"
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="py-2 px-3 rounded-lg border"
            style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full text-left`}>
          <thead>
            <tr className={`border-b`} style={{ borderColor: theme.special }}>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Kategori</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Deskripsi</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Referensi</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Metode Pembayaran</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jumlah</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className={`border-b`} style={{ borderColor: theme.special }}>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{expense.date}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{expense.category}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{expense.description}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{expense.reference || '-'}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{expense.paymentMethod}</td>
                <td className={`py-3 px-4 font-medium text-red-400`}>{formatRupiah(expense.amount)}</td>
                <td className={`py-3 px-4 font-medium`}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditExpense(expense.id)}
                      className="p-1 rounded hover:bg-blue-100"
                      style={{ color: '#3b82f6' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(expense.id)}
                      className="p-1 rounded hover:bg-red-100"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4`} style={{ backgroundColor: theme.background }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Konfirmasi Hapus</h3>
            <p className="mb-4" style={{ color: theme.text }}>Apakah Anda yakin ingin menghapus pengeluaran ini?</p>
            <div className="flex gap-2">
              <button onClick={() => handleDeleteExpense(deleteConfirm)} className="py-2 px-4 rounded-lg font-bold" style={{ backgroundColor: '#ef4444', color: 'white' }}>
                Hapus
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="py-2 px-4 rounded-lg font-bold" style={{ backgroundColor: '#6b7280', color: 'white' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengeluaranContent;
