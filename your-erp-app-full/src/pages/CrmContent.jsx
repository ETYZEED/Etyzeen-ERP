import React from 'react';

const CrmContent = ({ theme, customerList }) => (
  <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
    <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Manajemen Relasi Pelanggan (CRM)</h2>
    <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Fitur ini membantu Anda melacak interaksi dan data pelanggan.</p>
    <div className="overflow-x-auto">
      <table className={`min-w-full text-left`}>
        <thead>
          <tr className={`border-b`} style={{ borderColor: theme.special }}>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Nama Pelanggan</th>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Perusahaan</th>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Kontak</th>
          </tr>
        </thead>
        <tbody>
          {customerList.map((customer) => (
            <tr key={customer.id} className={`border-b last:border-b-0`}
              style={{ borderColor: theme.special }}>
              <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{customer.name}</td>
              <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{customer.company}</td>
              <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>email@example.com</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default CrmContent;