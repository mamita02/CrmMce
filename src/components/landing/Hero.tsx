import { Button } from "@/components/ui/button";
import { ArrowRight, Users, FolderKanban, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => (
  <div className="flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105">
    <div className="p-3 rounded-xl bg-accent/20 text-accent mb-3">
      {icon}
    </div>
    <span className="text-4xl font-bold font-display text-white mb-1">{value}</span>
    <span className="text-sm text-white/70">{label}</span>
  </div>
);

export const Hero = () => {
  // Ces données seront dynamiques depuis Supabase
  const stats = {
    employees: 12,
    projects: 48,
    poles: 4,
  };

  return (
    <section className="hero-section min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-display font-bold text-white">AgenceCRM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">
              Connexion
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="hero-outline" size="lg">
              Inscription
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Plateforme de gestion d'agence
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Gérez votre agence
            <span className="block gradient-text-accent">en toute simplicité</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Centralisez vos leads, clients, projets et équipes dans une seule plateforme. 
            Optimisez votre productivité et développez votre activité.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/showcase">
              <Button variant="hero-outline" size="xl">
                Voir nos réalisations
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={stats.employees.toString()}
            label="Employés"
          />
          <StatCard
            icon={<FolderKanban className="w-6 h-6" />}
            value={stats.projects.toString()}
            label="Projets"
          />
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            value={stats.poles.toString()}
            label="Pôles"
          />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
    </section>
  );
};
