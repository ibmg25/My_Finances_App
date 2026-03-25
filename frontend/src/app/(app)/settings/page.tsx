'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import type { Asset, Category, PaginatedResponse } from '@/types';

export default function SettingsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [baseCurrency, setBaseCurrency] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('EXPENSE');
  const [catError, setCatError] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch('/assets/').then(r => r.json()),
      apiFetch('/categories/').then(r => r.json()),
    ]).then(([assData, catData]: [PaginatedResponse<Asset>, PaginatedResponse<Category>]) => {
      setAssets(assData.results);
      setCategories(catData.results);
    });

    if (user?.base_currency) setBaseCurrency(user.base_currency);
  }, [user]);

  async function handleSaveCurrency(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    const res = await apiFetch('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify({ base_currency: baseCurrency || null }),
    });
    setSaving(false);
    setSaveMsg(res.ok ? 'Guardado.' : 'Error al guardar.');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatError('');
    const res = await apiFetch('/categories/', {
      method: 'POST',
      body: JSON.stringify({ name: newCatName, type: newCatType }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCatError(Object.values(data).flat().join(' ') || 'Error.');
      return;
    }
    const cat: Category = await res.json();
    setCategories(prev => [...prev, cat]);
    setNewCatName('');
  }

  async function handleDeleteCategory(id: number) {
    const res = await apiFetch(`/categories/${id}/`, { method: 'DELETE' });
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
    else {
      const data = await res.json().catch(() => ({}));
      alert(data?.detail || 'No se puede eliminar.');
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-lg">
      <h1 className="text-xl font-bold text-gray-800">Configuración</h1>

      {/* Profile */}
      <section className="bg-surface rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Perfil</h2>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Correo electrónico</label>
          <p className="text-sm text-gray-800">{user?.email}</p>
        </div>
        <form onSubmit={handleSaveCurrency} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda base</label>
            <select
              value={baseCurrency}
              onChange={e => setBaseCurrency(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            >
              <option value="">Sin moneda base</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            {saveMsg && <span className="text-sm text-income">{saveMsg}</span>}
          </div>
        </form>
      </section>

      {/* Categories */}
      <section className="bg-surface rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Categorías personalizadas</h2>

        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{cat.type}</span>
                {cat.is_system && (
                  <span className="text-xs text-navy-500 bg-navy-50 rounded-full px-2 py-0.5">sistema</span>
                )}
              </div>
              {!cat.is_system && (
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-gray-300 hover:text-expense text-sm transition-colors"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreateCategory} className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nueva categoría</p>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Nombre"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20"
            />
            <select
              value={newCatType}
              onChange={e => setNewCatType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
            >
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600 transition-colors"
            >
              +
            </button>
          </div>
          {catError && (
            <p className="text-sm text-expense">{catError}</p>
          )}
        </form>
      </section>
    </div>
  );
}
