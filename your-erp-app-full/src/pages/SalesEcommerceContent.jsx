import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRupiah } from '../utils/helpers';

const SalesEcommerceContent = ({ theme, ecommerceOrders, setEcommerceOrders, onOrderShipped }) => {
    const [activeTab, setActiveTab] = useState('dikemas');
    const [orders, setOrders] = useState(ecommerceOrders);

    useEffect(() => {
      setOrders(ecommerceOrders);
    }, [ecommerceOrders]);

    const tabs = [
      { name: 'Perlu Dikemas', page: 'dikemas', count: orders.dikemas.length },
      { name: 'Dikirim', page: 'dikirim', count: orders.dikirim.length },
      { name: 'Selesai', page: 'selesai', count: orders.selesai.length },
      { name: 'Pengembalian', page: 'pengembalian', count: orders.pengembalian.length },
    ];

    // Varian animasi untuk framer-motion
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
    };

    const handleShipOrder = (orderId) => {
      const orderToShip = orders.dikemas.find(order => order.id === orderId);
      if (orderToShip) {
        const updatedDikemas = orders.dikemas.filter(order => order.id !== orderId);
        const updatedDikirim = [...orders.dikirim, { ...orderToShip, shippingId: `SHP-${Math.floor(Math.random() * 10000)}` }];
        setEcommerceOrders({
          ...orders,
          dikemas: updatedDikemas,
          dikirim: updatedDikirim
        });
        onOrderShipped(orderToShip); // Call the parent function to update inventory
      }
    };

    const renderSalesContent = () => {
        switch (activeTab) {
            case 'dikemas':
                return (
                    <div className="overflow-x-auto">
                        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Pesanan Perlu Dikemas</h3>
                        <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Daftar pesanan dari e-commerce yang perlu dipersiapkan untuk pengiriman.</p>
                        <table className={`min-w-full text-left`}>
                            <thead>
                            <tr className={`border-b`} style={{ borderColor: theme.special }}>
                                <th className={`py-3 px-4 font-bold`}
                                  style={{ color: theme.accent }}>ID Pesanan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Total</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Aksi</th>
                            </tr>
                            </thead>
                            <tbody>
                            <AnimatePresence mode="wait">
                            {orders.dikemas.map(order => (
                              <motion.tr
                                key={order.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`border-b`} style={{ borderColor: theme.special }}>
                                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.id}</td>
                                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.date}</td>
                                <td
                                  className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.customer}</td>
                                <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.total}</td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleShipOrder(order.id)}
                                    className={`font-semibold text-sm py-1.5 px-3 rounded-lg transition-colors duration-200`}
                                    style={{ backgroundColor: theme.accent, color: theme.background }}
                                  >
                                    Kirim
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                );
            case 'dikirim':
                return (
                    <div className="overflow-x-auto">
                        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Pesanan Dikirim</h3>
                        <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Daftar pesanan e-commerce yang sudah dalam proses pengiriman.</p>
                        <table className={`min-w-full text-left`}>
                            <thead>
                            <tr className={`border-b`} style={{ borderColor: theme.special }}>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Pesanan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>No. Resi</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            <AnimatePresence mode="wait">
                            {orders.dikirim.map(order => (
                                <motion.tr
                                    key={order.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={`border-b`} style={{ borderColor: theme.special }}>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.id}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.customer}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.shippingId}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>Dalam Perjalanan</td>
                                </motion.tr>
                            ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                );
            case 'selesai':
                return (
                    <div className="overflow-x-auto">
                        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Pesanan Selesai</h3>
                        <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Daftar pesanan e-commerce yang sudah selesai dan diterima pelanggan.</p>
                        <table className={`min-w-full text-left`}>
                            <thead>
                            <tr className={`border-b`} style={{ borderColor: theme.special }}>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Pesanan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Total</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Tanggal Selesai</th>
                            </tr>
                            </thead>
                            <tbody>
                            <AnimatePresence mode="wait">
                            {orders.selesai.map(order => (
                                <motion.tr
                                    key={order.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={`border-b`} style={{ borderColor: theme.special }}>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.id}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.customer}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.total}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.date}</td>
                                </motion.tr>
                            ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                );
            case 'pengembalian':
                return (
                    <div className="overflow-x-auto">
                        <h3 className={`text-lg font-bold mb-4`} style={{ color: theme.text }}>Pesanan Pengembalian</h3>
                        <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Daftar pesanan yang dikembalikan oleh pelanggan.</p>
                        <table className={`min-w-full text-left`}>
                            <thead>
                            <tr className={`border-b`} style={{ borderColor: theme.special }}>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>ID Pesanan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Pelanggan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Alasan</th>
                                <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            <AnimatePresence mode="wait">
                            {orders.pengembalian.map(order => (
                                <motion.tr
                                    key={order.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={`border-b`} style={{ borderColor: theme.special }}>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.id}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.customer}</td>
                                  <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{order.reason}</td>
                                  <td className="py-3 px-4">
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400`}>
                                      Diproses
                                    </div>
                                  </td>
                                </motion.tr>
                            ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };
  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
        <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Manajemen Penjualan E-commerce</h2>
        <div className={`mb-6 flex space-x-2 border-b pb-2`} style={{ borderColor: theme.special }}>
          {tabs.map(tab => (
            <button
                key={tab.page}
                onClick={() => setActiveTab(tab.page)}
                className={`py-2 px-4 rounded-t-lg font-bold transition-colors duration-200`}
                style={{ backgroundColor: activeTab === tab.page ? theme.background : 'transparent', color: activeTab === tab.page ? theme.text : theme.accent }}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>
        {renderSalesContent()}
    </div>
  );
};

export default SalesEcommerceContent;