import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils"; // Import manquant pour l'historique
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths
} from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// --- TYPES ---
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  type: "task" | "deadline" | "reminder";
  project_id?: string;
  is_overdue: boolean;
  reminder_time_before: number;
}

const eventTypeColors = {
  task: "bg-blue-50 text-blue-700 border-blue-200",
  deadline: "bg-red-50 text-red-700 border-red-200",
  reminder: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overdueEvents, setOverdueEvents] = useState<CalendarEvent[]>([]);
  const [showOverduePopup, setShowOverduePopup] = useState(false);

  // --- LOGIQUE HISTORIQUE ---
  const maintenant = new Date();
const uneSemaineAvant = subDays(maintenant, 7);

const historiqueRecent = events.filter(event => {
  const dateEvent = new Date(event.start_date);
  // On prend ce qui est entre "il y a 7 jours" et "maintenant tout de suite"
  return isAfter(dateEvent, uneSemaineAvant) && isBefore(dateEvent, maintenant);
});

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "task" as const,
    project_id: "none",
    reminder_before: "0"
  });

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: evData } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id);

    const { data: prData } = await supabase
        .from('projects')
        .select('id, name');

    if (prData) {
        setProjects(prData as { id: string; name: string }[]);
    }

    if (evData) {
      const now = new Date();
      const enriched = evData.map(e => ({
        ...e,
        is_overdue: isBefore(new Date(e.start_date), now) && e.type === 'deadline'
      }));
      setEvents(enriched);

      const overdue = enriched.filter(e => e.is_overdue);
      if (overdue.length > 0) {
        setOverdueEvents(overdue);
        setShowOverduePopup(true);
      }
    }
  };

  const handleAddEvent = async () => {
    if (!formData.title) return toast.error("Le titre est requis");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.from('calendar_events').insert([{
        title: formData.title,
        description: formData.description,
        start_date: formData.date,
        type: formData.type,
        project_id: formData.project_id === "none" ? null : formData.project_id,
        user_id: user.id,
        reminder_time_before: parseInt(formData.reminder_before)
      }]);

      if (error) throw error;

      toast.success("Événement ajouté");
      setIsModalOpen(false);
      fetchData();
      setFormData({ title: "", description: "", date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), type: "task", project_id: "none", reminder_before: "0" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Popup Retards */}
        <Dialog open={showOverduePopup} onOpenChange={setShowOverduePopup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle /> Échéances dépassées
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {overdueEvents.map(e => (
                <div key={e.id} className="p-3 bg-red-50 border rounded-md flex justify-between items-center">
                  <span className="font-medium text-sm">{e.title}</span>
                  <Badge variant="destructive">Retard</Badge>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowOverduePopup(false)}>Fermer</Button>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendrier</h1>
            <p className="text-muted-foreground">Gérez vos tâches et deadlines projets.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-card border rounded-lg p-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1 font-semibold min-w-[140px] text-center capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </div>
        </div>

        {/* Grille Calendrier */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.start_date), day));
              const isToday = isSameDay(day, new Date());
              return (
                <div key={idx} className={`min-h-[140px] border-r border-b p-2 transition-colors hover:bg-muted/10 ${!isSameMonth(day, currentDate) ? 'bg-muted/5 opacity-40' : ''}`}>
                  <div className={`text-sm font-semibold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className={`group relative p-1.5 rounded-md border text-[10px] font-medium truncate cursor-pointer transition-shadow hover:shadow-sm ${eventTypeColors[event.type]}`}>
                        <div className="flex items-center gap-1">
                          {event.is_overdue && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- SECTION HISTORIQUE --- */}
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-800">Historique des 7 derniers jours</h3>
          </div>

          {historiqueRecent.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Aucun événement récent à afficher.</p>
          ) : (
            <div className="space-y-3">
              {historiqueRecent.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">{event.title}</span>
                    <span className="text-[11px] text-slate-500">
                      Terminé le {format(new Date(event.start_date), "eeee d MMMM", { locale: fr })}
                    </span>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    event.type === 'deadline' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {event.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Ajout */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvel événement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Titre de l'événement</Label>
                <Input placeholder="Réunion, Deadline..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Tâche</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="reminder">Rappel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rappel</Label>
                  <Select value={formData.reminder_before} onValueChange={v => setFormData({...formData, reminder_before: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Au moment même</SelectItem>
                      <SelectItem value="15">15 min avant</SelectItem>
                      <SelectItem value="60">1 heure avant</SelectItem>
                      <SelectItem value="1440">1 jour avant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date et Heure</Label>
                <Input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Projet associé</Label>
                <Select value={formData.project_id} onValueChange={v => setFormData({...formData, project_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Choisir un projet" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun projet</SelectItem>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button onClick={handleAddEvent}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}