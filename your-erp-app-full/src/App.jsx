import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend, Sector, CartesianGrid, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Package,
  Wallet,
  ShoppingCart,
  Users,
  BarChart as BarChartIcon,
  Settings,
  ArrowRight,
  Menu,
  X,
  CreditCard,
  Building2,
  Globe,
  DollarSign,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  Info,
  Edit,
  Trash2,
  BellRing,
  Search,
  Filter,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  Heart,
  MoreVertical,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardContent from './pages/DashboardContent';
import InventoryContent from './pages/InventoryContent';
import SalesEcommerceContent from './pages/SalesEcommerceContent';
import SalesOfflineContent from './pages/SalesOfflineContent';
import EmployeesContent from './pages/EmployeesContent';
import CrmContent from './pages/CrmContent';
import ReportsContent from './pages/ReportsContent';
import IntegrationsContent from './pages/IntegrationsContent';
import SettingsContent from './pages/SettingsContent';
import FinanceDashboardContent from './pages/FinanceDashboardContent';
import PemasukanContent from './pages/PemasukanContent';
import PengeluaranContent from './pages/PengeluaranContent';
import HutangPiutangContent from './pages/HutangPiutangContent';
import SaldoKasContent from './pages/SaldoKasContent';
import { formatRupiah, themes } from './utils/helpers';

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

const initialInventoryItems = [
  { id: 1, name: 'Headphone Nirkabel', stock: 120, status: 'Aman', location: 'Gudang Pusat', reorderPoint: 50, serial: 'SN-001', category: 'Elektronik' },
  { id: 2, name: 'Smartwatch', stock: 25, status: 'Hampir Habis', location: 'Cabang Jakarta', reorderPoint: 30, serial: 'SN-002', category: 'Elektronik' },
  { id: 3, name: 'T-Shirt Cotton', stock: 5, status: 'Habis', location: 'Gudang Pusat', reorderPoint: 10, serial: 'SN-003', category: 'Pakaian' },
  { id: 4, name: 'Powerbank 10000mAh', stock: 80, status: 'Aman', location: 'Cabang Bandung', reorderPoint: 40, serial: 'SN-004', category: 'Elektronik' },
  { id: 5, name: 'Sepatu Lari', stock: 15, status: 'Hampir Habis', location: 'Gudang Pusat', reorderPoint: 20, serial: 'SN-005', category: 'Pakaian' },
  { id: 6, name: 'Kopi Bubuk Premium', stock: 200, status: 'Aman', location: 'Cabang Jakarta', reorderPoint: 100, serial: 'SN-006', category: 'Makanan' },
];

const salesByPlatformData = [
  { name: 'Tokopedia', value: 8700000, color: '#4CAF50' },
  { name: 'Shopee', value: 1200000, color: '#FF5722' },
  { name: 'Toko Fisik', value: 5250000, color: '#2196F3' },
  { name: 'TikTok', value: 5000000, color: '#69C9D0' },
];

const initialReceivables = [
  { id: 'INV002', customer: 'Siti Rahayu', amount: 'Rp 1.500.000', dueDate: '2024-07-20', status: 'Belum Dibayar', phone: '081234567890', account: '1234567890', dateCreated: '2024-07-20' },
  { id: 'INV003', customer: 'Agus Wijaya', amount: 'Rp 8.700.000', dueDate: '2024-07-25', status: 'Lunas', phone: '081211223344', account: '9876543210', dateCreated: '2024-07-25' },
];

const initialPayables = [
  { id: 'SUP001', supplier: 'PT. Elektronik Jaya', amount: 'Rp 12.000.000', dueDate: '2024-08-25', status: 'Mendekati Jatuh Tempo', phone: '089876543210', account: '0987654321', dateCreated: '2024-08-15' },
];

const bestSellingProducts = [
  { name: 'Headphone Nirkabel', sales: 1500, profit: 'Rp 10.000.000' },
  { name: 'Smartwatch', sales: 1200, profit: 'Rp 8.500.000' },
  { name: 'Powerbank 10000mAh', sales: 900, profit: 'Rp 5.000.000' },
];

const employeesList = [
  { id: 1, name: 'Dewi Lestari', role: 'Manajer Penjualan', phone: '081234567890', salary: 'Rp 10.000.000' },
  { id: 2, name: 'Fandi Ahmad', role: 'Staff Gudang', phone: '081234567891', salary: 'Rp 5.000.000' },
  { id: 3, name: 'Rina Utami', role: 'Staf Keuangan', phone: '081234567892', salary: 'Rp 6.500.000' },
];

const customerList = [
  { id: 1, name: 'Budi Santoso', company: 'PT. Maju Jaya' },
  { id: 2, name: 'Siti Rahayu', company: 'CV. Sejahtera' },
  { id: 3, name: 'Agus Wijaya', company: 'Toko Makmur' },
];

const initialOfflineSales = [
  { id: 'FISIK001', customer: 'Rini', date: '2024-07-28', total: 'Rp 120.000', status: 'Lunas', productName: 'Headphone Nirkabel' },
  { id: 'FISIK002', customer: 'Toko Bunga', date: '2024-07-27', total: 'Rp 500.000', status: 'Lunas', productName: 'Smartwatch' },
  { id: 'FISIK003', customer: 'Ahmad', date: '2024-07-28', total: 'Rp 250.000', status: 'Lunas', productName: 'T-Shirt Cotton' },
];

const initialEcommerceOrders = {
  dikemas: [
    { id: 'ECOM-001', customer: 'Ani Susanti', date: '2024-07-28', total: 'Rp 250.000', platform: 'Tokopedia', productName: 'Headphone Nirkabel' },
    { id: 'ECOM-005', customer: 'Bambang', date: '2024-07-28', total: 'Rp 150.000', platform: 'Shopee', productName: 'T-Shirt Cotton' },
  ],
  dikirim: [
    { id: 'ECOM-002', customer: 'Budi Santoso', date: '2024-07-27', total: 'Rp 500.000', platform: 'Tokopedia', shippingId: 'JP-1234567', productName: 'Powerbank 10000mAh' },
  ],
  selesai: [
    { id: 'ECOM-003', customer: 'Siti Rahayu', date: '2024-07-20', total: 'Rp 1.500.000', platform: 'Shopee', productName: 'Sepatu Lari' },
  ],
  pengembalian: [
    { id: 'ECOM-004', customer: 'Joko Widodo', date: '2022-07-19', total: 'Rp 300.000', platform: 'Tokopedia', reason: 'Barang Rusak', productName: 'Kopi Bubuk Premium' },
  ]
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [storeName, setStoreName] = useState('User Name');
  const [storeLogo, setStoreLogo] = useState('https://iili.io/KHo0y7f.md.png');
  const [receivablesList, setReceivablesList] = useState(initialReceivables);
  const [payablesList, setPayablesList] = useState(initialPayables);
  const [offlineSales, setOfflineSales] = useState(initialOfflineSales);
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [ecommerceOrders, setEcommerceOrders] = useState(initialEcommerceOrders);

  // Load theme from localStorage on initial render
  const savedTheme = JSON.parse(localStorage.getItem('theme'));
  const [theme, setTheme] = useState(savedTheme || themes[0]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  // Fungsi untuk menangani update stok
  const handleInventoryUpdate = (productName, quantitySold) => {
    setInventoryItems(prevItems => {
        return prevItems.map(item => {
            if (item.name.toLowerCase() === productName.toLowerCase()) {
                const newStock = item.stock - quantitySold;
                const newStatus = newStock <= item.reorderPoint ? (newStock <= 0 ? 'Habis' : 'Hampir Habis') : 'Aman';

                return { ...item, stock: newStock, status: newStatus };
            }
            return item;
        });
    });
  };

  // Fungsi untuk menangani penjualan offline
  const handleOfflineSaleAdded = (newSale) => {
    setOfflineSales(prevSales => [...prevSales, newSale]);
    // Asumsi 1 produk terjual per transaksi untuk demo
    handleInventoryUpdate(newSale.productName, 1);
  };

  // Fungsi untuk menangani pengiriman pesanan e-commerce
  const handleOrderShipped = (order) => {
    // Asumsi 1 produk terjual per order untuk demo
    // Nama produk tidak ada di data ecommerce, jadi ini hanya simulasi
    // Di aplikasi nyata, Anda akan mencari nama produk dari data order
    // Untuk demo, kita akan kurangi stok dari produk pertama
    const productForSale = inventoryItems[0].name;
    handleInventoryUpdate(productForSale, 1);
  };

  const getFinancialDataByFilter = useCallback((filter, sales, orders) => {
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

    const filteredOfflineSales = filterDataByDate(sales);
    const filteredEcomOrders = filterDataByDate(Object.values(orders).flat());
    
    const totalRevenue = filteredOfflineSales.reduce((sum, sale) => sum + parseRupiah(sale.total), 0) + 
                         filteredEcomOrders.reduce((sum, order) => sum + parseRupiah(order.total), 0);
    // Perbaikan: Asumsi pengeluaran statis untuk demo
    const totalExpenses = financeData.reduce((sum, item) => sum + item.Pengeluaran, 0);

    return {
      revenue: formatRupiah(totalRevenue),
      expenses: formatRupiah(totalExpenses),
      profit: formatRupiah(totalRevenue - totalExpenses),
      cash: formatRupiah(50000000), // Angka statis untuk demo
    };
  }, []);

  const lowStockItems = inventoryItems.filter(item => item.stock < item.reorderPoint);

  const renderContent = () => {
    const financialSummary = getFinancialDataByFilter('bulan_ini', offlineSales, ecommerceOrders);
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent theme={theme} allSales={offlineSales} allOrders={ecommerceOrders} salesByPlatformData={salesByPlatformData} bestSellingProducts={bestSellingProducts} receivables={receivablesList} payables={payablesList} setActivePage={setActivePage} lowStockItems={lowStockItems} />;
      case 'inventory':
        return <InventoryContent theme={theme} bestSellingProducts={bestSellingProducts} inventoryItems={inventoryItems} setInventoryItems={setInventoryItems} />;
      case 'sales-ecommerce':
        return <SalesEcommerceContent theme={theme} ecommerceOrders={ecommerceOrders} setEcommerceOrders={setEcommerceOrders} onOrderShipped={handleOrderShipped} />;
      case 'sales-offline':
        return <SalesOfflineContent theme={theme} offlineSales={offlineSales} setOfflineSales={setOfflineSales} onSaleAdded={handleOfflineSaleAdded} />;
      case 'employees':
        return <EmployeesContent theme={theme} employeesList={employeesList} />;
      case 'crm':
        return <CrmContent theme={theme} customerList={customerList} />;
      case 'reports':
        return <ReportsContent theme={theme} />;
      case 'integrations':
        return <IntegrationsContent theme={theme} />;
      case 'settings':
        return <SettingsContent 
          theme={theme} setTheme={setTheme} setStoreLogo={setStoreLogo}
        />;
      case 'finance-dashboard':
        return <FinanceDashboardContent theme={theme} financialSummary={financialSummary} />;
      case 'finance-pemasukan':
        return <PemasukanContent theme={theme} />;
      case 'finance-pengeluaran':
        return <PengeluaranContent theme={theme} />;
      case 'finance-payables':
        return <HutangPiutangContent 
          theme={theme} 
          receivables={receivablesList} 
          payables={payablesList}
          setReceivablesList={setReceivablesList}
          setPayablesList={setPayablesList}
        />;
      case 'finance-saldokas':
        return <SaldoKasContent theme={theme} financialSummary={financialSummary} />;
      default:
        return <DashboardContent theme={theme} allSales={offlineSales} allOrders={ecommerceOrders} salesByPlatformData={salesByPlatformData} bestSellingProducts={bestSellingProducts} receivables={receivablesList} payables={payablesList} setActivePage={setActivePage} lowStockItems={lowStockItems} />;
    }
  };

  return (
    <div className={`flex min-h-screen font-sans antialiased`} style={{ backgroundColor: theme.background, color: theme.text }}>
      {/* Sidebar */}
      <Sidebar active={activePage} setActive={setActivePage} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} storeName={storeName} theme={theme} storeLogo={storeLogo} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 md:p-8">
        {/* Header for mobile */}
        <div className={`sticky top-0 pb-4 mb-4 md:hidden flex items-center justify-between z-30`} style={{ backgroundColor: theme.background }}>
          <div className="flex items-center">
            {/* Logo, nama aplikasi, dan nomor versi untuk mobile */}
            <div className="flex items-center">
              <img src={storeLogo} alt="Logo Toko" className="w-10 h-10 rounded-full mr-3" />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <h1 className={`text-2xl font-bold`} style={{ color: theme.text }}>Etyzeen</h1>
                  <span className={`text-sm font-semibold ml-1`} style={{ color: theme.accent }}>
                    ERP
                    <span className={`bg-blue-500 text-white font-bold text-xs px-2 py-0.5 rounded-full ml-2`}>PRO</span>
                  </span>
                </div>
                <span className={`text-xs font-light`} style={{ color: theme.accent }}>v1.0.31</span>
              </div>
            </div>
          </div>
          <button className={`p-2 rounded-lg`} style={{ color: theme.accent, backgroundColor: theme.secondary }} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        <header className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold capitalize`} style={{ color: theme.text }}>
            {activePage === 'dashboard' ? 'Dashboard' : activePage === 'inventory' ? 'Manajemen Stok' : activePage === 'finance-dashboard' ? 'Dashboard Keuangan' : activePage === 'finance-pemasukan' ? 'Pemasukan' : activePage === 'finance-pengeluaran' ? 'Pengeluaran' : activePage === 'finance-payables' ? 'Hutang Piutang' : activePage === 'finance-saldokas' ? 'Saldo Kas' : activePage === 'sales-ecommerce' ? 'E-commerce' : activePage === 'sales-offline' ? 'Toko Fisik' : activePage}
          </h1>
          <div className="hidden md:flex items-center space-x-4">
            <span className={`text-sm font-medium`} style={{ color: theme.accent }}>Selamat datang, {storeName}!</span>
          </div>
        </header>

        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}