import React from 'react';

const FinanceModulePlaceholder = ({ theme, title, description }) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>{title}</h3>
      <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>{description || 'Halaman ini masih berupa placeholder. Anda dapat menambahkan fitur lanjutan (filter, daftar, formulir, impor/ekspor) di sini.'}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className={`font-semibold mb-2`} style={{ color: theme.text }}>Aksi Cepat</h4>
          <ul className="list-disc ml-5" style={{ color: theme.accent }}>
            <li>Tambah data</li>
            <li>Impor CSV</li>
            <li>Ekspor CSV/XLSX</li>
          </ul>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className={`font-semibold mb-2`} style={{ color: theme.text }}>Status Ringkas</h4>
          <p style={{ color: theme.accent }}>Tampilkan statistik utama modul ini.</p>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className={`font-semibold mb-2`} style={{ color: theme.text }}>Integrasi</h4>
          <p style={{ color: theme.accent }}>Koneksikan dengan bank/pajak pihak ketiga.</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceModulePlaceholder;
