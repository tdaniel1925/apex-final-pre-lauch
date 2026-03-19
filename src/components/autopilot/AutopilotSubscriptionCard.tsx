'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTierDisplayName } from '@/lib/stripe/autopilot-products';

/**
 * Subscription data interface
 */
interface SubscriptionData {
  tier: string;
  status: string;
  productName: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  trialStatus?: {
    isTrialing: boolean;
    trialEnd: string;
    daysRemaining: number;
  } | null;
  billingPeriod?: {
    start: string;
    end: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  stripeCustomerId?: string | null;
}

/**
 * Usage data interface
 */
interface UsageData {
  emailInvites: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  smsMessages: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  contacts: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  socialPosts: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  flyers: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  broadcasts: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  nextResetAt: string;
}

interface AutopilotSubscriptionCardProps {
  subscription: SubscriptionData;
  usage: UsageData | null;
  onUpgrade?: () => void;
  onCancel?: () => void;
  onReactivate?: () => void;
}

/**
 * AutopilotSubscriptionCard Component
 * Displays current subscription status, features, and usage limits
 */
export function AutopilotSubscriptionCard({
  subscription,
  usage,
  onUpgrade,
  onCancel,
  onReactivate,
}: AutopilotSubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{subscription.displayName}</CardTitle>
            <CardDescription>{subscription.description}</CardDescription>
          </div>
          <div className="text-right">
            {subscription.tier !== 'free' && (
              <div className="text-2xl font-bold">${subscription.priceMonthly}/mo</div>
            )}
            <Badge
              className={
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : subscription.status === 'trialing'
                  ? 'bg-blue-100 text-blue-800'
                  : subscription.status === 'past_due'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {subscription.status === 'trialing' ? 'Trial' : subscription.status}
            </Badge>
          </div>
        </div>

        {subscription.trialStatus?.isTrialing && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Free trial ends in <strong>{subscription.trialStatus.daysRemaining} days</strong> (
              {formatDate(subscription.trialStatus.trialEnd)})
            </p>
          </div>
        )}

        {subscription.billingPeriod?.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled on{' '}
              <strong>{formatDate(subscription.billingPeriod.end)}</strong>
            </p>
          </div>
        )}
      </CardHeader>

      {usage && (
        <CardContent>
          <h3 className="font-semibold mb-4">Usage This Month</h3>
          <div className="space-y-4">
            {/* Email Invites */}
            {usage.emailInvites.limit !== 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Email Invitations</span>
                  <span
                    className={getUsageColor(
                      calculateUsagePercentage(usage.emailInvites.used, usage.emailInvites.limit)
                    )}
                  >
                    {usage.emailInvites.isUnlimited
                      ? `${usage.emailInvites.used} sent`
                      : `${usage.emailInvites.used} / ${usage.emailInvites.limit}`}
                  </span>
                </div>
                {!usage.emailInvites.isUnlimited && (
                  <Progress
                    value={calculateUsagePercentage(
                      usage.emailInvites.used,
                      usage.emailInvites.limit
                    )}
                  />
                )}
              </div>
            )}

            {/* SMS Messages */}
            {usage.smsMessages.limit !== 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>SMS Messages</span>
                  <span
                    className={getUsageColor(
                      calculateUsagePercentage(usage.smsMessages.used, usage.smsMessages.limit)
                    )}
                  >
                    {usage.smsMessages.isUnlimited
                      ? `${usage.smsMessages.used} sent`
                      : `${usage.smsMessages.used} / ${usage.smsMessages.limit}`}
                  </span>
                </div>
                {!usage.smsMessages.isUnlimited && (
                  <Progress
                    value={calculateUsagePercentage(usage.smsMessages.used, usage.smsMessages.limit)}
                  />
                )}
              </div>
            )}

            {/* CRM Contacts */}
            {usage.contacts.limit !== 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CRM Contacts</span>
                  <span
                    className={getUsageColor(
                      calculateUsagePercentage(usage.contacts.used, usage.contacts.limit)
                    )}
                  >
                    {usage.contacts.isUnlimited
                      ? `${usage.contacts.used} contacts`
                      : `${usage.contacts.used} / ${usage.contacts.limit}`}
                  </span>
                </div>
                {!usage.contacts.isUnlimited && (
                  <Progress
                    value={calculateUsagePercentage(usage.contacts.used, usage.contacts.limit)}
                  />
                )}
              </div>
            )}

            {/* Social Posts */}
            {usage.socialPosts.limit !== 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Social Posts</span>
                  <span
                    className={getUsageColor(
                      calculateUsagePercentage(usage.socialPosts.used, usage.socialPosts.limit)
                    )}
                  >
                    {usage.socialPosts.isUnlimited
                      ? `${usage.socialPosts.used} posts`
                      : `${usage.socialPosts.used} / ${usage.socialPosts.limit}`}
                  </span>
                </div>
                {!usage.socialPosts.isUnlimited && (
                  <Progress
                    value={calculateUsagePercentage(usage.socialPosts.used, usage.socialPosts.limit)}
                  />
                )}
              </div>
            )}

            {/* Event Flyers */}
            {usage.flyers.limit !== 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Event Flyers</span>
                  <span
                    className={getUsageColor(
                      calculateUsagePercentage(usage.flyers.used, usage.flyers.limit)
                    )}
                  >
                    {usage.flyers.isUnlimited
                      ? `${usage.flyers.used} created`
                      : `${usage.flyers.used} / ${usage.flyers.limit}`}
                  </span>
                </div>
                {!usage.flyers.isUnlimited && (
                  <Progress
                    value={calculateUsagePercentage(usage.flyers.used, usage.flyers.limit)}
                  />
                )}
              </div>
            )}

            <div className="pt-2 text-xs text-muted-foreground">
              Usage resets on {formatDate(usage.nextResetAt)}
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex gap-2">
        {subscription.tier !== 'team_edition' && (
          <Button onClick={() => onUpgrade?.()} disabled={isLoading}>
            Upgrade Plan
          </Button>
        )}

        {subscription.tier !== 'free' &&
          subscription.billingPeriod &&
          !subscription.billingPeriod.cancelAtPeriodEnd && (
            <Button
              variant="outline"
              onClick={() => handleAction(() => onCancel?.())}
              disabled={isLoading}
            >
              Cancel Subscription
            </Button>
          )}

        {subscription.billingPeriod?.cancelAtPeriodEnd && (
          <Button
            variant="outline"
            onClick={() => handleAction(() => onReactivate?.())}
            disabled={isLoading}
          >
            Reactivate Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
