export default function WhyApex() {
  const carriers = [
    'Columbus Life',
    'AIG',
    'F&G',
    'Mutual of Omaha',
    'National Life Group',
    'Symetra',
    'North American'
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '7 Premier Carriers',
      description: 'Access to Columbus Life, AIG, F&G, Mutual of Omaha, National Life Group, Symetra, and North American'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '50-100% Commissions',
      description: 'Earn industry-leading commissions paid directly by carriers with no hidden fees or deductions'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'AI-Powered CoPilot CRM',
      description: 'Optional CRM with automated follow-up, multi-carrier quoting, and lead scoring ($49-$199/month)'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: '6-Generation Overrides',
      description: 'Team override structure: 15%, 10%, 5%, 2%, 1%, 0.5% - build passive income through your network'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: '100% Book Ownership',
      description: 'You own your clients forever. No hidden contracts, no surrender of your hard-earned business'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Zero Fees',
      description: 'Free to join, no monthly desk fees, no hidden costs. Keep 100% of what you earn'
    }
  ];

  return (
    <section id="why-apex" className="py-24 bg-gradient-to-b from-white to-[#F5F7FA]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B4C7E] mb-6">
            Insurance, Done Right
          </h2>
          <p className="text-lg text-[#4B5563] max-w-3xl mx-auto mb-8">
            An independent marketing organization providing agents with superior carrier access,
            technology, and commissions compared to captive agencies.
          </p>
        </div>

        {/* Carriers Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#2B4C7E] text-center mb-8">Our Premier Carrier Partners</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {carriers.map((carrier, index) => (
              <div
                key={index}
                className="bg-white border-2 border-[#2B4C7E]/10 rounded-xl px-6 py-4 text-[#2B4C7E] font-semibold hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
              >
                {carrier}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-[#2B4C7E]/10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] rounded-2xl flex items-center justify-center text-white mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#2B4C7E] mb-3">{feature.title}</h3>
              <p className="text-[#4B5563] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
