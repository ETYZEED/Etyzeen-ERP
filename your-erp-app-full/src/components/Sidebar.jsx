import React, { useState, useEffect } from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart as BarChartIcon,
  Settings,
  Globe,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft,
  ClipboardList,
  Heart,
  Menu,
  X,
  ChevronDown,
  Building2,
  ShoppingBag,
} from 'lucide-react';

const Sidebar = ({ active, setActive, isSidebarOpen, setSidebarOpen, storeName, theme, storeLogo }) => {
  const [financeMenuOpen, setFinanceMenuOpen] = useState(false);
  const [salesMenuOpen, setSalesMenuOpen] = useState(false);

  useEffect(() => {
    if (active.startsWith('finance-')) {
      setFinanceMenuOpen(true);
    } else {
      setFinanceMenuOpen(false);
    }
    if (active.startsWith('sales-')) {
        setSalesMenuOpen(true);
    } else {
      setSalesMenuOpen(false);
    }
  }, [active]);

  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'dashboard', type: 'menu' },
    { name: 'Manajemen Stok', icon: Package, page: 'inventory', type: 'menu' },
    { name: 'Penjualan', icon: ShoppingBag, type: 'dropdown', isOpen: salesMenuOpen, toggle: () => setSalesMenuOpen(!salesMenuOpen) },
    { name: 'E-commerce', icon: Globe, page: 'sales-ecommerce', type: 'submenu', parent: 'sales' },
    { name: 'Toko Fisik', icon: Building2, page: 'sales-offline', type: 'submenu', parent: 'sales' },
    { name: 'Keuangan', icon: DollarSign, type: 'dropdown', isOpen: financeMenuOpen, toggle: () => setFinanceMenuOpen(!financeMenuOpen)},
    { name: 'Dashboard Keuangan', icon: Home, page: 'finance-dashboard', type: 'submenu', parent: 'finance' },
    { name: 'Pemasukan', icon: ArrowUpRight, page: 'finance-pemasukan', type: 'submenu', parent: 'finance' },
    { name: 'Pengeluaran', icon: ArrowDownLeft, page: 'finance-pengeluaran', type: 'submenu', parent: 'finance' },
    { name: 'Hutang Piutang', icon: ClipboardList, page: 'finance-payables', type: 'submenu', parent: 'finance' },
    { name: 'Saldo Kas', icon: Briefcase, page: 'finance-saldokas', type: 'submenu', parent: 'finance' },
    { name: 'Karyawan', icon: Users, page: 'employees', type: 'menu' },
    { name: 'CRM', icon: Heart, page: 'crm', type: 'menu' },
    { name: 'Laporan', icon: BarChartIcon, page: 'reports', type: 'menu' },
    { name: 'Integrasi', icon: Globe, page: 'integrations', type: 'menu' },
  ];

  const renderNavItems = () => {
    return navItems.map((item) => {
        if (item.type === 'dropdown') {
            return (
                <li key={item.name} className="mb-2">
                    <button
                        onClick={() => {
                            item.toggle();
                            if (!item.isOpen) {
                                // Navigate to the first submenu item when dropdown is opened
                                if (item.name === 'Penjualan') setActive('sales-ecommerce');
                                if (item.name === 'Keuangan') setActive('finance-dashboard');
                            }
                        }}
                        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 justify-between`}
                        style={{ backgroundColor: item.isOpen ? theme.secondary : 'transparent', color: active.startsWith(item.page) ? theme.text : theme.accent }}
                    >
                        <div className="flex items-center">
                            <item.icon className="mr-3" size={20} />
                            <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronDown size={16} className={`transform transition-transform ${item.isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </li>
            );
        } else if (item.type === 'submenu') {
            if ((item.parent === 'finance' && financeMenuOpen) || (item.parent === 'sales' && salesMenuOpen)) {
                return (
                    <li key={item.page} className="mb-2 ml-4">
                        <a
                            href="#"
                            onClick={() => {
                                setActive(item.page);
                                setSidebarOpen(false);
                            }}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200`}
                            style={{ backgroundColor: active === item.page ? theme.secondary : 'transparent', color: active === item.page ? theme.text : theme.accent }}
                        >
                            <item.icon className="mr-3" size={20} />
                            <span className="font-medium">{item.name}</span>
                        </a>
                    </li>
                );
            }
        } else {
            return (
                <li key={item.page} className="mb-2">
                    <a
                        href="#"
                        onClick={() => {
                            setActive(item.page);
                            setSidebarOpen(false); // Close sidebar after click on mobile
                        }}
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200`}
                        style={{ backgroundColor: active === item.page ? theme.secondary : 'transparent', color: active === item.page ? theme.text : theme.accent }}
                    >
                        <item.icon className="mr-3" size={20} />
                        <span className="font-medium">{item.name}</span>
                    </a>
                </li>
            );
        }
        return null;
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 p-6 flex flex-col z-50`} style={{ backgroundColor: theme.background }}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            {/* Logo, nama aplikasi, dan nomor versi */}
            <img src={storeLogo} alt="Logo Toko" className="w-10 h-10 rounded-full mr-3" />
            <div className="flex flex-col">
              <div className="flex items-center">
                <h1 className={`text-2xl font-bold`} style={{ color: theme.text }}>Etyzeen</h1>
                <span className={`text-sm font-semibold ml-1`} style={{ color: theme.accent }}>
                  ERP
                  {/* Logo 'Pro' */}
                  <span className={`bg-blue-500 text-white font-bold text-xs px-2 py-0.5 rounded-full ml-2`}>PRO</span>
                </span>
              </div>
              {/* Nomor versi */}
              <span className={`text-xs font-light`} style={{ color: theme.accent }}>v1.0.31</span>
            </div>
          </div>
          <button className={`md:hidden p-2 rounded-lg`} style={{ color: theme.accent, backgroundColor: theme.secondary }} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1">
          <ul>
            {renderNavItems()}
          </ul>
        </nav>
        <div className={`mt-auto pt-6 border-t`} style={{ borderColor: theme.special }}>
          <a
            href="#"
            onClick={() => setActive('settings')}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 mb-2`}
            style={{ backgroundColor: active === 'settings' ? theme.secondary : 'transparent', color: active === 'settings' ? theme.text : theme.accent }}
          >
            <Settings className="mr-3" size={20} />
            <span className="font-medium">Pengaturan</span>
          </a>
          <div className={`flex items-center p-3 rounded-lg hover:text-${theme.text} transition-colors duration-200`} style={{ color: theme.accent }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`}
              style={{ backgroundColor: theme.special }}>
              <span className={`font-semibold`} style={{ color: theme.text }}>U</span>
            </div>
            <span>{storeName}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;