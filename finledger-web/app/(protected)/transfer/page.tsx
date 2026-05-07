import { Account, apiFetch, ApiError, PaginatedResult } from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TransferForm from './TransferForm';

export default async function TransferPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  let result: PaginatedResult<Account>;
  try {
    result = await apiFetch<PaginatedResult<Account>>('/accounts', { token: accessToken });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer Funds</h1>
      <TransferForm accounts={result.items} />
    </div>
  );
}
