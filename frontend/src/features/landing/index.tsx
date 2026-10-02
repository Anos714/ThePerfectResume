import { Navbar } from "./navbar/navbar";
import { Hero } from "./hero/hero";
import { Features } from "./features/features";
import { Testimonials } from "./testimonials/testimonials";
import { Pricing } from "./pricing/pricing";
import { FAQ } from "./faq/faq";
import { CTA } from "./cta/cta";
import { Footer } from "./footer/footer";

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
