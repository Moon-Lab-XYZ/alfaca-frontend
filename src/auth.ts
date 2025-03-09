import { AuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

const IMG_BASE_URL="https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=336";

declare module "next-auth" {
  interface Session {
    user: {
      fid: number;
      uid: number;
      userAddress: string;
    };
  }

  interface User {
    id: string;
    uid: string;
    userAddress: string;
  }
}

export const authOptions: AuthOptions = {
    // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "Sign in with Farcaster",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        const csrfToken = req?.body?.csrfToken;
        const appClient = createAppClient({
          ethereum: viemConnector(),
        });

        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: new URL(process.env.NEXTAUTH_URL ?? '').hostname,
          nonce: csrfToken,
        });
        const { success, fid } = verifyResponse;

        if (!success) {
          return null;
        }

        let userId: number | undefined = undefined;
        let userAddress: number | undefined = undefined;

        const { data: userExists, error } = await supabase
          .from('users')
          .select('*')
          .eq('farcaster_id', fid)
          .limit(1)
          .single();

        if (error || !userExists) {
          const userResponse = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
            {
              headers: {
                api_key: process.env.NEYNAR_API_KEY,
                accept: 'application/json',
                'content-type': 'application/json',
              } as HeadersInit,
              method: 'GET',
            }
          );
          const userData = (await userResponse.json()).users?.[0];

          if (userData) {
            const {data: createdUser, error} = await supabase
              .from('users')
              .insert([
                {
                  name: userData.display_name,
                  farcaster_username: userData.username,
                  farcaster_id: fid,
                  avatar_url: userData.pfp_url
                    ? `${IMG_BASE_URL}/${encodeURIComponent(
                        userData.pfp_url
                      )}`
                    : null,
                  custody_address: userData.custody_address,
                  verified_addresses: userData.verified_addresses.eth_addresses,
                  verified_accounts: userData.verified_accounts,
                },
              ])
              .select('*')
              .single();
            if (error) console.log(error);

            if (createdUser) {
              userId = createdUser.id as number;
              userAddress = createdUser.verified_addresses[0];
            }
          }
        } else {
          // User exists, use its ID
          userId = userExists.id as number;
          userAddress = userExists.verified_addresses[0];
        }

        return {
          id: fid.toString(),
          uid: userId !== undefined ? userId.toString() : '',
          userAddress: userAddress !== undefined ? userAddress.toString() : '',
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        return { ...token, id: user.id, uid: user.uid, userAddress: user.userAddress }; // Save id to token as docs says: https://next-auth.js.org/configuration/callbacks
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.fid = parseInt(token.sub ?? '');
        session.user.uid = parseInt(token.uid as string);
        session.user.userAddress = token.userAddress as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
  }
}

export const getSession = () => getServerSession(authOptions)
