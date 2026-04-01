'use client';

import { useState, useEffect } from 'react';
import { AutopilotSubscriptionCard } from '@/components/autopilot/AutopilotSubscriptionCard';
import { AutopilotTier } from '@/lib/stripe/autopilot-products';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

/**
 * Autopilot Subscription Page
 * NOTE: As of 2026, ALL Autopilot features are FREE for Apex members
 * This page now just shows usage stats and confirms free access
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
          <h1 className="text-3xl font-bold mb-2">Autopilot - Free Access</h1>
          <p className="text-muted-foreground">
            All Lead Autopilot features are now FREE for Apex members
          </p>
        </div>

        {/* Free Announcement Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                🎉 All Features Unlocked - No Cost!
              </h2>
              <p className="text-slate-700 text-lg mb-4">
                Every Apex member now has unlimited access to:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited Email Invitations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited CRM Contacts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited SMS Messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited Social Media Posts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited Event Flyers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Team Broadcasts & Training Library</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>AI Lead Scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Advanced Analytics Dashboard</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">No payment required.</strong> Start using all features immediately from your <a href="/dashboard/autopilot" className="text-blue-600 hover:underline font-semibold">Autopilot Dashboard</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Usage Card */}
        {subscription && (
          <AutopilotSubscriptionCard
            subscription={subscription}
            usage={usage}
            onUpgrade={() => {}}
            onCancel={() => {}}
            onReactivate={() => {}}
          />
        )}
      </div>
    </div>
  );
}
