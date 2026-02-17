export default function StatsSection() {
  const stats = [
    {
      label: 'Active Members',
      value: '1,247+',
      description: 'Agents building their business with Apex across multiple countries'
    },
    {
      label: 'Years Track Record',
      value: '5',
      description: 'Proven system helping agents achieve financial success'
    },
    {
      label: 'Countries',
      value: '12',
      description: 'International presence with agents worldwide'
    },
    {
      label: 'Commission Rate',
      value: '100%',
      description: 'Top earners receiving maximum commission payouts'
    }
  ];

  return (
    <section className="py-24 bg-[#F5F7FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <span className="text-[#DC2626] font-semibold text-sm uppercase tracking-wide mb-4 block">
            Our Track Record
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B4C7E] mb-6">
            Building Wealth Through Insurance Excellence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-[#2B4C7E]/10"
            >
              <div className="mb-2">
                <span className="text-sm text-[#DC2626] font-medium uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <h3 className="text-5xl md:text-6xl font-bold text-[#2B4C7E] mb-4">
                {stat.value}
              </h3>
              <p className="text-[#4B5563] text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-[#2B4C7E]/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-lg text-[#4B5563] text-center md:text-left">
              Join our growing network of successful insurance professionals building financial freedom.
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
              <span className="text-[#4B5563] whitespace-nowrap">Based on 4200 Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
