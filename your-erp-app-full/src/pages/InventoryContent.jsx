import React, { useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  Package,
  Search,
  Filter,
  Layers,
} from 'lucide-react';
import { CustomTooltipPie, ActivePieShape } from '../components/SharedComponents';
import { formatRupiah } from '../utils/helpers';

const InventoryContent = ({ theme, bestSellingProducts, inventoryItems, setInventoryItems }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [addProductForm, setAddProductForm] = useState({ name: '', stock: '', reorderPoint: '', location: '', category: '' });
  const [activeIndexStock, setActiveIndexStock] = useState(-1);

  const onPieEnterStock = useCallback((_, index) => {
    setActiveIndexStock(index);
  }, []);

  const categories = [...new Set(inventoryItems.map(item => item.category))];
  const lowStockAlerts = inventoryItems.filter(item => item.stock < item.reorderPoint);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateStock = (e) => {
    e.preventDefault();
    const parsedNewStock = parseInt(newStock, 10);
    if (selectedProduct && !isNaN(parsedNewStock) && parsedNewStock >= 0) {
      const updatedItems = inventoryItems.map(item => {
        if (item.id === selectedProduct.id) {
          return { ...item, stock: parsedNewStock, status: parsedNewStock <= item.reorderPoint ? (parsedNewStock === 0 ? 'Habis' : 'Hampir Habis') : 'Aman' };
        }
        return item;
      });
      setInventoryItems(updatedItems);
      setSelectedProduct(null);
      setNewStock(''); // Reset newStock state after saving
    } else {
      // Menggunakan modal UI kustom daripada alert
      alert("Input stok tidak valid.");
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProductId = inventoryItems.length + 1;
    const newProduct = {
      id: newProductId,
      name: addProductForm.name,
      stock: parseInt(addProductForm.stock, 10),
      reorderPoint: parseInt(addProductForm.reorderPoint, 10),
      location: addProductForm.location,
      category: addProductForm.category,
      serial: `SN-00${newProductId}`,
      status: parseInt(addProductForm.stock, 10) <= parseInt(addProductForm.reorderPoint, 10) ? (parseInt(addProductForm.stock, 10) === 0 ? 'Habis' : 'Hampir Habis') : 'Aman'
    };
    const updatedItems = [...inventoryItems, newProduct];
    setInventoryItems(updatedItems); // Update parent state
    setAddProductForm({ name: '', stock: '', reorderPoint: '', location: '', category: '' });
  };
  
  const tabs = [
    { name: 'Ringkasan Stok', page: 'dashboard' },
    { name: 'Semua Produk', page: 'allProducts' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const stockSummary = [
          { name: 'Aman', value: inventoryItems.filter(i => i.status === 'Aman').length, color: '#4CAF50' },
          { name: 'Hampir Habis', value: inventoryItems.filter(i => i.status === 'Hampir Habis').length, color: '#FFC107' },
          { name: 'Habis', value: inventoryItems.filter(i => i.status === 'Habis').length, color: '#F44336' },
        ];

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.background }}>
                <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Ringkasan Status Stok</h3>
                <div className="relative w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockSummary}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        fill="#8884d8"
                        activeIndex={activeIndexStock}
                        activeShape={(props) => <ActivePieShape {...props} theme={theme} />}
                        onMouseEnter={onPieEnterStock}
                        onMouseLeave={() => setActiveIndexStock(-1)}
                      >
                        {stockSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={theme.background} strokeWidth={2}/>
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie theme={theme}/>} />
                    </PieChart>
                  </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                      <Package size={40} style={{ color: theme.accent, filter: `drop-shadow(0 2px 2px ${theme.secondary})` }} />
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {stockSummary.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className={`text-sm font-medium`} style={{ color: theme.text }}>{item.name}: {item.value} item</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.background }}>
                <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Produk Terlaris (Simulasi)</h3>
                <div className="space-y-4">
                  {bestSellingProducts.map(product => (
                    <div key={product.name} className={`flex items-center justify-between p-4 rounded-lg`} style={{ backgroundColor: theme.secondary }}>
                      <div>
                        <p className={`font-semibold`} style={{ color: theme.text }}>{product.name}</p>
                        <p className={`text-sm font-medium`} style={{ color: theme.accent }}>Penjualan: {product.sales}</p>
                      </div>
                      <button className={`bg-blue-500 text-white text-sm font-semibold py-1 px-3 rounded-full hover:bg-blue-600 transition-colors duration-200`}>Lihat Detail</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case 'allProducts':
        return (
          <>
            <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ backgroundColor: theme.background }}>
                <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Tambah Produk Baru</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        value={addProductForm.name}
                        onChange={(e) => setAddProductForm({...addProductForm, name: e.target.value})}
                        placeholder="Nama Produk"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="number"
                        name="stock"
                        value={addProductForm.stock}
                        onChange={(e) => setAddProductForm({...addProductForm, stock: e.target.value})}
                        placeholder="Jumlah Stok"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="number"
                        name="reorderPoint"
                        value={addProductForm.reorderPoint}
                        onChange={(e) => setAddProductForm({...addProductForm, reorderPoint: e.target.value})}
                        placeholder="Reorder Point"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="text"
                        name="location"
                        value={addProductForm.location}
                        onChange={(e) => setAddProductForm({...addProductForm, location: e.target.value})}
                        placeholder="Lokasi (ex: Gudang Pusat)"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        value={addProductForm.category}
                        onChange={(e) => setAddProductForm({...addProductForm, category: e.target.value})}
                        placeholder="Kategori (ex: Elektronik)"
                        className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        required
                    />
                    <button type="submit" className={`mt-2 md:col-span-2 font-bold py-2 px-4 rounded-lg transition-colors duration-200`}
                        style={{ backgroundColor: theme.accent, color: theme.background }}>
                        Tambah Produk
                    </button>
                </form>
            </div>
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className={`p-6 rounded-xl shadow-lg w-full max-w-sm mx-auto`} style={{ backgroundColor: theme.secondary }}>
                    <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Atur Stok Produk: {selectedProduct.name}</h3>
                    <p className={`text-sm font-medium`} style={{ color: theme.accent }}>Stok saat ini: {selectedProduct.stock}</p>
                    <form onSubmit={handleUpdateStock}>
                      <label className={`block text-sm font-bold mb-2`} style={{ color: theme.accent }} htmlFor="new-stock">
                        Stok Baru
                      </label>
                      <input
                        id="new-stock"
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className={`w-full py-2 px-3 rounded-lg border focus:outline-none focus:ring-2`}
                        style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                        min="0"
                      />
                      <div className="flex justify-end space-x-2 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                             setSelectedProduct(null);
                             setNewStock('');
                          }}
                          className={`bg-neutral-600 text-white font-semibold text-sm py-1.5 px-3 rounded-lg hover:bg-neutral-700 transition-colors duration-200`}
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className={`font-bold text-sm py-1.5 px-3 rounded-lg transition-colors duration-200`}
                          style={{ backgroundColor: theme.accent, color: theme.background }}
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
                  style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                />
              </div>
              <div className="relative flex-1">
                <Filter className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
                  style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                >
                  <option value="all">Semua Status</option>
                  <option value="Aman">Aman</option>
                  <option value="Hampir Habis">Hampir Habis</option>
                  <option value="Habis">Habis</option>
                </select>
              </div>
              <div className="relative flex-1">
                <Layers className={`absolute left-3 top-1/2 -translate-y-1/2`} style={{ color: theme.accent }} size={20} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2`}
                  style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special, outlineColor: theme.accent }}
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className={`p-4 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]`} style={{ backgroundColor: theme.background }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`text-lg font-bold`} style={{ color: theme.text }}>{item.name}</h4>
                      <p className={`text-sm font-medium`} style={{ color: theme.accent }}>Lokasi: {item.location}</p>
                      <p className={`text-xs font-medium`} style={{ color: theme.accent }}>Kategori: {item.category}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Aman' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'Hampir Habis' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex-1">
                      <p className={`text-2xl font-bold`} style={{ color: theme.text }}>{item.stock}</p>
                      <p className={`text-sm font-medium`} style={{ color: theme.accent }}>Stok</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setNewStock(item.stock);
                      }}
                      className={`font-semibold text-sm py-1.5 px-3 rounded-lg transition-colors duration-200`}
                      style={{ backgroundColor: theme.accent, color: theme.background }}
                    >
                      Atur Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Manajemen Stok Barang</h2>
      <div className={`mb-6 flex space-x-2 border-b pb-2`} style={{ borderColor: theme.special }}>
        {tabs.map(tab => (
          <button
            key={tab.page}
            onClick={() => setActiveTab(tab.page)}
            className={`py-2 px-4 rounded-t-lg font-bold transition-colors duration-200`}
            style={{ backgroundColor: activeTab === tab.page ? theme.background : 'transparent', color: activeTab === tab.page ? theme.text : theme.accent }}
          >
            {tab.name}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
};

export default InventoryContent;