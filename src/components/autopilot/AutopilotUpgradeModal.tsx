'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutopilotTier, getAutopilotProduct, calculateUpgradePrice } from '@/lib/stripe/autopilot-products';
import { Check, ArrowRight } from 'lucide-react';

interface AutopilotUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: AutopilotTier;
  targetTier: AutopilotTier;
  daysRemainingInCycle?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * AutopilotUpgradeModal Component
 * Shows upgrade details, proration, and feature comparison
 */
export function AutopilotUpgradeModal({
  isOpen,
  onClose,
  currentTier,
  targetTier,
  daysRemainingInCycle = 30,
  onConfirm,
  isLoading = false,
}: AutopilotUpgradeModalProps) {
  const [prorationCost, setProrationCost] = useState(0);

  const currentProduct = getAutopilotProduct(currentTier);
  const targetProduct = getAutopilotProduct(targetTier);

  useEffect(() => {
    if (currentTier !== 'free' && targetTier !== 'free') {
      const cost = calculateUpgradePrice(currentTier, targetTier, daysRemainingInCycle);
      setProrationCost(cost);
    } else {
      setProrationCost(targetProduct.priceCents);
    }
  }, [currentTier, targetTier, daysRemainingInCycle, targetProduct.priceCents]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getNewFeatures = () => {
    // Get features that are in target tier but not in current tier
    return targetProduct.features.filter((targetFeature) => {
      const currentFeature = currentProduct.features.find((f) => f.name === targetFeature.name);
      return !currentFeature?.isIncluded && targetFeature.isIncluded;
    });
  };

  const newFeatures = getNewFeatures();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upgrade to {targetProduct.displayName}</DialogTitle>
          <DialogDescription>{targetProduct.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tier Comparison */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Current Plan</div>
              <Badge className="bg-gray-200 text-gray-800">{currentProduct.displayName}</Badge>
              <div className="text-2xl font-bold mt-2">
                {currentProduct.priceMonthly === 0
                  ? 'Free'
                  : `$${currentProduct.priceMonthly}/mo`}
              </div>
            </div>

            <ArrowRight className="size-8 text-muted-foreground" />

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">New Plan</div>
              <Badge className="bg-primary text-primary-foreground">
                {targetProduct.displayName}
              </Badge>
              <div className="text-2xl font-bold mt-2">${targetProduct.priceMonthly}/mo</div>
            </div>
          </div>

          {/* Proration Info */}
          {currentTier !== 'free' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Prorated Upgrade Cost</h4>
              <p className="text-sm text-blue-800 mb-3">
                You will be charged a prorated amount for the remainder of your current billing
                cycle ({daysRemainingInCycle} days remaining).
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Amount due today:</span>
                <span className="text-2xl font-bold text-blue-900">
                  ${formatPrice(prorationCost)}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Starting next billing cycle, you'll be charged ${targetProduct.priceMonthly}/month
              </p>
            </div>
          )}

          {/* Free Trial Info */}
          {currentTier === 'free' && targetProduct.hasFreeTrial && targetProduct.trialDays && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Free Trial Included</h4>
              <p className="text-sm text-green-800">
                Start your {targetProduct.trialDays}-day free trial today. You won't be charged
                until the trial ends. Cancel anytime during the trial at no cost.
              </p>
            </div>
          )}

          {/* New Features */}
          {newFeatures.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">New Features You'll Get</h4>
              <ul className="space-y-2">
                {newFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="size-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upgrade Highlights */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Upgrade Highlights</h4>
            <div className="grid grid-cols-2 gap-4">
              {targetProduct.limits.emailInvites === -1 && (
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-primary">Unlimited</div>
                  <div className="text-xs text-muted-foreground">Email Invitations</div>
                </div>
              )}
              {targetProduct.limits.smsMessages > 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-primary">
                    {targetProduct.limits.smsMessages === -1
                      ? 'Unlimited'
                      : targetProduct.limits.smsMessages.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">SMS Messages/month</div>
                </div>
              )}
              {targetProduct.limits.crmContacts > 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-primary">
                    {targetProduct.limits.crmContacts === -1
                      ? 'Unlimited'
                      : targetProduct.limits.crmContacts.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">CRM Contacts</div>
                </div>
              )}
              {targetProduct.limits.socialPosts > 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-primary">
                    {targetProduct.limits.socialPosts === -1
                      ? 'Unlimited'
                      : targetProduct.limits.socialPosts}
                  </div>
                  <div className="text-xs text-muted-foreground">Social Posts/month</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? 'Processing...'
              : currentTier === 'free' && targetProduct.hasFreeTrial
              ? 'Start Free Trial'
              : 'Confirm Upgrade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
