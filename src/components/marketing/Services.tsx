import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Services() {
  const services = [
    {
      icon: '/images/icon-service-item-1.svg',
      bg: '/images/service-item-bg-shape-1.png',
      title: 'Financial Planning',
      description: 'Get expert guidance to streamline operations, solve challenges.',
      link: '/services/financial-planning'
    },
    {
      icon: '/images/icon-service-item-2.svg',
      bg: '/images/service-item-bg-shape-2.png',
      title: 'Business Consulting',
      description: 'Create a clear roadmap for long-term financial success.',
      link: '/services/business-consulting'
    },
    {
      icon: '/images/icon-service-item-3.svg',
      bg: '/images/service-item-bg-shape-3.png',
      title: 'Investment Advisory',
      description: 'Make smarter investment decisions with personalized strategies.',
      link: '/services/investment-advisory'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#DC2626] font-semibold text-sm uppercase tracking-wide mb-4 block">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B4C7E] mb-6">
            Smart Solutions for Businesses
          </h2>
          <p className="text-[#4B5563] text-lg max-w-3xl mx-auto">
            Our expert-led services are thoughtfully designed to support sustainable growth.
            By combining strategic insight, financial expertise, and personalized solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-[#F5F5F5] to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#DC2626]/10 rounded-xl flex items-center justify-center group-hover:bg-[#DC2626] transition-colors">
                  <Image src={service.icon} alt={service.title} width={32} height={32} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#2B4C7E] mb-4">
                {service.title}
              </h3>
              <p className="text-[#4B5563] mb-6">{service.description}</p>
              <Link
                href={service.link}
                className="text-[#DC2626] font-semibold hover:text-[#2B4C7E] transition-colors inline-flex items-center gap-2"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}

          {/* Contact CTA Box */}
          <div className="bg-gradient-to-br from-[#DC2626] to-[#2B4C7E] rounded-2xl p-8 text-white flex flex-col justify-between">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
              <p className="opacity-90">
                Stay compliant and optimize your tax structure through planning.
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-2">Call Us:</p>
              <a
                href="tel:+1234567890"
                className="text-2xl font-bold hover:opacity-80 transition-opacity"
              >
                +(123) 456 - 789
              </a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg text-[#4B5563]">
            <span className="text-[#DC2626] font-semibold">Free</span> Let's make something great work together -{' '}
            <Link href="/services" className="text-[#DC2626] font-semibold hover:underline">
              View all services.
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
