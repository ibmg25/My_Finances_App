'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatCurrency, formatDate, getTransactionColor } from '@/lib/utils';
import type { Account, Category, PaginatedResponse, Transaction } from '@/types';

type TxType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | '';

const TX_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Ingreso',
  WITHDRAWAL: 'Retiro',
  TRANSFER: 'Transferencia',
};

const TX_BADGE: Record<string, string> = {
  DEPOSIT: 'bg-green-50 text-income',
  WITHDRAWAL: 'bg-red-50 text-expense',
  TRANSFER: 'bg-gray-100 text-gray-600',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<TxType>('');
  const [filterAccount, setFilterAccount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadTransactions() {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterType) params.set('type', filterType);
    if (filterAccount) params.set('account', filterAccount);
    const res = await apiFetch(`/transactions/?${params}`);
    const data: PaginatedResponse<Transaction> = await res.json();
    setTransactions(data.results);
    setTotalCount(data.count);
    setIsLoading(false);
  }

  useEffect(() => {
    Promise.all([
      apiFetch('/accounts/').then(r => r.json()),
      apiFetch('/categories/').then(r => r.json()),
    ]).then(([accs, cats]: [PaginatedResponse<Account>, PaginatedResponse<Category>]) => {
      setAccounts(accs.results);
      setCategories(cats.results);
    });
  }, []);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, filterAccount]);

  const totalPages = Math.ceil(totalCount / 25);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Transacciones</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600 transition-colors"
        >
          + Nueva transacción
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value as TxType); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
        >
          <option value="">Todos los tipos</option>
          <option value="DEPOSIT">Ingresos</option>
          <option value="WITHDRAWAL">Retiros</option>
          <option value="TRANSFER">Transferencias</option>
        </select>
        <select
          value={filterAccount}
          onChange={e => { setFilterAccount(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
        >
          <option value="">Todas las cuentas</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400">{totalCount} transacciones</p>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400">Sin transacciones.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map(tx => (
              <li key={tx.id} className="px-6 py-4 flex items-center gap-4">
                <span className={`text-xs font-semibold rounded-full px-2.5 py-1 whitespace-nowrap ${TX_BADGE[tx.type]}`}>
                  {TX_TYPE_LABELS[tx.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.description || '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(tx.timestamp)}
                    {tx.account_origin_name && <> · {tx.account_origin_name}</>}
                    {tx.account_destination_name && <> → {tx.account_destination_name}</>}
                  </p>
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ${getTransactionColor(tx.type)}`}>
                  {formatCurrency(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="text-sm text-navy-600 disabled:text-gray-300 hover:text-navy-500 transition-colors">
              ← Anterior
            </button>
            <span className="text-xs text-gray-400">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              className="text-sm text-navy-600 disabled:text-gray-300 hover:text-navy-500 transition-colors">
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <CreateTransactionModal
          accounts={accounts}
          categories={categories}
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); loadTransactions(); }}
        />
      )}
    </div>
  );
}

function CreateTransactionModal({
  accounts,
  categories,
  onClose,
  onCreated,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const body: Record<string, unknown> = {
      type,
      amount,
      timestamp: new Date(timestamp).toISOString(),
    };
    if (fee) body.fee_amount = fee;
    if (origin) body.account_origin = origin;
    if (destination) body.account_destination = destination;
    if (category) body.category = Number(category);
    if (description) body.description = description;

    try {
      const res = await apiFetch('/transactions/', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data === 'object'
          ? Object.entries(data).map(([k, v]) => `${k}: ${(v as string[]).join(' ')}`).join('. ')
          : 'Error al crear transacción.';
        throw new Error(msg);
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Nueva transacción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="grid grid-cols-3 gap-2">
            {(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  type === t
                    ? 'bg-navy-700 text-white border-navy-700'
                    : 'border-gray-300 text-gray-600 hover:border-navy-600'
                }`}
              >
                {TX_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input type="number" step="any" min="0.00000001" required value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
              placeholder="0.00" />
          </div>

          {/* Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comisión (opcional)</label>
            <input type="number" step="any" min="0" value={fee} onChange={e => setFee(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
              placeholder="0.00" />
          </div>

          {/* Origin account */}
          {(type === 'WITHDRAWAL' || type === 'TRANSFER') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta origen</label>
              <select required value={origin} onChange={e => setOrigin(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20">
                <option value="">Selecciona…</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.asset_name})</option>)}
              </select>
            </div>
          )}

          {/* Destination account */}
          {(type === 'DEPOSIT' || type === 'TRANSFER') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta destino</label>
              <select required value={destination} onChange={e => setDestination(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20">
                <option value="">Selecciona…</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.asset_name})</option>)}
              </select>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (opcional)</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20">
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
            <input type="datetime-local" required value={timestamp} onChange={e => setTimestamp(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
              placeholder="Ej. Salario marzo" />
          </div>

          {error && (
            <p className="text-sm text-expense bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 rounded-lg bg-navy-700 py-2 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-60 transition-colors">
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
