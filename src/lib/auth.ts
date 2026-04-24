import NextAuth, { type NextAuthConfig, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

class AuthError extends CredentialsSignin {
  constructor(public override code: string) {
    super(code);
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. Login — the API returns access_token + user (with permissions)
          const tokenRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!tokenRes.ok) {
            const body = await tokenRes.text();
            console.error("[auth] login API error", { status: tokenRes.status, body });
            throw new AuthError(`login_failed_${tokenRes.status}__${body.slice(0, 100)}`);
          }

          const loginData = (await tokenRes.json()) as {
            access_token: string;
            token_type: string;
            user?: {
              id: string;
              email: string;
              first_name: string;
              last_name: string;
              role_name?: string | null;
              is_active?: boolean;
              permissions?: string[];
            };
          };

          const access_token = loginData.access_token;
          if (!access_token) {
            throw new AuthError("no_access_token_in_response");
          }

          // Use user from login response if present, otherwise fetch /users/me
          let apiUser = loginData.user;
          if (!apiUser) {
            const meRes = await fetch(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${access_token}` },
            });
            if (!meRes.ok) throw new AuthError(`me_failed_${meRes.status}`);
            apiUser = await meRes.json();
          }

          const roleCandidate = (apiUser?.role_name ?? "").toString().trim().toLowerCase();
          const permissions = (apiUser?.permissions ?? []).map((p) => p.toString().toLowerCase());

          // Block only explicit student role
          const studentRoles = ["student", "alumno", "estudiante"];
          if (studentRoles.includes(roleCandidate)) {
            console.warn("[auth] student is blocked", { roleCandidate, apiUser });
            throw new AuthError(`student_blocked__role_${roleCandidate}`);
          }

          return {
            id: apiUser!.id,
            email: apiUser!.email,
            first_name: apiUser!.first_name,
            last_name: apiUser!.last_name,
            role_name: roleCandidate,
            permissions,
            access_token,
          };
        } catch (e) {
          if (e instanceof CredentialsSignin) throw e;
          throw new AuthError(`exception__${String(e).slice(0, 120)}`);
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      // First sign-in: copy user fields into the JWT
      if (user) {
        token.access_token = (user as { access_token: string }).access_token;
        token.id = user.id as string;
        token.email = user.email as string;
        token.firstName = (user as { first_name: string }).first_name;
        token.lastName = (user as { last_name: string }).last_name;
        token.roleName = ((user as { role_name?: string | null }).role_name ?? "");
        token.permissions = (user as { permissions: string[] }).permissions || [];
      }
      return token;
    },
    session({ session, token }) {
      session.access_token = token.access_token as string;
      session.user.id = token.id as string;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      session.user.roleName = token.roleName as string;
      session.user.permissions = token.permissions as string[];
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: { strategy: "jwt" },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
