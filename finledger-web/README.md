# FinLedger Web

Next.js 16 frontend for the FinLedger fintech application.

## Prerequisites

- NestJS backend running on `http://localhost:3000`
- Node.js 20+

## Environment Setup

Create a `.env.local` file in this directory:

```bash
API_URL=http://localhost:3000
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server (runs on port 3001 to avoid conflict with the NestJS backend on 3000):

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
app/
  login/          # Login page + server action
  (protected)/    # Auth-gated pages (dashboard, transfer, history)
lib/
  api.ts          # Typed fetch wrapper and shared types
middleware.ts     # JWT cookie guard for protected routes
```
