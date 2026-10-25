import { NextResponse } from 'next/server';
import { auth } from './auth';
export const proxy = auth((request) => {
  if (!request.auth?.user?.id) {
    const destination = new URL('/login', request.url);
    destination.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(destination);
  }
  return NextResponse.next();
});
export const config = { matcher: ['/account/:path*', '/admin/:path*'] };
