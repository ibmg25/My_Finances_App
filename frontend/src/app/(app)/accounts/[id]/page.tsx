'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatCurrency, formatDate, getTransactionColor, getTransactionSign } from '@/lib/utils';
import type { Account, PaginatedResponse, Transaction } from '@/types';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      apiFetch(`/accounts/${id}/`).then(r => r.ok ? r.json() : null),
      apiFetch(`/transactions/?account=${id}&page=${page}`).then(r => r.json()),
    ]).then(([acc, txData]: [Account | null, PaginatedResponse<Transaction>]) => {
      if (!acc) { router.push('/accounts'); return; }
      setAccount(acc);
      setTransactions(txData.results);
      setTotalCount(txData.count);
    }).finally(() => setIsLoading(false));
  }, [id, page, router]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!account) return null;

  const totalPages = Math.ceil(totalCount / 25);

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        ← Volver
      </button>

      {/* Account summary */}
      <div className="bg-navy-800 text-white rounded-2xl p-6">
        <p className="text-sm text-navy-300 mb-1">{account.asset_name}</p>
        <p className="text-3xl font-bold">{formatCurrency(account.balance)}</p>
        <p className="text-sm text-navy-300 mt-2">{account.name}</p>
      </div>

      {/* Transactions */}
      <div className="bg-surface rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Transacciones ({totalCount})
          </h2>
        </div>

        {transactions.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400">Sin transacciones en esta cuenta.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map(tx => (
              <li key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.description || tx.type}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(tx.timestamp)}
                    {tx.type === 'TRANSFER' && tx.account_destination_name && (
                      <> · → {tx.account_destination_name}</>
                    )}
                  </p>
                </div>
                <span className={`text-sm font-semibold ml-4 whitespace-nowrap ${getTransactionColor(tx.type)}`}>
                  {getTransactionSign(tx.type)}{formatCurrency(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="text-sm text-navy-600 disabled:text-gray-300 hover:text-navy-500 transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs text-gray-400">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="text-sm text-navy-600 disabled:text-gray-300 hover:text-navy-500 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
