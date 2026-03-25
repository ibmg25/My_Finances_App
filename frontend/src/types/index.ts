export interface Asset {
  id: string;
  name: string;
  type: 'FIAT' | 'CRYPTO';
  current_price_usd: string;
  last_price_update: string | null;
}

export interface Account {
  id: string;
  name: string;
  asset: string;
  asset_id: string;
  asset_name: string;
  balance: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: string;
  is_system: boolean;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: string;
  fee_amount: string;
  account_origin: string | null;
  account_origin_name: string | null;
  account_destination: string | null;
  account_destination_name: string | null;
  category: number | null;
  category_name: string | null;
  exchange_rate: string | null;
  timestamp: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  base_currency: string | null;
  base_currency_id: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
