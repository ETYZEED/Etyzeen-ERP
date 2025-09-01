import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Layers,
  Settings,
} from 'lucide-react';

const AccountingSidebar = ({ active, setActive, isSidebarOpen, setSidebarOpen, theme }) => {
  const [financeMenuOpen, setFinanceMenuOpen] = useState(false);

  useEffect(() => {
    if (active.startsWith('finance-')) {
      setFinanceMenuOpen(true);
    } else {
      setFinanceMenuOpen(false);
    }
  }, [active]);

  const navItems = [
    { name: 'Hutang Piutang', icon: ClipboardList, page: 'finance-payables', type: 'submenu', parent: 'finance' },
    { name: 'Jurnal Penjualan', icon: ArrowUpRight, page: 'finance-journal-sales', type: 'submenu', parent: 'finance' },
    { name: 'Jurnal Pembelian', icon: ArrowDownLeft, page: 'finance-journal-purchases', type: 'submenu', parent: 'finance' },
    { name: 'Jurnal Bank', icon: Briefcase, page: 'finance-journal-bank', type: 'submenu', parent: 'finance' },
    { name: 'Jurnal Kas', icon: Briefcase, page: 'finance-journal-cash', type: 'submenu', parent: 'finance' },
    { name: 'Entri Jurnal', icon: ClipboardList, page: 'finance-journal-entries', type: 'submenu', parent: 'finance' },
    { name: 'Bagan Akun', icon: Layers, page: 'finance-chart-of-accounts', type: 'submenu', parent: 'finance' },
    { name: 'Rekonsiliasi Bank', icon: ClipboardList, page: 'finance-bank-reconciliation', type: 'submenu', parent: 'finance' },
    { name: 'Pajak', icon: DollarSign, page: 'finance-taxes', type: 'submenu', parent: 'finance' },
    { name: 'Aset Tetap', icon: DollarSign, page: 'finance-assets', type: 'submenu', parent: 'finance' },
    { name: 'Anggaran', icon: DollarSign, page: 'finance-budgeting', type: 'submenu', parent: 'finance' },
  ];

  const renderNavItems = () => {
    return navItems.map((item) => (
      <li key={item.page} className="mb-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
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
    ));
  };

  return (
    <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out w-64 p-6 flex flex-col z-50 max-h-screen`} style={{ backgroundColor: theme.background }}>
      <nav className="flex-1 overflow-y-auto sidebar-scroll">
        <ul>
          {renderNavItems()}
        </ul>
      </nav>
      <div className={`mt-auto pt-6 border-t flex-shrink-0`} style={{ borderColor: theme.special }}>
        <a
          href="#"
          onClick={() => setActive('settings')}
          className={`flex items-center p-3 rounded-lg transition-colors duration-200 mb-2`}
          style={{ backgroundColor: active === 'settings' ? theme.secondary : 'transparent', color: active === 'settings' ? theme.text : theme.accent }}
        >
          <Settings className="mr-3" size={20} />
          <span className="font-medium">Pengaturan</span>
        </a>
      </div>
    </div>
  );
};

export default AccountingSidebar;
