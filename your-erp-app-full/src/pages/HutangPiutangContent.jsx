import React, { useState, useEffect, useMemo } from 'react';
import {
  MoreVertical,
  Info,
  Edit,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

const HutangPiutangContent = ({ theme, receivables, payables, setReceivablesList, setPayablesList }) => {
  const [newTransaction, setNewTransaction] = useState({
    type: 'receivable',
    name: '',
    phone: '',
    amount: '',
    account: '',
    dueDate: ''
  });
  const [detailModal, setDetailModal] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [editData, setEditData] = useState(null);
  const [searchTermPiutang, setSearchTermPiutang] = useState('');
  const [filterStatusPiutang, setFilterStatusPiutang] = useState('all');
  const [searchTermUtang, setSearchTermUtang] = useState('');
  const [filterStatusUtang, setFilterStatusUtang] = useState('all');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };
  
  const formatTanggal = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (newTransaction.name && newTransaction.amount) {
      const today = new Date().toISOString().split('T')[0];
      const newTransactionData = {
        id: newTransaction.type === 'receivable' ? `INV${Math.floor(Math.random() * 10000)}` : `SUP${Math.floor(Math.random() * 10000)}`,
        customer: newTransaction.type === 'receivable' ? newTransaction.name : '',
        supplier: newTransaction.type === 'payable' ? newTransaction.name : '',
        phone: newTransaction.phone || 'Tidak ada',
        amount: formatRupiah(newTransaction.amount),
        account: newTransaction.account || 'Tidak ada',
        dueDate: newTransaction.dueDate || today,
        status: 'Belum Dibayar',
        dateCreated: today,
      };
      if (newTransaction.type === 'receivable') {
        setReceivablesList([...receivables, newTransactionData]);
      } else {
        setPayablesList([...payables, newTransactionData]);
      }
      setNewTransaction({
        type: 'receivable',
        name: '',
        phone: '',
        amount: '',
        account: '',
        dueDate: ''
      });
    } else {
      // Menggunakan modal UI kustom daripada alert
      alert("Nama dan Jumlah wajib diisi.");
    }
  };

  const handleDelete = (id, type) => {
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi ini?`)) {
      if (type === 'receivable') {
        setReceivablesList(receivables.filter(item => item.id !== id));
      } else {
        setPayablesList(payables.filter(item => item.id !== id));
      }
    }
    setActionMenu(null);
  };

  const handleUpdateStatus = (id, newStatus, type) => {
    if (type === 'receivable') {
      setReceivablesList(receivables.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } else {
      setPayablesList(payables.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
    setActionMenu(null);
  };

  const handleEdit = (item) => {
    setEditData({ ...item, type: item.id.includes('INV') ? 'receivable' : 'payable' });
    setNewTransaction({
      type: item.id.includes('INV') ? 'receivable' : 'payable',
      name: item.id.includes('INV') ? item.customer : item.supplier,
      phone: item.phone || '',
      amount: parseFloat(item.amount.replace(/[^0-9]/g, '')),
      account: item.account || '',
      dueDate: item.dueDate || ''
    });
    setActionMenu(null);
  };

  const handleUpdateTransaction = (e) => {
    e.preventDefault();
    if (editData && newTransaction.name && newTransaction.amount) {
      if (editData.type === 'receivable') {
        setReceivablesList(receivables.map(item => item.id === editData.id ? {
          ...item,
          customer: newTransaction.name,
          amount: formatRupiah(newTransaction.amount),
          dueDate: newTransaction.dueDate,
          phone: newTransaction.phone,
          account: newTransaction.account
        } : item));
      } else {
        setPayablesList(payables.map(item => item.id === editData.id ? {
          ...item,
          supplier: newTransaction.name,
          amount: formatRupiah(newTransaction.amount),
          dueDate: newTransaction.dueDate,
          phone: newTransaction.phone,
          account: newTransaction.account
        } : item));
      }
      setEditData(null);
      setNewTransaction({ type: 'receivable', name: '', phone: '', amount: '', account: '', dueDate: '' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Lunas': return 'text-green-400';
      case 'Mendekati Jatuh Tempo': return 'text-yellow-400';
      case 'Belum Dibayar':
      default: return 'text-red-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case 'Lunas': return 'bg-green-500/20';
      case 'Mendekati Jatuh Tempo': return 'bg-yellow-500/20';
      case 'Belum Dibayar':
      default: return 'bg-red-500/20';
    }
  };

  useEffect(() => {
    const updateStatuses = () => {
        const today = new Date().toISOString().split('T')[0];
        const newReceivables = receivables.map(item => {
            if (item.dueDate && new Date(item.dueDate) < new Date(today) && item.status !== 'Lunas') {
                return { ...item, status: 'Mendekati Jatuh Tempo' };
            }
            return item;
        });

        const newPayables = payables.map(item => {
            if (item.dueDate && new Date(item.dueDate) < new Date(today) && item.status !== 'Lunas') {
                return { ...item, status: 'Mendekati Jatuh Tempo' };
            }
            return item;
        });

        if (JSON.stringify(newReceivables) !== JSON.stringify(receivables)) {
            setReceivablesList(newReceivables);
        }
        if (JSON.stringify(newPayables) !== JSON.stringify(payables)) {
            setPayablesList(newPayables);
        }
    };

    updateStatuses();
  }, [receivables, payables, setReceivablesList, setPayablesList]);

  const filteredReceivables = receivables.filter(item => {
    const matchesSearch = (item.customer && item.customer.toLowerCase().includes(searchTermPiutang.toLowerCase()));
    const matchesStatus = filterStatusPiutang === 'all' || item.status === filterStatusPiutang;
    return matchesSearch && matchesStatus;
  });

  const filteredPayables = payables.filter(item => {
    const matchesSearch = (item.supplier && item.supplier.toLowerCase().includes(searchTermUtang.toLowerCase()));
    const matchesStatus = filterStatusUtang === 'all' || item.status === filterStatusUtang;
    return matchesSearch && matchesStatus;
  });

  const downloadCsv = (data, filename) => {
    let csvContent = "";
    data.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadXls = (type) => {
    let header = [];
    let data = [];
    let fileName = '';

    if (type === 'receivable') {
      header = ["ID Faktur", "Pelanggan", "Jumlah", "Jatuh Tempo", "Status", "Nomor Telepon", "Nomor Rekening"];
      data = filteredReceivables.map(item => [
        item.id,
        item.customer,
        item.amount,
        item.dueDate,
        item.status,
        item.phone,
        item.account
      ]);
      fileName = 'Laporan_Piutang.csv';
      downloadCsv([header, ...data], fileName);
    } else if (type === 'payable') {
      header = ["ID Supplier", "Supplier", "Jumlah", "Jatuh Tempo", "Status", "Nomor Telepon", "Nomor Rekening"];
      data = filteredPayables.map(item => [
        item.id,
        item.supplier,
        item.amount,
        item.dueDate,
        item.status,
        item.phone,
        item.account
      ]);
      fileName = 'Laporan_Utang.csv';
      downloadCsv([header, ...data], fileName);
    } else if (type === 'all') {
        const receivablesData = filteredReceivables.map(item => [item.id, item.customer, item.amount, item.dueDate, item.status, item.phone, item.account]);
        const payablesData = filteredPayables.map(item => [item.id, item.supplier, item.amount, item.dueDate, item.status, item.phone, item.account]);
        
        let allData = [];
        allData.push(['Laporan Piutang']);
        allData.push(["ID Faktur", "Pelanggan", "Jumlah", "Jatuh Tempo", "Status", "Nomor Telepon", "Nomor Rekening"]);
        allData.push(...receivablesData);
        allData.push([]);
        allData.push(['Utang']);
        allData.push(["ID Supplier", "Supplier", "Jumlah", "Jatuh Tempo", "Status", "Nomor Telepon", "Nomor Rekening"]);
        allData.push(...payablesData);
        fileName = 'Laporan_Utang_Piutang.csv';
        downloadCsv(allData, fileName);
    }
  };

  const latestReceivables = useMemo(() => {
    return receivables.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 5);
  }, [receivables]);

  const latestPayables = useMemo(() => {
    return payables.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 5);
  }, [payables]);

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Hutang Piutang</h2>
      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-lg w-full max-w-md`} style={{ backgroundColor: theme.background }}>
            <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Detail {detailModal.id.includes('INV') ? 'Piutang' : 'Utang'}</h3>
            <div className="space-y-2">
              <p className={`font-semibold`} style={{ color: theme.accent }}>Nama: <span style={{ color: theme.text }}>{detailModal.id.includes('INV') ? detailModal.customer : detailModal.supplier}</span></p>
              <p className={`font-semibold`} style={{ color: theme.accent }}>Jumlah: <span style={{ color: theme.text }}>{detailModal.amount}</span></p>
              <p className={`font-semibold`} style={{ color: theme.accent }}>Jatuh Tempo: <span style={{ color: theme.text }}>{formatTanggal(detailModal.dueDate)}</span></p>
              <p className={`font-semibold`} style={{ color: theme.accent }}>Status: <span style={{ color: theme.text }}>{detailModal.status}</span></p>
              <p className={`font-semibold`} style={{ color: theme.accent }}>Nomor Telepon: <span style={{ color: theme.text }}>{detailModal.phone || 'Tidak ada'}</span></p>
              <p className={`font-semibold`} style={{ color: theme.accent }}>Nomor Rekening: <span style={{ color: theme.text }}>{detailModal.account || 'Tidak ada'}</span></p>
            </div>
            <button onClick={() => setDetailModal(null)} className={`mt-6 bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-neutral-700 transition-colors duration-200`}>Tutup</button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Tambah Piutang/Utang</h3>
        <form onSubmit={editData ? handleUpdateTransaction : handleAddTransaction} className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.background }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <label className={`font-semibold`} style={{ color: theme.accent }} htmlFor="transaction-type">Tipe Transaksi</label>
              <select
                id="transaction-type"
                name="type"
                value={newTransaction.type}
                onChange={handleInputChange}
                className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                disabled={!!editData}
              >
                <option value="receivable">Piutang</option>
                <option value="payable">Utang</option>
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className={`font-semibold`} style={{ color: theme.accent }} htmlFor="name">Nama</label>
              <input
                id="name"
                type="text"
                name="name"
                value={newTransaction.name}
                onChange={handleInputChange}
                className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                placeholder={newTransaction.type === 'receivable' ? "Nama Pelanggan" : "Nama Supplier"}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className={`font-semibold`} style={{ color: theme.accent }} htmlFor="phone">Nomor Telepon (Opsional)</label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={newTransaction.phone}
                onChange={handleInputChange}
                className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                placeholder="0812..."
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className={`font-semibold`} style={{ color: theme.accent }} htmlFor="amount">Jumlah</label>
              <input
                id="amount"
                type="text"
                name="amount"
                value={newTransaction.amount}
                onChange={(e) => {
                   const rawValue = e.target.value.replace(/[^0-9]/g, '');
                   setNewTransaction({ ...newTransaction, amount: rawValue });
                }}
                onBlur={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  setNewTransaction({ ...newTransaction, amount: formatRupiah(rawValue) });
                }}
                onFocus={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  setNewTransaction({ ...newTransaction, amount: rawValue });
                }}
                className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                placeholder="Rp 0"
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className={`font-semibold`} style={{ color: theme.accent }} htmlFor="account">Nomor Rekening (Opsional)</label>
              <input
                id="account"
                type="text"
                name="account"
                value={newTransaction.account}
                onChange={handleInputChange}
                className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                placeholder="Nomor Rekening"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className={`font-semibold`} style={{ color: theme.accent }} htmlFor="due-date">Jatuh Tempo</label>
              <input
                id="due-date"
                type="date"
                name="dueDate"
                value={newTransaction.dueDate}
                onChange={handleInputChange}
                className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={`mt-6 w-full font-bold py-2 px-4 rounded-lg transition-colors duration-200`}
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            {editData ? 'Update Transaksi' : 'Tambah Transaksi'}
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Daftar Piutang</h3>
        <div className="relative mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-center">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
            <input
              type="text"
              placeholder="Cari Piutang..."
              onChange={(e) => setSearchTermPiutang(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
            />
          </div>
          <div className="relative flex-1 w-full md:w-auto">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
            <select
              value={filterStatusPiutang}
              onChange={(e) => setFilterStatusPiutang(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
            >
              <option value="all" style={{ backgroundColor: theme.secondary }}>Semua Status</option>
              <option value="Belum Dibayar" style={{ backgroundColor: theme.secondary }}>Belum Dibayar</option>
              <option value="Lunas" style={{ backgroundColor: theme.secondary }}>Lunas</option>
              <option value="Mendekati Jatuh Tempo" style={{ backgroundColor: theme.secondary }}>Mendekati Jatuh Tempo</option>
            </select>
          </div>
          <button
            onClick={() => handleDownloadXls('receivable')}
            className={`w-full md:w-auto font-semibold py-2 px-4 rounded-lg transition-colors duration-200`}
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            Unduh Laporan Piutang
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full text-left`}>
            <thead>
              <tr className={`border-b`} style={{ borderColor: theme.special }}>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Faktur</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jumlah</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivables.map((item, index) => (
                <tr key={item.id} className={`border-b last:border-b-0`} style={{ borderColor: theme.special }}>
                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{item.dateCreated}</td>
                  <td className={`py-3 px-4 font-medium cursor-pointer hover:underline`} style={{ color: theme.text }} onClick={() => setDetailModal(item)}>
                    {item.id}
                  </td>
                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{item.customer}</td>
                  <td className={`py-3 px-4 font-medium text-green-400`}>{item.amount}</td>
                  <td className="py-3 px-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold`} style={{ backgroundColor: getStatusBgColor(item.status), color: getStatusColor(item.status) }}>
                          {item.status}
                      </div>
                  </td>
                  <td className="py-3 px-4 relative">
                    <button onClick={() => setActionMenu(actionMenu === `receivable-${index}` ? null : `receivable-${index}`)} style={{ color: theme.text }}>
                      <MoreVertical size={20} />
                    </button>
                    {actionMenu === `receivable-${index}` && (
                      <div className={`absolute right-4 shadow-lg rounded-md z-10 w-32`} style={{ backgroundColor: theme.background }}>
                        <button onClick={() => setDetailModal(item)} className={`flex items-center px-4 py-2 text-sm hover:bg-neutral-800 w-full text-left`} style={{ color: theme.text }}>
                          <Info size={16} className="mr-2" /> Info
                        </button>
                        <button onClick={() => handleEdit(item)} className={`flex items-center px-4 py-2 text-sm hover:bg-neutral-800 w-full text-left`} style={{ color: theme.text }}>
                          <Edit size={16} className="mr-2" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id, 'receivable')} className={`flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/20 w-full text-left`}>
                          <Trash2 size={16} className="mr-2" /> Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Daftar Utang</h3>
        <div className="relative mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-center">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
            <input
              type="text"
              placeholder="Cari Utang..."
              onChange={(e) => setSearchTermUtang(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
            />
          </div>
          <div className="relative flex-1 w-full md:w-auto">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
            <select
              value={filterStatusUtang}
              onChange={(e) => setFilterStatusUtang(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
            >
              <option value="all">Semua Status</option>
              <option value="Belum Dibayar">Belum Dibayar</option>
              <option value="Lunas">Lunas</option>
              <option value="Mendekati Jatuh Tempo">Mendekati Jatuh Tempo</option>
            </select>
          </div>
           <button
            onClick={() => handleDownloadXls('payable')}
            className={`w-full md:w-auto font-semibold py-2 px-4 rounded-lg transition-colors duration-200`}
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            Unduh Laporan Utang
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full text-left`}>
            <thead>
              <tr className={`border-b`} style={{ borderColor: theme.special }}>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Supplier</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jumlah</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jatuh Tempo</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayables.map((item, index) => (
                <tr key={item.id} className={`border-b last:border-b-0`}
                  style={{ borderColor: theme.special }}>
                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{item.dateCreated}</td>
                  <td className={`py-3 px-4 font-medium cursor-pointer hover:underline`} style={{ color: theme.text }} onClick={() => setDetailModal(item)}>
                    {item.supplier}
                  </td>
                  <td className={`py-3 px-4 font-medium text-red-400`}>{item.amount}</td>
                  <td className={`py-3 px-4 font-medium`} style={{ color: getStatusColor(item.status) }}>{formatTanggal(item.dueDate)}</td>
                  <td className="py-3 px-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold`} style={{ backgroundColor: getStatusBgColor(item.status), color: getStatusColor(item.status) }}>
                          {item.status}
                      </div>
                  </td>
                  <td className="py-3 px-4 relative">
                    <button onClick={() => setActionMenu(actionMenu === `payable-${index}` ? null : `payable-${index}`)} style={{ color: theme.text }}>
                      <MoreVertical size={20} />
                    </button>
                    {actionMenu === `payable-${index}` && (
                      <div className={`absolute right-4 shadow-lg rounded-md z-10 w-32`} style={{ backgroundColor: theme.background }}>
                        <button onClick={() => setDetailModal(item)} className={`flex items-center px-4 py-2 text-sm hover:bg-neutral-800 w-full text-left`} style={{ color: theme.text }}>
                          <Info size={16} className="mr-2" /> Info
                        </button>
                        <button onClick={() => handleEdit(item)} className={`flex items-center px-4 py-2 text-sm hover:bg-neutral-800 w-full text-left`} style={{ color: theme.text }}>
                          <Edit size={16} className="mr-2" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id, 'payable')} className={`flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/20 w-full text-left`}>
                          <Trash2 size={16} className="mr-2" /> Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HutangPiutangContent;