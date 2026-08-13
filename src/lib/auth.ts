import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { organization: true }
        });

        if (!user || user.status !== "active") {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId.toString()
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = String(token.role);
        session.user.organizationId = String(token.organizationId);
      }

      return session;
    }
  }
});
