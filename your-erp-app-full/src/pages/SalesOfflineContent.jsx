import React, { useState } from 'react';
import { formatRupiah } from '../utils/helpers';

const SalesOfflineContent = ({ theme, offlineSales, setOfflineSales, onSaleAdded }) => {
    const [newSale, setNewSale] = useState({ productName: '', customer: '', date: '', total: '', status: 'Lunas' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSale({ ...newSale, [name]: value });
    };

    const handleAddSale = (e) => {
        e.preventDefault();
        if (newSale.customer && newSale.total && newSale.productName) {
            const formattedDate = new Date().toISOString().slice(0, 10);
            const newOfflineSale = {
                id: `FISIK${Math.floor(Math.random() * 10000)}`,
                productName: newSale.productName, // New field for product name
                customer: newSale.customer,
                date: formattedDate,
                total: formatRupiah(newSale.total),
                status: newSale.status,
                platform: 'Toko Fisik'
            };
            setOfflineSales(prevSales => [...prevSales, newOfflineSale]);
            onSaleAdded(newOfflineSale); // Call the parent function to update inventory
            setNewSale({ productName: '', customer: '', date: '', total: '', status: 'Lunas' });
        } else {
            alert('Nama pelanggan, produk, dan total wajib diisi.');
        }
    };

    return (
        <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
            <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Manajemen Penjualan Toko Fisik</h2>
            
            <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ backgroundColor: theme.background }}>
                <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Tambah Penjualan Baru</h3>
                <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="productName"
                        value={newSale.productName}
                        onChange={handleInputChange}
                        placeholder="Nama Produk Terjual"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="text"
                        name="customer"
                        value={newSale.customer}
                        onChange={handleInputChange}
                        placeholder="Nama Pelanggan"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="number"
                        name="total"
                        value={newSale.total}
                        onChange={handleInputChange}
                        placeholder="Total Penjualan (contoh: 120000)"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={newSale.date}
                        onChange={handleInputChange}
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                    />
                    <select
                        name="status"
                        value={newSale.status}
                        onChange={handleInputChange}
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                    >
                        <option value="Lunas">Lunas</option>
                        <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                    <button type="submit" className={`mt-2 md:col-span-2 font-bold py-2 px-4 rounded-lg transition-colors duration-200`}
                        style={{ backgroundColor: theme.accent, color: theme.background }}>
                        Tambah Penjualan
                    </button>
                </form>
            </div>
            
            <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Daftar transaksi penjualan dari toko fisik.</p>
            <div className="overflow-x-auto">
                <table className={`min-w-full text-left`}>
                    <thead>
                    <tr className={`border-b`} style={{ borderColor: theme.special }}>
                        <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Faktur</th>
                        <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
                        <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal</th>
                        <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Total</th>
                        <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {offlineSales.map((invoice) => (
                        <tr key={invoice.id} className={`border-b last:border-b-0`} style={{ borderColor: theme.special }}>
                            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{invoice.id}</td>
                            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{invoice.customer}</td>
                            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{invoice.date}</td>
                            <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{invoice.total}</td>
                            <td className="py-3 px-4">
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    invoice.status === 'Lunas' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {invoice.status}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesOfflineContent;