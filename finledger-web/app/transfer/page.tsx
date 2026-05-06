import { Account, apiFetch, PaginatedResult } from '@/lib/api';
import { cookies } from 'next/headers';
import TransferForm from './TransferForm';

export default async function TransferPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const result = await apiFetch<PaginatedResult<Account>>('/accounts', { token: accessToken });

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer Funds</h1>
      <TransferForm accounts={result.items} />
    </div>
  );
}
