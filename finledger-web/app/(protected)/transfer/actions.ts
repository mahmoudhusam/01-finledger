'use server';
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";


export async function transferAction(
    fromAccountId: number,
    toAccountId: number,
    amountInCents: number,
    currency: string,
    idempotencyKey: string,
    note?: string,
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    return await apiFetch('/transfer', {
        method: 'POST',
        token,
        body: JSON.stringify({
            fromAccountId,
            toAccountId,
            amount: amountInCents,
            currency,
            note,
        }),
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
    });
}