# FinLedger

FinLedger is a personal finance ledger API that lets users create financial accounts (checking, savings, crypto), transfer money between accounts with full transaction safety (pessimistic locking, atomic transactions), receive external deposits via webhooks, and track every balance change through an immutable audit log. It includes a Next.js dashboard where users can view accounts, make transfers, and see transaction history.

## Tech Stack

**Backend**
- NestJS (Node.js framework)
- TypeORM + PostgreSQL
- Redis (idempotency & caching)
- JWT auth with refresh tokens
- @nestjs/swagger for API docs
- @nestjs/throttler for rate limiting

**Frontend**
- Next.js 16 (App Router)
- Server Actions for data mutations

## Running Locally

**1. Start the database and Redis:**
```bash
docker-compose up -d
```

**2. Start the backend** (runs on port 3000):
```bash
npm run start:dev
```

**3. Start the frontend** (runs on port 3001):
```bash
cd finledger-web
npm run dev
```

## API Base URL & Versioning

```
http://localhost:3000/v1
```

All routes are versioned via URI versioning (`/v1/...`). This makes it easy to introduce breaking changes in a future `/v2` without affecting existing clients.

## Authentication Flow

**1. Register:**
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123", "fullName": "John Doe"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```

Returns:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

**3. Use the token** — pass it as a Bearer token on all protected endpoints:
```bash
curl http://localhost:3000/v1/accounts \
  -H "Authorization: Bearer <accessToken>"
```

## Pagination

List endpoints use cursor-based pagination. Response shape:

```json
{
  "items": [...],
  "cursor": "eyJpZCI6MTB9",
  "hasMore": true,
  "count": 10
}
```

Pass the `cursor` value to get the next page:
```bash
curl "http://localhost:3000/v1/accounts?limit=10&cursor=eyJpZCI6MTB9" \
  -H "Authorization: Bearer <accessToken>"
```

## Idempotency

`POST /v1/transfer` supports idempotent requests. Send an `Idempotency-Key` header with a unique UUID — if you retry the same request, the original response is returned without creating a duplicate transfer.

```bash
curl -X POST http://localhost:3000/v1/transfer \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"fromAccountId": 1, "toAccountId": 2, "amount": 5000, "currency": "USD"}'
```

Note: `amount` is in cents — `5000` means $50.00.

## API Reference

Full interactive documentation (Swagger UI) is available at:

```
http://localhost:3000/docs
```

You can authenticate directly in the browser by clicking "Authorize" and pasting your `accessToken`.
