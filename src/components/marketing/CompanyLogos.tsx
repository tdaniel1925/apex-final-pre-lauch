import Image from 'next/image';

export default function CompanyLogos() {
  const logos = [
    '/images/company-supports-logo-1.svg',
    '/images/company-supports-logo-2.svg',
    '/images/company-supports-logo-3.svg',
    '/images/company-supports-logo-4.svg',
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#DC2626]/10 to-[#2B4C7E]/10 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <h3 className="text-2xl font-bold text-[#2B4C7E] md:min-w-fit whitespace-nowrap">
              Trusted By Leading Businesses Worldwide
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-8 md:gap-12">
              {logos.map((logo, index) => (
                <div key={index} className="opacity-60 hover:opacity-100 transition-opacity">
                  <Image src={logo} alt="Company logo" width={120} height={40} className="h-10 w-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
