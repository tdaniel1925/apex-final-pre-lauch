'use client';

import Image from 'next/image';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Bill Propper',
      role: 'CEO, Apex Affinity Group',
      image: '/images/author-1.jpg',
      rating: 5,
      text: 'Our 5×7 forced matrix system creates true wealth-building opportunities. When your team succeeds, you succeed - it\'s that simple.'
    },
    {
      name: 'Darrell Wolfe',
      role: 'Top Distributor',
      image: '/images/author-2.jpg',
      rating: 5,
      text: 'The matrix spillover benefits are incredible. I\'ve seen agents build substantial passive income streams through the 6-generation override structure.'
    },
    {
      name: 'Johnathon Bunch',
      role: 'Senior Leader',
      image: '/images/author-3.jpg',
      rating: 5,
      text: 'This organization is built on integrity and helping agents achieve financial freedom. The support and training are second to none.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#DC2626] font-semibold text-sm uppercase tracking-wide mb-4 block">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What Our Leaders Say
          </h2>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            Hear from successful agents and leaders who are building wealth with Apex Affinity Group
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#DC2626]/50 transition-all"
            >
              <div className="flex gap-1 text-[#DC2626] mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/90 mb-8 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-white/70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
