import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import { verifyOrAssignDevice, DeviceMismatchError } from "./lib/device-guard";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        phone: { label: "Telefon", type: "text" },
        password: { label: "Parol", type: "password" },
        deviceId: { label: "Device ID", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string;
        const password = credentials?.password as string;
        const deviceId = credentials?.deviceId as string;

        if (!phone || !password || !deviceId) return null;

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        try {
          await verifyOrAssignDevice(user.id, deviceId);
        } catch (err) {
          if (err instanceof DeviceMismatchError) {
            throw new Error("DEVICE_MISMATCH");
          }
          throw err;
        }

        return {
          id: user.id,
          name: user.fullName,
          phone: user.phone,
          role: user.role,
          preferredLang: user.preferredLang,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.preferredLang = (user as any).preferredLang;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).preferredLang = token.preferredLang;
      }
      return session;
    },
  },
});
