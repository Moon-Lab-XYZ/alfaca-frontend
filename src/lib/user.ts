import { useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
// import * as amplitude from '@amplitude/analytics-browser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: false,
    },
  }
);

export default function useUser() {
  const { data: session, status } = useSession();
  const userSession = session;
  useEffect(() => {
    if (userSession) {
      mutate('currentUser');
    }

    if (status === 'authenticated') {
      mutate('currentUser');
    }
  }, [userSession, status]);

  async function fetchCurrentUser(apiURL: string) {
    if (!userSession) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('farcaster_id', userSession?.user.fid)
      .limit(1)
      .single();
    if (error) return null;
    // amplitude.setUserId(data.id);
    return {
      user: data,
      session: userSession,
    };
  }

  return useSWR('currentUser', fetchCurrentUser);
}
