import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Quotes = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Devis</h1>
            <p className="text-muted-foreground">
              Créez et gérez les devis envoyés aux clients
            </p>
          </div>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau devis
          </Button>
        </div>

        {/* TABLEAU */}
        <div className="bg-white border rounded-lg p-6">
          <p className="text-muted-foreground text-sm">
            Aucun devis pour le moment.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Quotes;