'use client';

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Do I need an insurance license to start earning?',
      answer: 'No! You can begin earning immediately selling ancillary products like telemedicine, roadside assistance, identity theft protection, and legal services - no license required. If you want to sell insurance products, we provide full support to help you get licensed.'
    },
    {
      question: 'Is this multi-level marketing or a pyramid scheme?',
      answer: 'No. This is a legitimate insurance marketing organization (IMO). You earn commissions from selling real insurance and ancillary products to customers. The team-building component is optional - you can succeed by just selling products directly. Team bonuses are simply additional income for helping others build their business.'
    },
    {
      question: 'What are the costs to join?',
      answer: 'Zero. No joining fees, no monthly dues, no software fees, no hidden costs. You get access to all training, tools, and support completely free. The only optional expense is state licensing fees if you choose to become licensed to sell insurance.'
    },
    {
      question: 'Do I own my clients and renewals?',
      answer: 'Yes, 100%. Every client you bring in belongs to you forever. If you ever leave Apex, you take your entire book of business with you. Your clients, your renewals, your business.'
    },
    {
      question: 'What if I already have an insurance license?',
      answer: 'Perfect! You can start immediately with carrier appointments and full commission contracts. Licensed agents often see the biggest benefit from joining because you can leverage our tools and team-building bonuses right away.'
    },
    {
      question: 'How much can I earn?',
      answer: 'Your income depends entirely on your effort and sales volume. You earn commissions on every product you sell, plus optional bonuses when you help build a team. Some agents sell part-time for supplemental income, while others build full-time six-figure businesses.'
    },
    {
      question: 'What kind of support and training do you provide?',
      answer: 'You get access to live training sessions, recorded workshops, product knowledge courses, sales scripts, marketing materials, and one-on-one mentorship from experienced agents. Plus our AI-powered CRM handles follow-ups and automation for you.'
    },
    {
      question: 'Can I do this part-time?',
      answer: 'Absolutely. Many of our successful agents started part-time while keeping their day job. You work your own hours and build at your own pace. The ancillary products can be sold evenings and weekends.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#DC2626]/10 text-[#DC2626] rounded-full text-sm font-semibold mb-4">
            QUESTIONS ANSWERED
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B4C7E] mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[#4B5563] max-w-3xl mx-auto leading-relaxed">
            Get clear answers to the most common questions about joining Apex Affinity Group
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-[#2B4C7E]/10 rounded-xl overflow-hidden hover:border-[#2B4C7E]/30 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-[#2B4C7E] text-lg pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-[#DC2626] flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-[#4B5563] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-[#4B5563] mb-4">Still have questions?</p>
          <button className="text-[#DC2626] font-semibold hover:underline">
            Contact our team →
          </button>
        </div>
      </div>
    </section>
  );
}
