import { apiFetch, PaginatedResult, Transfer } from '@/lib/api';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  let currentUserId: number;
  try {
    const payload = JSON.parse(Buffer.from(accessToken!.split('.')[1], 'base64').toString('utf-8'));
    currentUserId = payload.sub;
  } catch{
    redirect('/login');
  }

  const url = cursor ? `/transfers?cursor=${encodeURIComponent(cursor)}` : '/transfer';
  const result = await apiFetch<PaginatedResult<Transfer>>(url, {
    token: accessToken,
  });

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer History</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">From Account</th>
            <th className="py-2 px-4 border-b">To Account</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {result.items.map((transfer) => (
            <tr key={transfer.transactionId} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">
                {new Date(transfer.createdAt).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b">
                {transfer.fromAccount.accountName}
                {transfer.fromAccount.userId === currentUserId && ' (You) '}
              </td>
              <td className="py-2 px-4 border-b">
                {transfer.toAccount.accountName}
                {transfer.toAccount.userId === currentUserId && ' (You) '}
              </td>
              <td
                className={`py-2 px-4 border-b font-medium ${
                  transfer.fromAccount.userId === currentUserId ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {transfer.fromAccount.userId === currentUserId ? '-' : '+'}
                {Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: transfer.currency,
                }).format(transfer.amount / 100)}
              </td>
              <td className="py-2 px-4 border-b">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${statusColors[transfer.status]}`}
                >
                  {transfer.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        {result.cursor && (
          <Link href={`/history?cursor=${result.cursor}`} className="text-blue-500 hover:underline">
            Load More
          </Link>
        )}
      </div>
    </div>
  );
}
