'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllAutopilotProducts, AutopilotTier } from '@/lib/stripe/autopilot-products';
import { Check } from 'lucide-react';

interface AutopilotPricingCardsProps {
  currentTier?: AutopilotTier;
  onSubscribe: (tier: AutopilotTier) => void;
  isLoading?: boolean;
}

/**
 * AutopilotPricingCards Component
 * Displays all 4 autopilot tiers as pricing cards
 */
export function AutopilotPricingCards({
  currentTier = 'free',
  onSubscribe,
  isLoading = false,
}: AutopilotPricingCardsProps) {
  const [loadingTier, setLoadingTier] = useState<AutopilotTier | null>(null);
  const products = getAllAutopilotProducts();

  const handleSubscribe = async (tier: AutopilotTier) => {
    if (tier === 'free' || tier === currentTier) return;

    setLoadingTier(tier);
    try {
      await onSubscribe(tier);
    } finally {
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tier: AutopilotTier) => tier === currentTier;
  const canUpgrade = (tier: AutopilotTier) => {
    const tiers: AutopilotTier[] = ['free', 'social_connector', 'lead_autopilot_pro', 'team_edition'];
    const currentIndex = tiers.indexOf(currentTier);
    const tierIndex = tiers.indexOf(tier);
    return tierIndex > currentIndex;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product.tier}
          className={`relative ${
            product.isPopular
              ? 'border-2 border-primary shadow-lg'
              : isCurrentPlan(product.tier)
              ? 'border-2 border-green-500'
              : ''
          }`}
        >
          {product.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">{product.badge}</Badge>
            </div>
          )}

          {isCurrentPlan(product.tier) && (
            <div className="absolute -top-3 right-4">
              <Badge className="bg-green-500 text-white">Current Plan</Badge>
            </div>
          )}

          <CardHeader className="pt-8">
            <CardTitle className="text-xl">{product.displayName}</CardTitle>
            <CardDescription className="min-h-[40px]">{product.description}</CardDescription>
            <div className="pt-4">
              {product.priceMonthly === 0 ? (
                <div className="text-3xl font-bold">Free</div>
              ) : (
                <div>
                  <div className="text-3xl font-bold">${product.priceMonthly}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              )}
              {product.hasFreeTrial && product.trialDays && (
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800">{product.trialDays}-day free trial</Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check
                    className={`size-4 mt-0.5 ${
                      feature.isIncluded ? 'text-green-600' : 'text-gray-300'
                    }`}
                  />
                  <div className="flex-1">
                    <div
                      className={`text-sm ${
                        feature.isIncluded ? 'text-foreground' : 'text-muted-foreground line-through'
                      }`}
                    >
                      {feature.name}
                    </div>
                    {feature.description && feature.isIncluded && (
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            {isCurrentPlan(product.tier) ? (
              <Button className="w-full" disabled>
                Current Plan
              </Button>
            ) : product.tier === 'free' ? (
              <Button className="w-full" variant="outline" disabled>
                Free Forever
              </Button>
            ) : canUpgrade(product.tier) ? (
              <Button
                className="w-full"
                onClick={() => handleSubscribe(product.tier)}
                disabled={isLoading || loadingTier !== null}
              >
                {loadingTier === product.tier ? 'Processing...' : 'Subscribe Now'}
              </Button>
            ) : (
              <Button className="w-full" variant="outline" disabled>
                Downgrade Available
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
