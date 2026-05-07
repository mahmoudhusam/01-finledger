import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');

  if (!token?.value?.trim()) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
    matcher: ['/((?!login|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};