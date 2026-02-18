// =============================================
// Tier Comparison Table Component
// Shows pricing tiers for AgentPulse
// =============================================

export default function TierComparison() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Try it out',
      features: [
        '25 leads',
        'Basic reminders',
        'Email only',
        'Limited features',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Starter',
      price: '$49',
      period: 'per month',
      description: 'For growing agents',
      features: [
        '500 leads',
        'Email drip sequences (5)',
        '250 policies tracked',
        'Review automation',
        'Basic PulseInsight',
      ],
      cta: 'Join Waitlist',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$99',
      period: 'per month',
      description: 'Most popular',
      features: [
        '2,500 leads',
        'Email + SMS sequences (unlimited)',
        '1,000 policies + cross-sell radar',
        'Full AI AgentPilot',
        'Referral automation',
        'PulseInsight with AI chat',
      ],
      cta: 'Join Waitlist',
      highlighted: true,
    },
    {
      name: 'Elite',
      price: '$199',
      period: 'per month',
      description: 'Everything included',
      features: [
        'Unlimited leads',
        'All Pro features',
        'AI Voice Agent (120 min/mo)',
        'White-label branding',
        'Priority support',
        'Advanced analytics',
      ],
      cta: 'Join Waitlist',
      highlighted: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
            tier.highlighted
              ? 'border-[#2B4C7E] ring-4 ring-blue-50'
              : 'border-gray-200'
          }`}
        >
          {tier.highlighted && (
            <div className="bg-[#2B4C7E] text-white text-center py-2 text-sm font-semibold">
              ⭐ Most Popular
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{tier.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
              <span className="text-gray-600 text-sm ml-2">{tier.period}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                tier.highlighted
                  ? 'bg-[#2B4C7E] text-white hover:bg-[#1e3555]'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {tier.cta}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
