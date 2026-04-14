import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { KaszekMarquee } from '@/components/landing/KaszekMarquee';
import { SponsorStrip } from '@/components/landing/SponsorStrip';
import { ProblemSection } from '@/components/landing/ProblemStats';
import { LifecycleSection } from '@/components/landing/LifecycleSwitcher';
import { ClaudePhasesSection } from '@/components/landing/ClaudePhasesFlow';
import { WhatsAppSection } from '@/components/landing/WhatsAppDemo';
import { UseCasesSection } from '@/components/landing/UseCasesGrid';
import { RevenueMockupSection } from '@/components/landing/RevenueMockup';
import { DifferentiationSection } from '@/components/landing/DifferentiationTable';
import { MandamientosCTASection } from '@/components/landing/MandamientosCTA';
import { LandingReveal } from '@/components/landing/LandingReveal';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <main
      data-theme="kaszek"
      className="relative min-h-screen w-full bg-[#faf8f4] text-[#151411] k-grain"
    >
      <LandingReveal />
      <LandingHeader />
      <LandingHero />
      <KaszekMarquee />
      <ProblemSection />
      <LifecycleSection />
      <ClaudePhasesSection />
      <WhatsAppSection />
      <UseCasesSection />
      <RevenueMockupSection />
      <DifferentiationSection />
      <MandamientosCTASection />
      <SponsorStrip />
      <LandingFooter />
    </main>
  );
}
