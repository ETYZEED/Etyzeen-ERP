import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Trash2, Save, Check, X } from 'lucide-react';
import { getAccounts, getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, isBalanced } from '../utils/accounting';

export default function JournalEntries({ theme }) {
  const [accounts, setAccounts] = useState(getAccounts());
  const [entries, setEntries] = useState(getJournalEntries());
  const [form, setForm] = useState({
    id: null,
    date: new Date().toISOString().slice(0, 10),
    memo: '',
    status: 'draft',
    lines: [{ accountCode: accounts[0]?.code || '', description: '', debit: '', credit: '' }]
  });

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const totalDebit = useMemo(() => form.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0), [form.lines]);
  const totalCredit = useMemo(() => form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0), [form.lines]);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  const addLine = () => {
    setForm({ ...form, lines: [...form.lines, { accountCode: accounts[0]?.code || '', description: '', debit: '', credit: '' }] });
  };

  const removeLine = (idx) => {
    const lines = form.lines.filter((_, i) => i !== idx);
    setForm({ ...form, lines });
  };

  const updateLine = (idx, patch) => {
    const lines = form.lines.map((l, i) => i === idx ? { ...l, ...patch } : l);
    setForm({ ...form, lines });
  };

  const resetForm = () => {
    setForm({ id: null, date: new Date().toISOString().slice(0, 10), memo: '', status: 'draft', lines: [{ accountCode: accounts[0]?.code || '', description: '', debit: '', credit: '' }] });
  };

  const handleSaveDraft = () => {
    if (form.id) {
      setEntries(updateJournalEntry(form.id, { ...form }));
    } else {
      const id = 'JE-' + Date.now();
      const newEntry = { ...form, id };
      setEntries(addJournalEntry(newEntry));
      setForm(newEntry);
    }
  };

  const handlePost = () => {
    if (!balanced) return alert('Jurnal belum balance.');
    if (!form.id) handleSaveDraft();
    setEntries(updateJournalEntry(form.id || ('JE-' + Date.now()), { ...form, status: 'posted' }));
    setForm((prev) => ({ ...prev, status: 'posted' }));
  };

  const handleUnpost = () => {
    if (!form.id) return;
    setEntries(updateJournalEntry(form.id, { ...form, status: 'draft' }));
    setForm((prev) => ({ ...prev, status: 'draft' }));
  };

  const handleDelete = (id) => {
    if (!confirm('Hapus jurnal ini?')) return;
    setEntries(deleteJournalEntry(id));
    if (form.id === id) resetForm();
  };

  const pick = (e) => {
    setForm(JSON.parse(JSON.stringify(e)));
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Entri Jurnal</h3>

      <div className={`p-4 rounded-lg mb-6`} style={{ backgroundColor: theme.background }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input type="date" className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }} placeholder="Memo" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
          <div className="flex items-center">
            <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: form.status === 'posted' ? '#16a34a33' : '#f59e0b33', color: theme.text }}>{form.status.toUpperCase()}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: theme.special }}>
                <th className="py-2 px-3" style={{ color: theme.accent }}>Akun</th>
                <th className="py-2 px-3" style={{ color: theme.accent }}>Deskripsi</th>
                <th className="py-2 px-3" style={{ color: theme.accent }}>Debit</th>
                <th className="py-2 px-3" style={{ color: theme.accent }}>Kredit</th>
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody>
              {form.lines.map((l, idx) => (
                <tr key={idx} className="border-b" style={{ borderColor: theme.special }}>
                  <td className="py-2 px-3">
                    <select className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }} value={l.accountCode} onChange={(e) => updateLine(idx, { accountCode: e.target.value })}>
                      {accounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3"><input className="w-full py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }} value={l.description} onChange={(e) => updateLine(idx, { description: e.target.value })} /></td>
                  <td className="py-2 px-3"><input type="number" step="0.01" className="w-full py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }} value={l.debit} onChange={(e) => updateLine(idx, { debit: e.target.value, credit: '' })} /></td>
                  <td className="py-2 px-3"><input type="number" step="0.01" className="w-full py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.secondary, color: theme.text, borderColor: theme.special }} value={l.credit} onChange={(e) => updateLine(idx, { credit: e.target.value, debit: '' })} /></td>
                  <td className="py-2 px-3">
                    {form.lines.length > 1 && (
                      <button className="text-red-500" onClick={() => removeLine(idx)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button className="py-2 px-4 rounded-lg flex items-center" onClick={addLine} style={{ color: theme.text, border: `1px solid ${theme.special}` }}>
            <Plus size={18} className="mr-2" /> Tambah Baris
          </button>
          <div className="text-sm" style={{ color: balanced ? '#34d399' : '#f87171' }}>
            Total Debit: {totalDebit.toFixed(2)} | Total Kredit: {totalCredit.toFixed(2)} {balanced ? '✓ Balance' : '✗ Tidak Balance'}
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <button className="py-2 px-4 rounded-lg font-bold flex items-center" onClick={handleSaveDraft} style={{ backgroundColor: theme.accent, color: theme.background }}>
            <Save size={18} className="mr-2" /> Simpan Draft
          </button>
          <button className="py-2 px-4 rounded-lg font-bold flex items-center" onClick={handlePost} disabled={!balanced} style={{ backgroundColor: balanced ? '#10b981' : '#6b7280', color: 'white' }}>
            <Check size={18} className="mr-2" /> Posting
          </button>
          {form.status === 'posted' && (
            <button className="py-2 px-4 rounded-lg font-bold flex items-center" onClick={handleUnpost} style={{ backgroundColor: '#f59e0b', color: 'white' }}>
              <X size={18} className="mr-2" /> Batalkan Posting
            </button>
          )}
          <button className="py-2 px-4 rounded-lg font-bold" onClick={resetForm} style={{ color: theme.text, border: `1px solid ${theme.special}` }}>Reset</button>
        </div>
      </div>

      <h4 className="font-semibold mb-2" style={{ color: theme.text }}>Daftar Entri</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: theme.special }}>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Tanggal</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>ID</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Memo</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Status</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Total</th>
              <th className="py-2 px-3" style={{ color: theme.accent }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => {
              const tot = e.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
              return (
                <tr key={e.id} className="border-b" style={{ borderColor: theme.special }}>
                  <td className="py-2 px-3" style={{ color: theme.text }}>{e.date}</td>
                  <td className="py-2 px-3 cursor-pointer underline" style={{ color: theme.text }} onClick={() => pick(e)}>{e.id}</td>
                  <td className="py-2 px-3" style={{ color: theme.text }}>{e.memo}</td>
                  <td className="py-2 px-3"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: e.status === 'posted' ? '#16a34a33' : '#f59e0b33', color: theme.text }}>{e.status.toUpperCase()}</span></td>
                  <td className="py-2 px-3" style={{ color: theme.text }}>{tot.toFixed(2)}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <button className="py-1 px-2 rounded border" style={{ color: theme.text, borderColor: theme.special }} onClick={() => pick(e)}>Edit</button>
                      <button className="py-1 px-2 rounded text-red-500 flex items-center" onClick={() => handleDelete(e.id)}><Trash2 size={16} className="mr-1"/> Hapus</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
