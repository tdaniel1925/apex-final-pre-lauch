import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2B4C7E] text-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-12">
            <div className="max-w-2xl">
              <Image
                src="/images/apex-logo.png"
                alt="Apex Affinity Group"
                width={200}
                height={60}
                className="h-14 w-auto mb-6 brightness-0 invert"
              />
              <p className="text-white/70 text-lg leading-relaxed">
                We provide expert financial advisory and business consulting services designed to help
                individuals and companies achieve long-term stability, growth, and success.
              </p>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Subscribe Our Newsletter</h3>
                <p className="text-white/70">
                  Stay informed with the latest financial insights, business tips, and industry updates.
                </p>
              </div>

              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Address *"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#DC2626]"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#DC2626] hover:bg-[#DC2626]/90 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  Subscribe Now
                </button>
              </form>

              <div>
                <h4 className="text-sm font-semibold mb-3">Follow Us On Socials:</h4>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#DC2626] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#DC2626] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#DC2626] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-white/70 hover:text-[#DC2626] transition-colors">Home</Link></li>
                  <li><Link href="/about" className="text-white/70 hover:text-[#DC2626] transition-colors">About Us</Link></li>
                  <li><Link href="/services" className="text-white/70 hover:text-[#DC2626] transition-colors">Services</Link></li>
                  <li><Link href="/contact" className="text-white/70 hover:text-[#DC2626] transition-colors">Contact Us</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Our Services</h4>
                <ul className="space-y-2">
                  <li><Link href="/services" className="text-white/70 hover:text-[#DC2626] transition-colors">Financial Planning</Link></li>
                  <li><Link href="/services" className="text-white/70 hover:text-[#DC2626] transition-colors">Business Consulting</Link></li>
                  <li><Link href="/services" className="text-white/70 hover:text-[#DC2626] transition-colors">Investment Advisory</Link></li>
                  <li><Link href="/opportunity" className="text-white/70 hover:text-[#DC2626] transition-colors">Join Our Team</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Contact Info</h4>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <a href="tel:+1234567890" className="hover:text-[#DC2626] transition-colors">
                      +(123) 456 - 789
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@apexaffinity.com" className="hover:text-[#DC2626] transition-colors">
                      info@apexaffinity.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} Apex Affinity Group. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-white/60 hover:text-[#DC2626] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/60 hover:text-[#DC2626] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
