import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { PlatformLogos } from "@/components/landing/PlatformLogos";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { WhySection } from "@/components/landing/WhySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PlaylistCTASection } from "@/components/landing/PlaylistCTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ScrollToTopButton } from "@/components/landing/ScrollToTopButton";

export const DesktopLanding = () => {
  return (
    <div className="min-h-screen bg-black">
      <LandingNav />
      <HeroSection />
      <PlatformLogos />
      <ServicesSection />
      <WhySection />
      <TestimonialsSection />
      <PlaylistCTASection />
      <LandingFooter />
      <ScrollToTopButton />
    </div>
  );
};
