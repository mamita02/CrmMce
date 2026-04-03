import { Hero } from "@/components/landing/Hero";
import { Showcase } from "@/components/landing/Showcase";
import { Footer } from "@/components/layout/Footer";

export const Index = () => (
  <div>
    <Hero />
    <section id="showcase">  {/* ✅ Ajoute id ici */}
      <Showcase />
    </section>
    <Footer />
  </div>
);
