import { Hero } from "@/components/landing/Hero";
import { Showcase } from "@/components/landing/Showcase";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Showcase />
      
      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-display font-bold">AgenceCRM</span>
          </div>
          <p className="text-background/60 text-sm">
            © 2024 AgenceCRM. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
