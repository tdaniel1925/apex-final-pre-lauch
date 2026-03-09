'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Distributor } from '@/lib/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('[useUser] Auth user:', user?.id, user?.email);
      setUser(user);

      if (user) {
        // Fetch distributor profile
        supabase
          .from('distributors')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            console.log('[useUser] Distributor data:', data);
            console.log('[useUser] Distributor error:', error);
            setProfile(data);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          supabase
            .from('distributors')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              setProfile(data);
              setLoading(false);
            });
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
