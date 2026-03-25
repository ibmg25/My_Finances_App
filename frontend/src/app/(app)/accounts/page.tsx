'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Account, Asset, PaginatedResponse } from '@/types';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAsset, setNewAsset] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function loadAccounts() {
    const res = await apiFetch('/accounts/');
    const data: PaginatedResponse<Account> = await res.json();
    setAccounts(data.results);
  }

  useEffect(() => {
    Promise.all([
      apiFetch('/accounts/').then(r => r.json()),
      apiFetch('/assets/').then(r => r.json()),
    ]).then(([accs, ass]: [PaginatedResponse<Account>, PaginatedResponse<Asset>]) => {
      setAccounts(accs.results);
      setAssets(ass.results);
    }).finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await apiFetch('/accounts/', {
        method: 'POST',
        body: JSON.stringify({ name: newName, asset: newAsset }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(Object.values(data).flat().join(' ') || 'Error al crear cuenta.');
      }
      await loadAccounts();
      setShowModal(false);
      setNewName('');
      setNewAsset('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta cuenta?')) return;
    const res = await apiFetch(`/accounts/${id}/`, { method: 'DELETE' });
    if (res.ok) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(Array.isArray(data) ? data[0] : 'No se puede eliminar esta cuenta.');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Cuentas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600 transition-colors"
        >
          + Nueva cuenta
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No tienes cuentas. Crea una para empezar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-surface rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{acc.name}</p>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {acc.asset_name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="text-gray-300 hover:text-expense text-sm transition-colors"
                  title="Eliminar cuenta"
                >
                  ✕
                </button>
              </div>
              <Link
                href={`/accounts/${acc.id}`}
                className="block text-2xl font-bold text-navy-800 hover:text-navy-600 transition-colors"
              >
                {formatCurrency(acc.balance)}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create account modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Nueva cuenta</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej. Ahorros BCP"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda / Activo</label>
                <select
                  required
                  value={newAsset}
                  onChange={e => setNewAsset(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
                >
                  <option value="">Selecciona…</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>
              {error && (
                <p className="text-sm text-expense bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(''); }}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-navy-700 py-2 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-60 transition-colors"
                >
                  {creating ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
