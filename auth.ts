import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const providers: Provider[] = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }));
}
providers.push(Credentials({
  id: 'otp', name: 'Mobile OTP', credentials: { phone: { label: 'Phone', type: 'tel' }, code: { label: 'Verification code', type: 'text' } },
  async authorize(credentials) {
    const phone = String(credentials?.phone ?? '').trim();
    const code = String(credentials?.code ?? '').trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{4,10}$/.test(code)) return null;
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) return null;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const form = new URLSearchParams({ To: phone, Code: code });
    const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form, cache: 'no-store' });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status !== 'approved') return null;
    const user = await prisma.user.upsert({ where: { phone }, update: {}, create: { phone, name: phone } });
    if (user.isBlocked) return null;
    return { id: user.id, name: user.name, email: user.email, image: user.image, phone: user.phone, role: user.role };
  }
}));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), providers,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user }) { if (!user.id) return false; const saved = await prisma.user.findUnique({ where: { id: user.id }, select: { isBlocked: true } }); return !saved?.isBlocked; },
    async jwt({ token, user }) { if (user) { token.id = user.id; token.role = (user as any).role ?? 'CUSTOMER'; } if (token.sub && !token.role) { const saved = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true } }); token.role = saved?.role ?? 'CUSTOMER'; } return token; },
    async session({ session, token }) { if (session.user) { (session.user as any).id = token.sub; (session.user as any).role = token.role ?? 'CUSTOMER'; } return session; }
  }
});
