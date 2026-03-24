import { useState, useEffect } from 'react';

interface UserContext {
  distributorId: string;
  name: string;
  email: string;
  joinedDate: string;
  totalTeamMembers: number;
  totalCustomers: number;
  aiAgentPhone: string | null;
  isLicensedAgent: boolean;
  hasCompletedRaceTo100: boolean;
  raceTo100Points: number;
  loading: boolean;
  error: string | null;
}

export function useUserContext(): UserContext {
  const [context, setContext] = useState<UserContext>({
    distributorId: '',
    name: '',
    email: '',
    joinedDate: '',
    totalTeamMembers: 0,
    totalCustomers: 0,
    aiAgentPhone: null,
    isLicensedAgent: false,
    hasCompletedRaceTo100: false,
    raceTo100Points: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadUserContext() {
      try {
        // Fetch distributor info
        const response = await fetch('/api/dashboard/user-context', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load user context');
        }

        const data = await response.json();

        setContext({
          distributorId: data.distributor.id,
          name: `${data.distributor.first_name} ${data.distributor.last_name}`,
          email: data.distributor.email,
          joinedDate: new Date(data.distributor.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          totalTeamMembers: data.stats.teamMembers || 0,
          totalCustomers: data.stats.customers || 0,
          aiAgentPhone: data.aiAgent?.phone_number || null,
          isLicensedAgent: data.distributor.is_licensed_agent || false,
          hasCompletedRaceTo100: data.journey?.is_completed || false,
          raceTo100Points: data.journey?.total_points || 0,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error loading user context:', err);
        setContext(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load user context',
        }));
      }
    }

    loadUserContext();
  }, []);

  return context;
}
