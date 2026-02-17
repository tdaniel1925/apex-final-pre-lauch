import Header from '@/components/marketing/Header';
import Hero from '@/components/marketing/Hero';
import StatsSection from '@/components/marketing/StatsSection';
import ChooseYourPath from '@/components/marketing/ChooseYourPath';
import GettingStarted from '@/components/marketing/GettingStarted';
import Testimonials from '@/components/marketing/Testimonials';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <StatsSection />
      <ChooseYourPath />
      <GettingStarted />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
