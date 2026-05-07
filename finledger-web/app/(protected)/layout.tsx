import Link from 'next/link';
import { logoutAction } from './actions';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-8 py-4 flex items-center justify-between">
        <div className="flex gap-6">
          <Link href="/" className="font-medium hover:underline">
            Dashboard
          </Link>
          <Link href="/transfer" className="font-medium hover:underline">
            Transfer
          </Link>
          <Link href="/history" className="font-medium hover:underline">
            History
          </Link>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-red-600 hover:underline">
            Logout
          </button>
        </form>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
