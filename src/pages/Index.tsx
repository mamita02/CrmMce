// src/pages/Index.tsx

import { Hero } from "@/components/shared/Hero";
import { Showcase } from "@/components/shared/Showcase";
import { Footer } from "@/components/layout/Footer";  // ✅ Ajoute

export const Index = () => (
  <div>
    <Hero />
    <section id="showcase">  {/* ✅ Ajoute id ici */}
      <Showcase />
    </section>
    <Footer />  {/* ✅ Ajoute */}
  </div>
);
    </div>
  );
};

export default Index;
