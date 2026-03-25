'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Account, Asset, PaginatedResponse } from '@/types';

export interface NetWorthData {
  netWorth: number;
  accounts: Account[];
  // Per-asset breakdown: assetId → { name, valueUSD, balance }
  breakdown: Map<string, { name: string; valueUSD: number; balance: number }>;
  isLoading: boolean;
  error: string | null;
}

export function useNetWorth(): NetWorthData {
  const [netWorth, setNetWorth] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [breakdown, setBreakdown] = useState<NetWorthData['breakdown']>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Fetch accounts and assets in parallel — both are needed for the calculation.
        const [accountsRes, assetsRes] = await Promise.all([
          apiFetch('/accounts/'),
          apiFetch('/assets/'),
        ]);

        if (!accountsRes.ok || !assetsRes.ok) throw new Error('Error cargando datos.');

        const accountsData: PaginatedResponse<Account> = await accountsRes.json();
        const assetsData: PaginatedResponse<Asset> = await assetsRes.json();

        if (cancelled) return;

        // O(1) lookup: assetId → priceUSD
        const priceMap = new Map(
          assetsData.results.map(a => [a.id, { price: parseFloat(a.current_price_usd), name: a.name }])
        );

        const breakdownMap: NetWorthData['breakdown'] = new Map();
        let total = 0;

        for (const acc of accountsData.results) {
          const assetInfo = priceMap.get(acc.asset);
          const price = assetInfo?.price ?? 0;
          const balance = parseFloat(acc.balance);
          const valueUSD = balance * price;
          total += valueUSD;

          const existing = breakdownMap.get(acc.asset);
          if (existing) {
            existing.valueUSD += valueUSD;
            existing.balance += balance;
          } else {
            breakdownMap.set(acc.asset, {
              name: assetInfo?.name ?? acc.asset,
              valueUSD,
              balance,
            });
          }
        }

        setNetWorth(total);
        setAccounts(accountsData.results);
        setBreakdown(breakdownMap);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { netWorth, accounts, breakdown, isLoading, error };
}
