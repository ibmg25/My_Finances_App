'use client';

import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useNetWorth } from '@/hooks/useNetWorth';
import { apiFetch } from '@/lib/api';
import { formatCurrency, formatDate, getTransactionColor, getTransactionSign } from '@/lib/utils';
import type { PaginatedResponse, Transaction } from '@/types';

const CHART_COLORS = ['#1e3a5f', '#2a4a73', '#3a5f8a', '#16a34a', '#dc2626', '#64748b'];

export default function DashboardPage() {
  const { netWorth, breakdown, isLoading } = useNetWorth();
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    apiFetch('/transactions/?page_size=5')
      .then(r => r.json())
      .then((data: PaginatedResponse<Transaction>) => setRecentTx(data.results))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, []);

  const chartData = Array.from(breakdown.entries()).map(([id, v]) => ({
    name: v.name,
    value: v.valueUSD,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

      {/* Net Worth Card */}
      <div className="bg-navy-800 text-white rounded-2xl p-6">
        <p className="text-sm text-navy-300 mb-1">Patrimonio neto</p>
        {isLoading ? (
          <div className="h-10 w-48 bg-navy-700 rounded animate-pulse" />
        ) : (
          <p className="text-4xl font-bold">{formatCurrency(netWorth)}</p>
        )}
        <p className="text-xs text-navy-400 mt-2">Valorado en USD</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Chart */}
        <div className="bg-surface rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribución del portafolio</h2>
          {isLoading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              Sin cuentas aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!isLoading && chartData.length > 0 && (
            <ul className="mt-3 space-y-1">
              {chartData.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {d.name} — {formatCurrency(d.value)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-surface rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Últimas transacciones</h2>
          {txLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <p className="text-sm text-gray-400">Sin transacciones aún</p>
          ) : (
            <ul className="space-y-3">
              {recentTx.map(tx => (
                <li key={tx.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(tx.timestamp)}</p>
                  </div>
                  <span className={`text-sm font-semibold ml-4 ${getTransactionColor(tx.type)}`}>
                    {getTransactionSign(tx.type)}{formatCurrency(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
