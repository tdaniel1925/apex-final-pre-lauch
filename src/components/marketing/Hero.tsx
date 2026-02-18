'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center bg-gradient-to-br from-[#1a2c4e] via-[#2B4C7E] to-[#3d5a7f] overflow-hidden">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-20 h-full flex items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-7">
              <div className="space-y-3 lg:space-y-4">
                <span className="inline-block text-[#DC2626] font-semibold text-xs md:text-sm tracking-wide uppercase">
                  The Apex Way
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                  More Carriers. Better Technology. Higher Commissions.
                </h1>
                <p className="text-base md:text-lg text-white/90 leading-snug pr-4 lg:pr-12">
                  Join 1,247+ agents with access to 7 premier carriers, up to 100% commissions, AI-powered CRM, and a 6-generation team override structure. Free to join.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 lg:pt-4">
                  <Button
                    asChild
                    className="bg-[#DC2626] hover:bg-gradient-to-r hover:from-[#DC2626] hover:to-[#B91C1C] text-white px-5 py-3 lg:px-7 lg:py-4 text-sm lg:text-base"
                  >
                    <Link href="#choose-path">Choose Your Path</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#2B4C7E] px-5 py-3 lg:px-7 lg:py-4 text-sm lg:text-base"
                  >
                    <Link href="#why-apex">Why Apex</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Box - Extended to Right Edge */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[45%] max-w-2xl">
          <div className="bg-white rounded-3xl rounded-r-none overflow-hidden shadow-2xl">
            <div className="relative aspect-square">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/videos/flag-waving.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Mobile Video */}
        <div className="lg:hidden container mx-auto px-4 mt-8">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto">
            <div className="relative aspect-square">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/videos/flag-waving.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
