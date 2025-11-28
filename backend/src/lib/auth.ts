import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { jwt, openAPI, organization } from "better-auth/plugins";
import * as schema from "../db/schema/auth-schema.js";
import resend from "./email.js";
import { getActiveOrganization } from "../use-cases/organization.js";
import { and, eq } from "drizzle-orm";
import { membersTable } from "../db/schema/index.js";
import { sendOrganizationInvitation } from "./email.js";

export const auth = betterAuth({
  appName: "kanbased",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "support@mail.kanbased.com",
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "support@mail.kanbased.com",
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
      });
    },
  },

  trustedOrigins: [env.FE_ORIGIN],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 365, // 1 year
    updateAge: 60 * 60 * 24 * 365, // 1 year
    disableSessionRefresh: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const activeOrganizationId = await getActiveOrganization(
            session.userId,
          );
          return {
            data: {
              ...session,
              activeOrganizationId,
            },
          };
        },
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1y",
        definePayload: async (data) => {
          const { user, session } = data;

          const s = await db.query.membersTable.findFirst({
            where: and(
              eq(membersTable.userId, user.id),
              eq(membersTable.organizationId, session.activeOrganizationId),
            ),
            columns: {
              role: true,
            },
          });

          let activeOrganizationId = session.activeOrganizationId;

          if (!activeOrganizationId) {
            activeOrganizationId = await getActiveOrganization(user.id);
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            sub: user.id,
            image: user.image,
            emailVerified: user.emailVerified,
            role: s?.role,
            activeOrganizationId,
          };
        },
      },
    }),
    openAPI(),
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${env.FE_ORIGIN}/accept-invitation/${data.id}`;
        await sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },
    }),
  ],
});
