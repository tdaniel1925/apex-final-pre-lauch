'use client';

import Image from 'next/image';

export default function AboutStats() {
  const stats = [
    {
      label: 'Clients Served Successfully',
      value: '320+',
      description: 'Helping businesses across industries achieve financial clarity and sustainable growth.'
    },
    {
      label: 'Client Retention Rate',
      value: '98%',
      description: 'Our Client Retention Rate highlights building lasting relationships, ensuring success.'
    },
    {
      label: 'Dollars in Investments Managed',
      value: '$10M+',
      description: 'Over $10M in investments carefully managed to maximize growth & secure our clients.'
    },
    {
      label: 'Expert Financial Advisors',
      value: '100+',
      description: 'Our 100+ expert financial advisors guide you with precision.'
    }
  ];

  return (
    <section className="py-24 bg-[#F5F5F5]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#DC2626] font-semibold text-sm uppercase tracking-wide mb-4 block">
            About Our Construction
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B4C7E] mb-6 max-w-4xl mx-auto">
            Expert financial and business consulting built on trust, precision, and proven results
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <span className="text-sm text-[#DC2626] font-medium">{stat.label}</span>
              </div>
              <h3 className="text-5xl font-bold text-[#2B4C7E] mb-4">{stat.value}</h3>
              <p className="text-[#4B5563] text-sm leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-lg text-[#4B5563]">
              Join our team and help weave innovation, quality, and success together worldwide.
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-3xl font-bold text-[#2B4C7E]">4.9/5</span>
              <div className="flex gap-1 text-[#DC2626]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-[#4B5563]">Our 4200 Review</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
