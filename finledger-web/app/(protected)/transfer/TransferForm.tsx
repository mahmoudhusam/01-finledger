'use client';

import { useState, useRef, SyntheticEvent } from 'react';
import { Account } from '@/lib/api';
import { transferAction } from './actions';
import { z } from 'zod';

const transferSchema = z
  .object({
    fromAccountId: z.coerce.number().positive('From account is required'),
    toAccountId: z.coerce.number().positive('To account is required'),
    amount: z.number().positive('Amount must be greater than zero'),
    note: z.string().optional(),
  })
  .refine((data) => data.toAccountId !== data.fromAccountId, {
    message: 'To account must be different from from account',
    path: ['toAccountId'],
  });

export default function TransferForm({ accounts }: { accounts: Account[] }) {
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const parsed = transferSchema.parse({
        fromAccountId,
        toAccountId,
        amount: parseFloat(amount),
        note,
      });

      const fromAccount = accounts.find((a) => a.accountId === parsed.fromAccountId);
      const amountInCents = Math.round(parsed.amount * 100);

      await transferAction(
        parsed.fromAccountId,
        parsed.toAccountId,
        amountInCents,
        fromAccount!.currency,
        idempotencyKeyRef.current,
        note || undefined,
      );

      setSuccess('Transfer successful!');
      setFromAccountId('');
      setToAccountId('');
      setAmount('');
      setNote('');
      idempotencyKeyRef.current = crypto.randomUUID();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues.map((issue) => issue.message).join(', '));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <select
        value={fromAccountId}
        onChange={(e) => setFromAccountId(e.target.value)}
        required
        className="border rounded px-3 py-2"
      >
        <option value="">Select From Account</option>
        {accounts.map((account) => (
          <option key={account.accountId} value={account.accountId}>
            {account.accountName} ({account.currency}{' '}
            {Intl.NumberFormat(undefined, { style: 'currency', currency: account.currency }).format(
              account.balance / 100,
            )}
            )
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="to Account ID"
        value={toAccountId}
        onChange={(e) => setToAccountId(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />

      <textarea
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="border rounded px-3 py-2"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <button type="submit" disabled={isPending} className="bg-black text-white rounded py-2">
        {isPending ? 'Transferring...' : 'Transfer'}
      </button>
    </form>
  );
}
