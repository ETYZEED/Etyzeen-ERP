import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Search, Filter, RefreshCcw, Plus } from 'lucide-react';
import { ecommerceApiService } from '../utils/ecommerceApi';
import { formatRupiah } from '../utils/helpers';

const LS_KEY_MANUAL = 'income_manual_entries';

const loadManual = () => {
  try { const raw = localStorage.getItem(LS_KEY_MANUAL); return raw ? JSON.parse(raw) : []; } catch { return []; }
};

const saveManual = (arr) => { localStorage.setItem(LS_KEY_MANUAL, JSON.stringify(arr)); };

const PemasukanContent = ({ theme, offlineSales, ecommerceOrders, setEcommerceOrders }) => {
  // State
  const [income, setIncome] = useState([]); // unified rows
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualEntries, setManualEntries] = useState(loadManual());
  const [newIncome, setNewIncome] = useState({ date: new Date().toISOString().slice(0,10), description: '', customer: '', status: 'Lunas', amount: '' });
  const [syncedOrders, setSyncedOrders] = useState([]);

  // Fetch synced orders on mount
  useEffect(() => {
    const fetchSyncedOrders = async () => {
      try {
        const response = await ecommerceApiService.getOrders();
        if (response.data.success) {
          setSyncedOrders(response.data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch synced orders:', error);
      }
    };
    fetchSyncedOrders();
  }, []);

  // Transform existing app data into unified income rows
  useEffect(() => {
    const parseRupiah = (s) => Number(String(s).replace(/[^0-9]/g, '')) || 0;
    const rows = [];
    // Offline sales
    (offlineSales || []).forEach((s) => {
      rows.push({
        date: s.date,
        description: `Penjualan Offline - ${s.productName || ''}`.trim(),
        amount: parseRupiah(s.total),
        source: 'offline',
        status: s.status || 'Lunas',
        customer: s.customer || '-',
        transactionId: s.id || '-',
      });
    });
    // E-commerce orders (flatten statuses arrays)
    const eco = ecommerceOrders ? Object.values(ecommerceOrders).flat() : [];
    eco.forEach((o) => {
      rows.push({
        date: o.date,
        description: `Penjualan dari E-commerce - ${o.platform}`,
        amount: parseRupiah(o.total),
        source: 'ecommerce',
        status: o.status || 'Selesai',
        customer: o.customer || '-',
        transactionId: o.id || '-',
      });
    });
    // Synced e-commerce orders
    (syncedOrders || []).forEach((o) => {
      rows.push({
        date: o.date || new Date().toISOString().slice(0,10),
        description: `Penjualan dari ${o.platform} - ${o.productName || 'Produk'}`,
        amount: parseRupiah(o.total || o.amount || 0),
        source: 'ecommerce',
        status: o.status || 'Selesai',
        customer: o.customer || '-',
        transactionId: o.id || o.orderId || '-',
      });
    });
    // Manual entries
    (manualEntries || []).forEach((m) => {
      rows.push({
        date: m.date,
        description: m.description,
        amount: Number(m.amount) || 0,
        source: 'manual',
        status: m.status || 'Lunas',
        customer: m.customer || '-',
        transactionId: m.id || '-',
      });
    });
    setIncome(rows.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [offlineSales, ecommerceOrders, manualEntries, syncedOrders]);

  // Sync handler (calls backend to refresh platform data; front-end assumes server aggregates)
  const handleSync = async (platform = null) => {
    try {
      setLoading(true);
      await ecommerceApiService.sync(platform);
      // Fetch updated orders after sync
      const response = await ecommerceApiService.getOrders();
      if (response.data.success) {
        setSyncedOrders(response.data.orders);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal sinkronisasi. Pastikan server API berjalan di port 4000.');
    } finally {
      setLoading(false);
    }
  };

  // Filters and search
  const filtered = useMemo(() => {
    return income.filter((r) => {
      const matchSource = source === 'all' || r.source === source;
      const matchStatus = status === 'all' || (r.status || '').toLowerCase() === status.toLowerCase();
      const matchQ = !q || [r.transactionId, r.customer, r.description].some((v) => String(v).toLowerCase().includes(q.toLowerCase()));
      const d = new Date(r.date);
      const afterStart = !startDate || d >= new Date(startDate);
      const beforeEnd = !endDate || d <= new Date(endDate);
      return matchSource && matchStatus && matchQ && afterStart && beforeEnd;
    });
  }, [income, q, source, status, startDate, endDate]);

  // Summary
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalMonth = filtered
    .filter(r => new Date(r.date) >= monthStart)
    .reduce((s, r) => s + r.amount, 0);
  const totalEcommerce = filtered
    .filter(r => r.source === 'ecommerce' && new Date(r.date) >= monthStart)
    .reduce((s, r) => s + r.amount, 0);
  const totalOther = totalMonth - totalEcommerce;

  // Chart data by day (current month)
  const chartData = useMemo(() => {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const byDay = Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(today.getFullYear(), today.getMonth(), i + 1);
      const key = day.toISOString().slice(0,10);
      const sumAll = filtered.filter(r => r.date.slice(0,10) === key).reduce((s, r) => s + r.amount, 0);
      const sumEco = filtered.filter(r => r.source === 'ecommerce' && r.date.slice(0,10) === key).reduce((s, r) => s + r.amount, 0);
      return { date: key.slice(8,10), Total: sumAll, ECommerce: sumEco };
    });
    return byDay;
  }, [filtered]);

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      {/* Add Manual Income */}
      <div className={`p-4 rounded-lg mb-6`} style={{ backgroundColor: theme.background }}>
        <h4 className="font-semibold mb-3" style={{ color: theme.text }}>Tambah Pemasukan Manual</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newIncome.date || !newIncome.description || !newIncome.amount) return;
            const entry = { id: 'MAN-' + Date.now(), ...newIncome };
            const next = [entry, ...manualEntries];
            setManualEntries(next);
            saveManual(next);
            setNewIncome({ date: newIncome.date, description: '', customer: '', status: 'Lunas', amount: '' });
          }}
          className="grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          <input type="date" className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} required />
          <input className="py-2 px-3 rounded-lg border md:col-span-2" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} placeholder="Deskripsi" value={newIncome.description} onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })} required />
          <input className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} placeholder="Pelanggan (opsional)" value={newIncome.customer} onChange={(e) => setNewIncome({ ...newIncome, customer: e.target.value })} />
          <select className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} value={newIncome.status} onChange={(e) => setNewIncome({ ...newIncome, status: e.target.value })}>
            <option value="Lunas">Lunas</option>
            <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
            <option value="Diproses">Diproses</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
          <input className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} placeholder="Jumlah (Rp)" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} required />
          <button type="submit" className="py-2 px-3 rounded-lg font-bold" style={{ backgroundColor: theme.accent, color: theme.background }}>Tambah</button>
        </form>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <div className="text-sm font-bold" style={{ color: theme.accent }}>Total Pendapatan Bulan Ini</div>
          <div className="text-2xl font-bold" style={{ color: theme.text }}>{formatRupiah(totalMonth)}</div>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <div className="text-sm font-bold" style={{ color: theme.accent }}>Pendapatan E-commerce</div>
          <div className="text-2xl font-bold" style={{ color: theme.text }}>{formatRupiah(totalEcommerce)}</div>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <div className="text-sm font-bold" style={{ color: theme.accent }}>Pendapatan Lainnya</div>
          <div className="text-2xl font-bold" style={{ color: theme.text }}>{formatRupiah(totalOther)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className={`p-4 rounded-lg mb-6`} style={{ backgroundColor: theme.background }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold" style={{ color: theme.text }}>Tren Pendapatan Bulan Ini</h4>
          <button onClick={() => handleSync(null)} className="py-2 px-3 rounded-lg flex items-center font-semibold" style={{ backgroundColor: theme.accent, color: theme.background }} disabled={loading}>
            <RefreshCcw size={18} className="mr-2" /> {loading ? 'Sinkronisasi...' : 'Sinkronisasi'}
          </button>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <ResponsiveContainer width={1000} height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`#404040`} />
              <XAxis dataKey="date" stroke={`#a3a3a3`} />
              <YAxis stroke={`#a3a3a3`} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ECommerce" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: theme.accent }} />
          <input className="w-full py-2 pl-10 pr-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} placeholder="Cari (ID Transaksi, Pelanggan, Deskripsi)" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">Semua Sumber</option>
          <option value="ecommerce">E-commerce</option>
          <option value="offline">Penjualan Offline</option>
          <option value="manual">Manual</option>
        </select>
        <select className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="Lunas">Lunas</option>
          <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full text-left`}>
          <thead>
            <tr className={`border-b`} style={{ borderColor: theme.special }}>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Sumber</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Transaksi</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Deskripsi</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
              <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx} className={`border-b`} style={{ borderColor: theme.special }}>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{r.date}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{r.source === 'ecommerce' ? 'E-commerce' : r.source === 'offline' ? 'Penjualan Offline' : 'Manual'}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{r.transactionId}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{r.description}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{r.customer}</td>
                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{r.status}</td>
                <td className={`py-3 px-4 font-medium text-green-400`}>{formatRupiah(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PemasukanContent;