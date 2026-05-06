import { Account, apiFetch, PaginatedResult } from '@/lib/api';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  

  const result = await apiFetch<PaginatedResult<Account>>('/accounts', { token: accessToken });

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Your Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.items.map((account) => (
          <div key={account.accountId} className="border rounded p-4">
            <h2 className="text-xl font-semibold">{account.accountName}</h2>
            <p>Type: {account.accountType}</p>
            <p>Balance: {Intl.NumberFormat(undefined, { style: 'currency', currency: account.currency }).format(account.balance/100)}</p>
            </div>
        ))}
      </div>
    </div>
  );
}
            