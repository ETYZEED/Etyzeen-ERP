import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Trash2, Save, Search } from 'lucide-react';
import { getAccounts, upsertAccount, deleteAccount } from '../utils/accounting';

const TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

export default function ChartOfAccounts({ theme }) {
  const [accounts, setAccounts] = useState(getAccounts());
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ code: '', name: '', type: 'Asset', reconcilable: false });

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter(a => a.code.includes(q) || a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
  }, [accounts, search]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    setAccounts(upsertAccount({ ...form }));
    setForm({ code: '', name: '', type: 'Asset', reconcilable: false });
  };

  const handleDelete = (code) => {
    if (!confirm('Hapus akun ini?')) return;
    setAccounts(deleteAccount(code));
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Bagan Akun</h3>

      <form onSubmit={handleSave} className={`p-4 rounded-lg mb-6`} style={{ backgroundColor: theme.background }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="py-2 px-3 rounded-lg border"
            style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }}
            placeholder="Kode"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <input
            className="py-2 px-3 rounded-lg border"
            style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }}
            placeholder="Nama Akun"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="py-2 px-3 rounded-lg border"
            style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={!!form.reconcilable} onChange={(e) => setForm({ ...form, reconcilable: e.target.checked })} />
            <span style={{ color: theme.accent }}>Bisa Rekonsiliasi (kas/bank)</span>
          </label>
          <button type="submit" className="font-bold py-2 px-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent, color: theme.background }}>
            <Save size={18} className="mr-2" /> Simpan / Update
          </button>
        </div>
      </form>

      <div className="mb-3 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.accent }} />
        <input
          className="w-full py-2 pl-10 pr-3 rounded-lg border"
          style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }}
          placeholder="Cari akun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: theme.special }}>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Kode</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Nama</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Tipe</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Rekonsiliasi</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.code} className="border-b" style={{ borderColor: theme.special }}>
                <td className="py-2 px-3" style={{ color: theme.text }}>{a.code}</td>
                <td className="py-2 px-3" style={{ color: theme.text }}>{a.name}</td>
                <td className="py-2 px-3" style={{ color: theme.text }}>{a.type}</td>
                <td className="py-2 px-3" style={{ color: theme.text }}>{a.reconcilable ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <button
                      className="py-1 px-2 rounded border"
                      style={{ color: theme.text, borderColor: theme.special }}
                      onClick={() => setForm({ code: a.code, name: a.name, type: a.type, reconcilable: !!a.reconcilable })}
                    >
                      Edit
                    </button>
                    <button
                      className="py-1 px-2 rounded text-red-500 flex items-center"
                      onClick={() => handleDelete(a.code)}
                    >
                      <Trash2 size={16} className="mr-1" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
