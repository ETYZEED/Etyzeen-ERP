import React, { useMemo, useState } from 'react';
import { computeBalanceSheet, computeProfitLoss, computeCashFlow } from '../utils/accounting';

export function BalanceSheetReport({ theme }) {
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0,10));
  const data = useMemo(() => computeBalanceSheet(asOf), [asOf]);
  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Laporan Neraca</h3>
      <div className="mb-4">
        <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className="font-semibold mb-2" style={{ color: theme.text }}>Aset</h4>
          <ul>
            {data.assets.map(a => <li key={a.code} className="flex justify-between" style={{ color: theme.text }}><span>{a.code} - {a.name}</span><span>{a.balance.toFixed(2)}</span></li>)}
          </ul>
          <div className="mt-2 font-bold" style={{ color: theme.text }}>Total Aset: {data.totalAssets.toFixed(2)}</div>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className="font-semibold mb-2" style={{ color: theme.text }}>Kewajiban</h4>
          <ul>
            {data.liabilities.map(a => <li key={a.code} className="flex justify-between" style={{ color: theme.text }}><span>{a.code} - {a.name}</span><span>{Math.abs(a.balance).toFixed(2)}</span></li>)}
          </ul>
          <div className="mt-2 font-bold" style={{ color: theme.text }}>Total Kewajiban: {data.totalLiabilities.toFixed(2)}</div>
        </div>
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
          <h4 className="font-semibold mb-2" style={{ color: theme.text }}>Ekuitas</h4>
          <ul>
            {data.equity.map(a => <li key={a.code} className="flex justify-between" style={{ color: theme.text }}><span>{a.code} - {a.name}</span><span>{Math.abs(a.balance).toFixed(2)}</span></li>)}
          </ul>
          <div className="mt-2 font-bold" style={{ color: theme.text }}>Total Ekuitas: {data.totalEquity.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

export function ProfitLossReport({ theme }) {
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const defaultEnd = today.toISOString().slice(0,10);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const data = useMemo(() => computeProfitLoss(start, end), [start, end]);
  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Laporan Laba Rugi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} />
      </div>
      <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
        <div className="flex justify-between" style={{ color: theme.text }}><span>Pendapatan</span><span>{data.income.toFixed(2)}</span></div>
        <div className="flex justify-between" style={{ color: theme.text }}><span>Biaya</span><span>{data.expense.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold mt-2" style={{ color: theme.text }}><span>Laba</span><span>{data.profit.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

export function CashFlowReport({ theme }) {
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const defaultEnd = today.toISOString().slice(0,10);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const data = useMemo(() => computeCashFlow(start, end), [start, end]);
  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h3 className={`text-xl font-bold mb-4`} style={{ color: theme.text }}>Laporan Arus Kas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="py-2 px-3 rounded-lg border" style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.special }} />
      </div>
      <div className={`p-4 rounded-lg`} style={{ backgroundColor: theme.background }}>
        <div className="flex justify-between" style={{ color: theme.text }}><span>Kas Masuk</span><span>{data.cashIn.toFixed(2)}</span></div>
        <div className="flex justify-between" style={{ color: theme.text }}><span>Kas Keluar</span><span>{data.cashOut.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold mt-2" style={{ color: theme.text }}><span>Arus Kas Bersih</span><span>{data.net.toFixed(2)}</span></div>
      </div>
    </div>
  );
}
