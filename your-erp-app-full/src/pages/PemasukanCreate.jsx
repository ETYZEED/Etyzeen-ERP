import React, { useState } from 'react';

const PemasukanCreate = ({ theme, onCreate }) => {
  const [form, setForm] = useState({ date: '', description: '', amount: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    const newEntry = { id: Date.now().toString(), ...form };
    onCreate && onCreate(newEntry);
    setForm({ date: '', description: '', amount: '' });
  };

  return (
    <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: theme.secondary }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Buat Pemasukan Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.accent }}>Tanggal</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.accent }}>Deskripsi</label>
          <input name="description" value={form.description} onChange={handleChange} className="w-full p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.accent }}>Jumlah (Rp)</label>
          <input name="amount" value={form.amount} onChange={handleChange} className="w-full p-2 rounded" placeholder="1000000" />
        </div>
        <div>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Simpan</button>
        </div>
      </form>
    </div>
  );
};

export default PemasukanCreate;
