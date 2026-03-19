'use client';

import { useState, useEffect } from 'react';
import { AutopilotSubscriptionCard } from '@/components/autopilot/AutopilotSubscriptionCard';
import { AutopilotPricingCards } from '@/components/autopilot/AutopilotPricingCards';
import { AutopilotUpgradeModal } from '@/components/autopilot/AutopilotUpgradeModal';
import { AutopilotTier } from '@/lib/stripe/autopilot-products';
import { toast } from 'sonner';

/**
 * Autopilot Subscription Page
 * Manage autopilot subscription, view usage, and upgrade/downgrade plans
 */
export default function AutopilotSubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<AutopilotTier | null>(null);

  // Fetch subscription data
  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/autopilot/subscription');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
        setUsage(data.usage);
      } else {
        throw new Error(data.message || 'Failed to fetch subscription');
      }
    } catch (error: any) {
      console.error('[Subscription Page] Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (tier?: AutopilotTier) => {
    if (tier) {
      setSelectedTier(tier);
      setIsUpgradeModalOpen(true);
    } else {
      // If no tier specified, show pricing cards
      window.scrollTo({
        top: document.getElementById('pricing-section')?.offsetTop || 0,
        behavior: 'smooth',
      });
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedTier) return;

    try {
      setIsLoading(true);

      const response = await fetch('/api/autopilot/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('[Subscription Page] Error upgrading:', error);
      toast.error(error.message || 'Failed to start upgrade process');
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/autopilot/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      toast.success('Subscription canceled successfully');
      await fetchSubscription(); // Refresh data
    } catch (error: any) {
      console.error('[Subscription Page] Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/autopilot/reactivate', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reactivate subscription');
      }

      toast.success('Subscription reactivated successfully');
      await fetchSubscription(); // Refresh data
    } catch (error: any) {
      console.error('[Subscription Page] Error reactivating subscription:', error);
      toast.error(error.message || 'Failed to reactivate subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: AutopilotTier) => {
    setSelectedTier(tier);
    setIsUpgradeModalOpen(true);
  };

  // Calculate days remaining in billing cycle
  const getDaysRemainingInCycle = () => {
    if (!subscription?.billingPeriod?.end) return 30;

    const now = new Date();
    const periodEnd = new Date(subscription.billingPeriod.end);
    return Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading && !subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Autopilot Subscription</h1>
          <p className="text-muted-foreground">
            Manage your Lead Autopilot subscription and view usage limits
          </p>
        </div>

        {/* Current Subscription Card */}
        {subscription && (
          <AutopilotSubscriptionCard
            subscription={subscription}
            usage={usage}
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
            onReactivate={handleReactivate}
          />
        )}

        {/* Pricing Section */}
        <div id="pricing-section" className="pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Available Plans</h2>
            <p className="text-muted-foreground">
              Choose the plan that fits your business needs
            </p>
          </div>

          <AutopilotPricingCards
            currentTier={subscription?.tier || 'free'}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
          />
        </div>

        {/* Upgrade Modal */}
        {selectedTier && subscription && (
          <AutopilotUpgradeModal
            isOpen={isUpgradeModalOpen}
            onClose={() => {
              setIsUpgradeModalOpen(false);
              setSelectedTier(null);
            }}
            currentTier={subscription.tier}
            targetTier={selectedTier}
            daysRemainingInCycle={getDaysRemainingInCycle()}
            onConfirm={handleConfirmUpgrade}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
