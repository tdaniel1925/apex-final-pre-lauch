export default function GettingStarted() {
  const steps = [
    {
      number: 1,
      title: 'Join Online',
      description: 'Join the Apex network in just 5 minutes. No upfront fees, no hidden costs - just your commitment to success.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Get Licensed',
      description: 'We guide you through every step of obtaining your state insurance license. Our team provides study materials, practice exams, and one-on-one support.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Complete Training',
      description: 'Learn our proven sales systems and strategies from top-performing agents. Access live training sessions, recorded workshops, and our comprehensive knowledge base.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      number: 4,
      title: 'Set Up Your Tools',
      description: 'Get instant access to our AI-powered CRM, carrier appointments, marketing materials, and sales automation tools. Everything you need to hit the ground running.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      number: 5,
      title: 'Start Selling & Earning',
      description: 'Begin writing policies, earning commissions, and building your team. Watch your income grow through direct sales and team overrides.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-[#DC2626]/20 text-[#DC2626] rounded-full text-sm font-semibold mb-4">
            YOUR JOURNEY STARTS HERE
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Getting Started is Easy
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Five simple steps to launch your insurance career and start building wealth with Apex Affinity Group
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto relative">
          {/* Center Line - Hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#DC2626] via-[#DC2626]/50 to-[#DC2626]" />

          {/* Steps */}
          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Mobile Timeline Line */}
                <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-[#DC2626]/30" />

                {/* Step Container */}
                <div className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-16 md:pl-0`}>
                    <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] text-white rounded-xl mb-4 group-hover:scale-110 transition-transform ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                        {step.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-[#2B4C7E] mb-3">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[#4B5563] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Circle Indicator */}
                  <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center z-10">
                    <div className="relative">
                      {/* Outer Ring */}
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#DC2626] flex items-center justify-center shadow-lg">
                        {/* Inner Circle */}
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center">
                          <span className="text-lg md:text-xl font-bold text-[#DC2626]">
                            {step.number}
                          </span>
                        </div>
                      </div>

                      {/* Pulse Animation */}
                      <div className="absolute inset-0 rounded-full bg-[#DC2626] animate-ping opacity-20" />
                    </div>
                  </div>

                  {/* Spacer for Desktop */}
                  <div className="hidden md:block w-5/12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-white/90 text-lg mb-6">
            Ready to start your journey to financial freedom?
          </p>
          <button className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            Join Apex Today →
          </button>
        </div>
      </div>
    </section>
  );
}
