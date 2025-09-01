// Simple localStorage-backed accounting utilities

const STORAGE_KEYS = {
  accounts: 'acct_accounts',
  journalEntries: 'acct_journal_entries',
  taxes: 'acct_taxes',
  assets: 'acct_assets',
  budgets: 'acct_budgets',
};

const defaultAccounts = [
  { code: '1000', name: 'Kas', type: 'Asset', reconcilable: true, openingBalance: 0 },
  { code: '1010', name: 'Bank', type: 'Asset', reconcilable: true, openingBalance: 0 },
  { code: '1100', name: 'Piutang Usaha', type: 'Asset', openingBalance: 0 },
  { code: '1200', name: 'Persediaan', type: 'Asset', openingBalance: 0 },
  { code: '1500', name: 'Aset Tetap', type: 'Asset', openingBalance: 0 },
  { code: '1600', name: 'Akumulasi Penyusutan', type: 'Asset', contra: true, openingBalance: 0 },
  { code: '2000', name: 'Hutang Usaha', type: 'Liability', openingBalance: 0 },
  { code: '2100', name: 'Hutang Pajak', type: 'Liability', openingBalance: 0 },
  { code: '3000', name: 'Modal', type: 'Equity', openingBalance: 0 },
  { code: '4000', name: 'Pendapatan Penjualan', type: 'Income', openingBalance: 0 },
  { code: '5000', name: 'Harga Pokok Penjualan', type: 'Expense', openingBalance: 0 },
  { code: '5100', name: 'Biaya Operasional', type: 'Expense', openingBalance: 0 },
];

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureDefaultAccounts() {
  const acc = loadJSON(STORAGE_KEYS.accounts, []);
  if (!acc || acc.length === 0) {
    saveJSON(STORAGE_KEYS.accounts, defaultAccounts);
    return defaultAccounts;
  }
  return acc;
}

export function getAccounts() {
  return ensureDefaultAccounts();
}

export function upsertAccount(account) {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.code === account.code);
  if (idx >= 0) accounts[idx] = { ...accounts[idx], ...account };
  else accounts.push(account);
  saveJSON(STORAGE_KEYS.accounts, accounts);
  return accounts;
}

export function deleteAccount(code) {
  const accounts = getAccounts().filter((a) => a.code !== code);
  saveJSON(STORAGE_KEYS.accounts, accounts);
  return accounts;
}

export function getJournalEntries() {
  return loadJSON(STORAGE_KEYS.journalEntries, []);
}

export function saveJournalEntries(entries) {
  saveJSON(STORAGE_KEYS.journalEntries, entries);
}

export function addJournalEntry(entry) {
  const entries = getJournalEntries();
  entries.push(entry);
  saveJournalEntries(entries);
  return entries;
}

export function updateJournalEntry(id, updates) {
  const entries = getJournalEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...updates };
    saveJournalEntries(entries);
  }
  return entries;
}

export function deleteJournalEntry(id) {
  const entries = getJournalEntries().filter((e) => e.id !== id);
  saveJournalEntries(entries);
  return entries;
}

export function isBalanced(lines) {
  const sumDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const sumCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  return Math.abs(sumDebit - sumCredit) < 0.001;
}

export function computeAccountBalances(asOfDate = null) {
  const accounts = getAccounts();
  const entries = getJournalEntries().filter((e) => e.status === 'posted');
  const cutoff = asOfDate ? new Date(asOfDate) : null;
  const balances = Object.fromEntries(accounts.map(a => [a.code, a.openingBalance || 0]));
  entries.forEach((e) => {
    if (cutoff && new Date(e.date) > cutoff) return;
    e.lines.forEach((l) => {
      const code = l.accountCode;
      const debit = Number(l.debit) || 0;
      const credit = Number(l.credit) || 0;
      balances[code] = (balances[code] || 0) + debit - credit;
    });
  });
  return balances;
}

export function computeTrialBalance(asOfDate = null) {
  const accounts = getAccounts();
  const balances = computeAccountBalances(asOfDate);
  return accounts.map((a) => ({
    code: a.code,
    name: a.name,
    type: a.type,
    balance: balances[a.code] || 0,
  }));
}

export function computeBalanceSheet(asOfDate) {
  const tb = computeTrialBalance(asOfDate);
  const pick = (type) => tb.filter(a => a.type === type).reduce((s, a) => s + a.balance * (a.type === 'Asset' ? 1 : -1), 0);
  const assets = tb.filter(a => a.type === 'Asset');
  const liabilities = tb.filter(a => a.type === 'Liability');
  const equity = tb.filter(a => a.type === 'Equity');
  return {
    assets, liabilities, equity,
    totalAssets: pick('Asset'),
    totalLiabilities: tb.filter(a => a.type === 'Liability').reduce((s, a) => s + Math.abs(a.balance), 0),
    totalEquity: tb.filter(a => a.type === 'Equity').reduce((s, a) => s + Math.abs(a.balance), 0),
  };
}

export function computeProfitLoss(periodStart, periodEnd) {
  const entries = getJournalEntries().filter((e) => e.status === 'posted');
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const accounts = getAccounts();
  const typeByCode = Object.fromEntries(accounts.map(a => [a.code, a.type]));
  let income = 0;
  let expense = 0;
  entries.forEach((e) => {
    const d = new Date(e.date);
    if (d < start || d > end) return;
    e.lines.forEach((l) => {
      const t = typeByCode[l.accountCode];
      const debit = Number(l.debit) || 0;
      const credit = Number(l.credit) || 0;
      if (t === 'Income') income += credit - debit; // usually credits increase income
      if (t === 'Expense') expense += debit - credit; // debits increase expense
    });
  });
  return { income, expense, profit: income - expense };
}

export function computeCashFlow(periodStart, periodEnd) {
  const entries = getJournalEntries().filter((e) => e.status === 'posted');
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const cashCodes = getAccounts().filter(a => a.reconcilable).map(a => a.code);
  let cashIn = 0; let cashOut = 0;
  entries.forEach((e) => {
    const d = new Date(e.date);
    if (d < start || d > end) return;
    e.lines.forEach((l) => {
      if (!cashCodes.includes(l.accountCode)) return;
      const debit = Number(l.debit) || 0;
      const credit = Number(l.credit) || 0;
      const net = debit - credit;
      if (net > 0) cashIn += net; else cashOut += -net;
    });
  });
  return { cashIn, cashOut, net: cashIn - cashOut };
}

export { STORAGE_KEYS };
