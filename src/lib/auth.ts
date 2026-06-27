import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { prisma } from "./prisma";
import { getRegistrationEnabled, getOauthSettings } from "./settings";
import { detectRequestLocale } from "./locale";

// Provider credentials are read once at startup (better-auth builds the config
// statically). Changing them in the admin requires a server restart. The DB
// read is wrapped so a missing DB at boot never breaks auth.
const oauth = await getOauthSettings();
const socialProviders =
  oauth.googleClientId && oauth.googleClientSecret
    ? { google: { clientId: oauth.googleClientId, clientSecret: oauth.googleClientSecret } }
    : {};

// Emails that must always be admins (e.g. the project owner).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isForcedAdmin(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Social login (admin-configurable). Currently Google; Facebook can be added
  // the same way. Configured from the DB at startup (see above).
  socialProviders,

  // Optional profile data. These map to the columns in prisma/schema.prisma.
  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
      country: { type: "string", required: false, input: true },
      phone: { type: "string", required: false, input: true },
      // Set automatically at signup (not user-supplied).
      language: { type: "string", required: false, input: false },
    },
  },

  // Force certain accounts to be admins the moment they sign up.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const forced = isForcedAdmin(user.email);
          // Owners can always register; everyone else only if registration
          // is enabled in the admin settings.
          if (!forced && !(await getRegistrationEnabled())) {
            throw new APIError("FORBIDDEN", {
              code: "REGISTRATION_DISABLED",
              message: "Registration is currently disabled",
            });
          }
          // Stamp the account with the locale active at signup time.
          const language = await detectRequestLocale();
          const data = { ...user, language };
          if (forced) return { data: { ...data, role: "admin" } };
          return { data };
        },
      },
    },
  },

  plugins: [
    // Roles + ban/unban + user management used by the admin dashboard.
    // `role` is stored as a comma-separated string, so a user can hold
    // several roles (e.g. "user,admin").
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    // Must stay last: lets server actions/route handlers set auth cookies.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
