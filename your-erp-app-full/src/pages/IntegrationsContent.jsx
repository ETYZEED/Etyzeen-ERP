import React from 'react';
import { ArrowRight } from 'lucide-react';

const IntegrationsContent = ({ theme }) => (
  <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
    <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Integrasi Eksternal</h2>
    <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Hubungkan ERP Anda dengan platform lain untuk efisiensi maksimal.</p>
    <ul className={`space-y-2`} style={{ color: theme.accent }}>
      <li className="flex items-center font-medium"><ArrowRight className={`mr-2`} style={{ color: theme.special }} size={16} /> Integrasi E-commerce (Shopee, Tokopedia, dll.)</li>
      <li className="flex items-center font-medium"><ArrowRight className={`mr-2`} style={{ color: theme.special }} size={16} /> Integrasi Akun Bank & Pembayaran Online</li>
    </ul>
  </div>
);

export default IntegrationsContent;