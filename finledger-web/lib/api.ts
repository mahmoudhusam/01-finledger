const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

export type Account = {
  accountId: number;
  userId: number;
  accountName: string;
  accountType: 'checking' | 'savings' | 'crypto';
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type Transfer = {
  transactionId: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  note: string | null;
  createdAt: string;
  fromAccount: Account;
  toAccount: Account;
};

export type PaginatedResult<T> = {
  items: T[];
  cursor?: string;
  hasMore: boolean;
  count: number;
};

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const { token, ...fetchOptions } = options ?? {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}
