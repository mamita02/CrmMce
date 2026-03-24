import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import {
  CheckSquare,
  Clock,
  FolderKanban,
  UserCheck,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

// --- Types ---
interface CountryStat {
  country: string;
  count: number;
}

interface DashboardState {
  stats: any;
  activities: any[];
  upcomingProjects: any[];
  countries: CountryStat[];
}

// --- Composant StatCard ---
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon }: StatCardProps) => (
  <div className="stat-card bg-card p-6 rounded-xl border border-border shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-primary/10">
        {icon}
      </div>
      {change && (
        <span className={`text-sm font-medium ${
          changeType === "positive" ? "text-success" : 
          changeType === "negative" ? "text-destructive" : 
          "text-muted-foreground"
        }`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold font-display text-foreground mb-1">{value}</h3>
    <p className="text-sm text-muted-foreground">{title}</p>
  </div>
);

const Dashboard = () => {
  const { displayName } = useProfile();
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: stats } = await supabase.from('dashboard_stats').select('*').single();

      const { data: activities } = await supabase
        .from('recent_activity')
        .select('*')
        .limit(6);

      // ✅ VERSION ULTRA PRO DEADLINES
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const next3 = new Date();
      next3.setDate(today.getDate() + 3);
      const next3Str = next3.toISOString().split('T')[0];

      const next7 = new Date();
      next7.setDate(today.getDate() + 7);
      const next7Str = next7.toISOString().split('T')[0];

      const { data: projects } = await supabase
        .from('projects')
        .select('name, deadline')
        .eq('status', 'en_cours')
        .not('deadline', 'is', null)
        .lte('deadline', next7Str)
        .order('deadline', { ascending: true });

      const categorized = (projects || []).map((p: any) => {
        const deadline = new Date(p.deadline);

        if (deadline < today) {
          return { ...p, level: "overdue" };
        }

        if (deadline <= next3) {
          return { ...p, level: "urgent" };
        }

        return { ...p, level: "soon" };
      });

      const { data: countryData } = await supabase
        .from('clients')
        .select('country');
      
      const countryCounts = (countryData || []).reduce((acc: any, curr: any) => {
        const country = curr.country || "Non défini";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const formattedCountries = Object.keys(countryCounts).map(key => ({
        country: key,
        count: countryCounts[key]
      })).sort((a, b) => b.count - a.count).slice(0, 3);

      setData({
        stats,
        activities: activities || [],
        upcomingProjects: categorized,
        countries: formattedCountries
      });

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-center font-display text-muted-foreground">Initialisation du tableau de bord...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, <span className="text-primary font-medium">{displayName}</span>. Voici l'état de votre activité en temps réel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Leads totaux" value={data?.stats?.total_Leads || "0"} change={`+${data?.stats?.new_Leads} nouveaux`} changeType="positive" icon={<Users className="w-6 h-6 text-primary" />} />
          <StatCard title="Clients confirmés" value={data?.stats?.confirmed_clients || "0"} change={`sur ${data?.stats?.total_clients}`} icon={<UserCheck className="w-6 h-6 text-primary" />} />
          <StatCard title="Projets actifs" value={data?.stats?.active_projects || "0"} change={`/${data?.stats?.total_projects} total`} icon={<FolderKanban className="w-6 h-6 text-primary" />} />
          <StatCard title="Tâches en attente" value={data?.stats?.pending_tasks || "0"} change={data?.stats?.overdue_tasks > 0 ? `${data?.stats?.overdue_tasks} en retard` : "À jour"} changeType={data?.stats?.overdue_tasks > 0 ? "negative" : "positive"} icon={<CheckSquare className="w-6 h-6 text-primary" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Activité récente dans les 24h</h2>
            <div className="space-y-4">
              {data?.activities.map((act: any) => (
                <div key={act.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50">
                  <div className={`p-2 rounded-lg ${act.type === 'Leads' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>
                    {act.type === 'Leads' ? <Users size={16} /> : <CheckSquare size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{act.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(act.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">Échéances proches</h3>
              </div>

              <div className="space-y-3">
                {data?.upcomingProjects.length ? data.upcomingProjects.map((p: any, i: number) => {

                  let colorClass = "";
                  let badge = "";

                  if (p.level === "overdue") {
                    colorClass = "text-destructive";
                    badge = "🔴 En retard";
                  } else if (p.level === "urgent") {
                    colorClass = "text-orange-500";
                    badge = "🟠 Urgent";
                  } else {
                    colorClass = "text-warning";
                    badge = "🟡 Bientôt";
                  }

                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[140px]">{p.name}</span>
                        <span className={`text-xs font-semibold ${colorClass}`}>
                          {badge}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${colorClass}`}>
                        {new Date(p.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted-foreground italic">Aucune échéance critique.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;