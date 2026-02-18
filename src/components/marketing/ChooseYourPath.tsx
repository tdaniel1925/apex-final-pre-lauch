import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChooseYourPath() {
  return (
    <section id="choose-path" className="py-24 bg-gradient-to-b from-white to-[#F5F7FA]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#DC2626]/10 text-[#DC2626] rounded-full text-sm font-semibold mb-4">
            YOUR PATHWAY TO SUCCESS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B4C7E] mb-6">
            Choose Your Path to Financial Freedom
          </h2>
          <p className="text-lg text-[#4B5563] max-w-3xl mx-auto leading-relaxed">
            Whether you're starting fresh or bringing experience, we've designed the perfect journey for your success story.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* New to Insurance Card */}
          <div className="group relative bg-white border-4 border-[#2B4C7E] rounded-3xl p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#DC2626] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </span>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6 mt-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-3xl font-bold text-[#2B4C7E] mb-4 text-center">
              New to Insurance
            </h3>

            {/* Subtitle */}
            <p className="text-[#4B5563] text-center mb-8 leading-relaxed">
              Start earning today with ancillary products while we guide you through licensing, training, and building your insurance business.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">Start Earning Immediately</p>
                  <p className="text-sm text-[#4B5563]">Sell telemedicine, roadside assistance, and identity theft protection before licensing</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">Full Licensing Support</p>
                  <p className="text-sm text-[#4B5563]">We guide you through every step of getting licensed in your state</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">Comprehensive Training</p>
                  <p className="text-sm text-[#4B5563]">Sales techniques, product knowledge, and business building skills</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">Personal Mentor</p>
                  <p className="text-sm text-[#4B5563]">One-on-one guidance from experienced agents in your upline</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button asChild className="w-full bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] hover:from-[#1a2c4e] hover:to-[#2B4C7E] text-white py-6 text-lg font-semibold shadow-lg">
              <Link href="/newcomers">Begin Your Journey →</Link>
            </Button>
          </div>

          {/* Licensed Agent Card */}
          <div className="group relative bg-white border-4 border-[#2B4C7E] rounded-3xl p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-3xl font-bold text-[#2B4C7E] mb-4 text-center">
              Licensed Agent
            </h3>

            {/* Subtitle */}
            <p className="text-[#4B5563] text-center mb-8 leading-relaxed">
              Leverage your experience with superior rates, advanced tools, and a revolutionary compensation structure.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">100% Book Ownership</p>
                  <p className="text-sm text-[#4B5563]">Your clients, your business, forever</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">Up to 100% Commissions</p>
                  <p className="text-sm text-[#4B5563]">Industry-leading rates directly from carriers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">AI CoPilot CRM</p>
                  <p className="text-sm text-[#4B5563]">Automate follow-ups and close more deals</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2B4C7E]">Team Development Bonuses</p>
                  <p className="text-sm text-[#4B5563]">Earn additional income when you help others succeed</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button asChild className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#DC2626] text-white py-6 text-lg font-semibold shadow-lg">
              <Link href="/licensed-agents">Accelerate Your Success →</Link>
            </Button>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-[#4B5563] text-lg">
            <span className="font-semibold text-[#DC2626]">100% Free to Join.</span> No monthly fees. No hidden costs.
          </p>
        </div>
      </div>
    </section>
  );
}
