import { apiFetch, ApiError, PaginatedResult, Transfer } from '@/lib/api';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[] }>;
}) {
  const { cursor: rawCursor } = await searchParams;
  const cursor = Array.isArray(rawCursor) ? rawCursor[0] : rawCursor;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  let currentUserId: number;
  try {
    const [, payloadSegment] = accessToken!.split('.');
    const payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf-8'));
    currentUserId = payload.sub;
  } catch {
    redirect('/login');
  }

  const url = cursor ? `/transfer?cursor=${encodeURIComponent(cursor)}` : '/transfer';
  let result: PaginatedResult<Transfer>;
  try {
    result = await apiFetch<PaginatedResult<Transfer>>(url, { token: accessToken });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }

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
