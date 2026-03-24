import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, FileText, Search, User, Wallet } from "lucide-react";
import { useState } from "react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    first_name: "Marie",
    last_name: "Lopez",
    role: "Graphiste",
    email: "marie@agence.com",
    phone: "+221771234567",
    department: "Design",
  },
  {
    id: "2",
    first_name: "Paul",
    last_name: "Martin",
    role: "Développeur",
    email: "paul@agence.com",
    phone: "+221771234568",
    department: "Tech",
  },
];

const Recruitment = () => {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = mockEmployees.filter((emp) =>
    `${emp.first_name} ${emp.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="grid grid-cols-12 gap-6">

        {/* LISTE SALARIÉS */}
        <div className="col-span-4 bg-white border rounded-lg p-4 space-y-4">

          <h1 className="text-xl font-bold">Salariés</h1>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un salarié..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50"
              >
                <p className="font-medium">
                  {emp.first_name} {emp.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{emp.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FICHE SALARIÉ */}
        <div className="col-span-8 bg-white border rounded-lg p-6">

          {!selectedEmployee ? (
            <p className="text-muted-foreground">
              Sélectionnez un salarié pour voir ses informations
            </p>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">
                {selectedEmployee.first_name} {selectedEmployee.last_name}
              </h2>

              <Tabs defaultValue="infos">

                <TabsList>
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="salary">Fiches de paie</TabsTrigger>
                  <TabsTrigger value="contract">Contrat</TabsTrigger>
                  <TabsTrigger value="cv">CV</TabsTrigger>
                </TabsList>

                {/* INFOS */}
                <TabsContent value="infos" className="space-y-3 mt-4">

                  <div className="grid grid-cols-2 gap-4">

                    <div className="border p-3 rounded">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p>{selectedEmployee.email}</p>
                    </div>

                    <div className="border p-3 rounded">
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p>{selectedEmployee.phone}</p>
                    </div>

                    <div className="border p-3 rounded">
                      <p className="text-xs text-muted-foreground">Poste</p>
                      <p>{selectedEmployee.role}</p>
                    </div>

                    <div className="border p-3 rounded">
                      <p className="text-xs text-muted-foreground">Département</p>
                      <p>{selectedEmployee.department}</p>
                    </div>

                  </div>

                </TabsContent>

                {/* DOCUMENTS */}
                <TabsContent value="documents" className="mt-4 space-y-3">

                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Ajouter un document
                  </Button>

                  <p className="text-muted-foreground text-sm">
                    Aucun document pour le moment
                  </p>

                </TabsContent>

                {/* FICHES DE PAIE */}
                <TabsContent value="salary" className="mt-4 space-y-3">

                  <Button variant="outline" className="gap-2">
                    <Wallet className="w-4 h-4" />
                    Ajouter une fiche de paie
                  </Button>

                  <p className="text-muted-foreground text-sm">
                    Aucune fiche de paie
                  </p>

                </TabsContent>

                {/* CONTRAT */}
                <TabsContent value="contract" className="mt-4 space-y-3">

                  <Button variant="outline" className="gap-2">
                    <File className="w-4 h-4" />
                    Ajouter un contrat
                  </Button>

                  <p className="text-muted-foreground text-sm">
                    Aucun contrat enregistré
                  </p>

                </TabsContent>

                {/* CV */}
                <TabsContent value="cv" className="mt-4 space-y-3">

                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    Ajouter un CV
                  </Button>

                  <p className="text-muted-foreground text-sm">
                    Aucun CV enregistré
                  </p>

                </TabsContent>

              </Tabs>
            </>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Recruitment;