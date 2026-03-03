import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CalendarPage from "./pages/dashboard/CalendarPage";
import Clients from "./pages/dashboard/Clients";
import Collaboration from "./pages/dashboard/Collaboration"; // CHEMIN MAINTENANT CORRECT
import Dashboard from "./pages/dashboard/Dashboard";
import Leads from "./pages/dashboard/Leads";
import Projects from "./pages/dashboard/Projects";
import Settings from "./pages/dashboard/Settings";
import Tasks from "./pages/dashboard/Tasks";
import Index from "./pages/Index";

// Définition de NotFound pour éviter l'erreur "ReferenceError"
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold">Page non trouvée</h1>
    <Link to="/dashboard" className="mt-4 text-primary hover:underline">Retour au tableau de bord</Link>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="bottom-right" richColors closeButton/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/leads" element={<Leads />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/projects" element={<Projects />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/dashboard/calendar" element={<CalendarPage />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/collaboration" element={<Collaboration />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;