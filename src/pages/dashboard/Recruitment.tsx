import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload,
  FileText,
  Wallet,
  File,
  X,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EmployeeDocument {
  id: string;
  type: string;
  file_name: string;
  uploaded_date: string;
  url?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  country: string;
  photo?: string;
  hire_date?: string;
  contract_type?: string;
  salary?: number;
  notes?: string;
  job_description_file?: string;
  contract_file?: string;
  cv_file?: string;
  documents?: EmployeeDocument[];
  salary_slips?: string[];
  status?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

const countries = [
  "Sénégal", "Côte d'Ivoire", "Mali", "Burkina Faso", "Guinée", "Bénin",
  "Togo", "Niger", "Cameroun", "Congo", "RDC", "Gabon", "Mauritanie", "France", "Autre",
];

const departments = ["Design", "Tech", "Marketing", "Ventes", "RH", "Finance"];
const contractTypes = ["CDI", "CDD", "Stage", "Freelance"];

const formatDate = (raw: string | null | undefined): string => {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const Recruitment = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [showNewEmployeeDialog, setShowNewEmployeeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [fileConfirm, setFileConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const confirmAction = (title: string, description: string, onConfirm: () => void) => {
    setFileConfirm({ open: true, title, description, onConfirm });
  };
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [formData, setFormData] = useState<Partial<Employee>>({
    first_name: "",
    last_name: "",
    role: "",
    email: "",
    phone: "",
    department: "",
    country: "",
    hire_date: "",
    contract_type: "",
    salary: 0,
    notes: "",
    photo: "",
    job_description_file: "",
    status: "active",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("recruited_employees")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Erreur lors du chargement des salariés : " + error.message);
      } else {
        const normalized = (data || []).map((emp) => ({
          ...emp,
          documents: Array.isArray(emp.documents) ? emp.documents : [],
          salary_slips: Array.isArray(emp.salary_slips) ? emp.salary_slips : [],
        }));
        setEmployees(normalized);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name} ${emp.email} ${emp.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleOpenNewDialog = () => {
    setEditingEmployee(null);
    setFormData({
      first_name: "",
      last_name: "",
      role: "",
      email: "",
      phone: "",
      department: "",
      country: "",
      hire_date: "",
      contract_type: "",
      salary: 0,
      notes: "",
      photo: "",
      job_description_file: "",
      status: "active",
      address: "",
      emergency_contact: "",
      emergency_phone: "",
    });
    setPhotoPreview("");
    setShowNewEmployeeDialog(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData(emp);
    setPhotoPreview(emp.photo || "");
    setShowNewEmployeeDialog(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData((prev) => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEmployee = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.department || !formData.country) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingEmployee) {
      const { error } = await supabase
        .from("recruited_employees")
        .update(formData)
        .eq("id", editingEmployee.id);
      if (error) {
        toast.error("Erreur lors de la mise à jour : " + error.message);
        return;
      }
      const { data } = await supabase
        .from("recruited_employees")
        .select("*")
        .order("created_at", { ascending: false });
      const normalized = (data || []).map((emp) => ({
        ...emp,
        documents: Array.isArray(emp.documents) ? emp.documents : [],
        salary_slips: Array.isArray(emp.salary_slips) ? emp.salary_slips : [],
      }));
      setEmployees(normalized);
      setSelectedEmployee(normalized.find((e) => e.id === editingEmployee.id) || null);
      toast.success("Salarié mis à jour avec succès");
    } else {
      const insertData = {
        ...formData,
        photo: formData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.first_name}`,
        documents: [],
        salary_slips: [],
        created_at: new Date().toISOString(),
        created_by: "system",
      };
      const { data, error } = await supabase
        .from("recruited_employees")
        .insert([insertData])
        .select();
      if (error) {
        toast.error("Erreur lors de l'ajout : " + error.message);
        return;
      }
      const newEmp = { ...(data?.[0] || {}), documents: [], salary_slips: [] };
      setEmployees([newEmp, ...employees]);
      toast.success("Salarié ajouté avec succès");
    }
    setShowNewEmployeeDialog(false);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await supabase
      .from("recruited_employees")
      .delete()
      .eq("id", deleteTargetId);
    if (error) {
      toast.error("Erreur lors de la suppression : " + error.message);
      return;
    }
    setEmployees(employees.filter((emp) => emp.id !== deleteTargetId));
    if (selectedEmployee?.id === deleteTargetId) setSelectedEmployee(null);
    toast.success("Salarié supprimé avec succès");
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
  };

  const uploadToStorage = async (bucket: string, employeeId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${employeeId}/${generateId()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error("Erreur upload : " + error.message); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const syncEmployee = async (employeeId: string, patch: Partial<Employee>) => {
    const { error } = await supabase.from("recruited_employees").update(patch).eq("id", employeeId);
    if (error) { toast.error("Erreur sauvegarde : " + error.message); return false; }
    const updated = employees.map((e) => e.id === employeeId ? { ...e, ...patch } : e);
    setEmployees(updated);
    setSelectedEmployee(updated.find((e) => e.id === employeeId) || null);
    return true;
  };

  const parseFileEntry = (entry: string): { name: string; url: string } => {
    try { return JSON.parse(entry); } catch { return { name: entry, url: "" }; }
  };

  const handleAddDocument = async (employeeId: string, file: File) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    toast.loading("Upload en cours...", { id: "upload" });
    const url = await uploadToStorage("employee-documents", employeeId, file);
    toast.dismiss("upload");
    if (!url) return;
    const newDoc: EmployeeDocument = {
      id: generateId(), type: "document", file_name: file.name,
      uploaded_date: new Date().toLocaleDateString("fr-FR"), url,
    };
    const updatedDocs = [...(emp.documents || []), newDoc];
    const ok = await syncEmployee(employeeId, { documents: updatedDocs });
    if (ok) toast.success("Document ajouté");
  };

  const handleDeleteDocument = async (employeeId: string, docId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const updatedDocs = emp.documents?.filter((d) => d.id !== docId) || [];
    const ok = await syncEmployee(employeeId, { documents: updatedDocs });
    if (ok) toast.success("Document supprimé");
  };

  const handleAddSalarySlip = async (employeeId: string, file: File) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    toast.loading("Upload en cours...", { id: "upload" });
    const url = await uploadToStorage("employee-salary-slips", employeeId, file);
    toast.dismiss("upload");
    if (!url) return;
    const slipEntry = JSON.stringify({ name: file.name, url });
    const updatedSlips = [...(emp.salary_slips || []), slipEntry];
    const ok = await syncEmployee(employeeId, { salary_slips: updatedSlips });
    if (ok) toast.success("Fiche de paie ajoutée");
  };

  const handleDeleteSalarySlip = async (employeeId: string, index: number) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const updatedSlips = emp.salary_slips?.filter((_, i) => i !== index) || [];
    const ok = await syncEmployee(employeeId, { salary_slips: updatedSlips });
    if (ok) toast.success("Fiche de paie supprimée");
  };

  const handleAddContract = async (employeeId: string, file: File) => {
    toast.loading("Upload en cours...", { id: "upload" });
    const url = await uploadToStorage("employee-contracts", employeeId, file);
    toast.dismiss("upload");
    if (!url) return;
    const ok = await syncEmployee(employeeId, { contract_file: JSON.stringify({ name: file.name, url }) });
    if (ok) toast.success("Contrat ajouté");
  };

  const handleAddCV = async (employeeId: string, file: File) => {
    toast.loading("Upload en cours...", { id: "upload" });
    const url = await uploadToStorage("employee-cvs", employeeId, file);
    toast.dismiss("upload");
    if (!url) return;
    const ok = await syncEmployee(employeeId, { cv_file: JSON.stringify({ name: file.name, url }) });
    if (ok) toast.success("CV ajouté");
  };

  const handleDownloadDocument = (fileNameOrJson: string) => {
    try {
      const parsed = JSON.parse(fileNameOrJson);
      const a = document.createElement("a");
      a.href = parsed.url;
      a.download = parsed.name;
      a.target = "_blank";
      a.click();
    } catch {
      toast.error("Fichier non disponible");
    }
  };

  const handleAddJobDescription = async (employeeId: string, file: File) => {
    toast.loading("Upload en cours...", { id: "upload" });
    const url = await uploadToStorage("employee-documents", employeeId, file);
    toast.dismiss("upload");
    if (!url) return;
    const ok = await syncEmployee(employeeId, { job_description_file: JSON.stringify({ name: file.name, url }) });
    if (ok) toast.success("Fiche de poste ajoutée");
  };

  const handleDeleteContract = (employeeId: string) => {
    confirmAction("Supprimer le contrat ?", "Cette action est irréversible.", async () => {
      const ok = await syncEmployee(employeeId, { contract_file: null });
      if (ok) toast.success("Contrat supprimé");
      setFileConfirm(f => ({ ...f, open: false }));
    });
  };

  const handleDeleteCV = (employeeId: string) => {
    confirmAction("Supprimer le CV ?", "Cette action est irréversible.", async () => {
      const ok = await syncEmployee(employeeId, { cv_file: null });
      if (ok) toast.success("CV supprimé");
      setFileConfirm(f => ({ ...f, open: false }));
    });
  };

  const handleDeleteJobDescription = (employeeId: string) => {
    confirmAction("Supprimer la fiche de poste ?", "Cette action est irréversible.", async () => {
      const ok = await syncEmployee(employeeId, { job_description_file: null });
      if (ok) toast.success("Fiche de poste supprimée");
      setFileConfirm(f => ({ ...f, open: false }));
    });
  };

  const handleDeleteDocumentConfirm = (employeeId: string, docId: string, docName: string) => {
    confirmAction(`Supprimer "${docName}" ?`, "Ce document sera définitivement supprimé.", async () => {
      await handleDeleteDocument(employeeId, docId);
      setFileConfirm(f => ({ ...f, open: false }));
    });
  };

  const handleDeleteSalarySlipConfirm = (employeeId: string, idx: number, slipName: string) => {
    confirmAction(`Supprimer "${slipName}" ?`, "Cette fiche sera définitivement supprimée.", async () => {
      await handleDeleteSalarySlip(employeeId, idx);
      setFileConfirm(f => ({ ...f, open: false }));
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER - Responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Recrutement</h1>
            <p className="text-xs sm:text-base text-muted-foreground">
              {employees.length} salarié{employees.length > 1 ? "s" : ""}
            </p>
          </div>

          <Dialog open={showNewEmployeeDialog} onOpenChange={setShowNewEmployeeDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 text-xs sm:text-sm w-full sm:w-auto" onClick={handleOpenNewDialog}>
                <Plus className="w-4 h-4" />
                Ajouter salarié
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {editingEmployee ? "Modifier le salarié" : "Ajouter un salarié"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* PHOTO */}
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={photoPreview} />
                    <AvatarFallback className="text-sm">
                      {formData.first_name?.charAt(0)}{formData.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    <Upload className="w-4 h-4" />
                    <label className="cursor-pointer">
                      Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </Button>
                </div>

                {/* FORM - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Prénom *</Label>
                    <Input placeholder="Prénom" value={formData.first_name || ""} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Nom *</Label>
                    <Input placeholder="Nom" value={formData.last_name || ""} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Email *</Label>
                    <Input type="email" placeholder="email@agence.com" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Téléphone</Label>
                    <Input placeholder="+221771234567" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Poste</Label>
                    <Input placeholder="Ex: Développeur" value={formData.role || ""} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Pays *</Label>
                    <Select value={formData.country || ""} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                      <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue placeholder="Pays" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} className="text-xs sm:text-sm">{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Département *</Label>
                    <Select value={formData.department || ""} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue placeholder="Département" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept} className="text-xs sm:text-sm">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Type contrat</Label>
                    <Select value={formData.contract_type || ""} onValueChange={(value) => setFormData({ ...formData, contract_type: value })}>
                      <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs sm:text-sm">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Embauche</Label>
                    <Input type="date" value={formData.hire_date || ""} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Salaire (CFA)</Label>
                    <Input type="number" placeholder="0" value={formData.salary || ""} onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })} className="h-9 text-xs sm:text-sm" />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <Label className="text-xs sm:text-sm">Adresse</Label>
                  <Input placeholder="Adresse" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="h-9 text-xs sm:text-sm" />
                </div>

                {/* Contact d'urgence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Contact urgence</Label>
                    <Input placeholder="Nom" value={formData.emergency_contact || ""} onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Tél urgence</Label>
                    <Input placeholder="+221..." value={formData.emergency_phone || ""} onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })} className="h-9 text-xs sm:text-sm" />
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <Label className="text-xs sm:text-sm">Statut</Label>
                  <Select value={formData.status || "active"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs sm:text-sm">Actif</SelectItem>
                      <SelectItem value="inactive" className="text-xs sm:text-sm">Inactif</SelectItem>
                      <SelectItem value="on_leave" className="text-xs sm:text-sm">En congé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-xs sm:text-sm">Notes</Label>
                  <Textarea placeholder="Notes..." value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="text-xs sm:text-sm" />
                </div>
              </div>

              <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
                <Button variant="outline" onClick={() => setShowNewEmployeeDialog(false)} className="text-xs sm:text-sm w-full sm:w-auto">Annuler</Button>
                <Button onClick={handleSaveEmployee} className="text-xs sm:text-sm w-full sm:w-auto">{editingEmployee ? "Mettre à jour" : "Ajouter"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* TABLEAU */}
          <div className="col-span-full">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10 text-xs sm:text-sm h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground text-xs sm:text-sm">Chargement...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs sm:text-sm">Aucun salarié</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs">Photo</TableHead>
                        <TableHead className="text-xs">Nom</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Poste</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">Dept</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">Contrat</TableHead>
                        <TableHead className="text-xs hidden xl:table-cell">Statut</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((emp) => (
                        <TableRow key={emp.id} className="hover:bg-muted/50 cursor-pointer text-xs sm:text-sm" onClick={() => setSelectedEmployee(emp)}>
                          <TableCell className="p-2"><Avatar className="w-6 h-6"><AvatarImage src={emp.photo} /><AvatarFallback className="text-[10px]">{emp.first_name.charAt(0)}{emp.last_name.charAt(0)}</AvatarFallback></Avatar></TableCell>
                          <TableCell className="font-medium">{emp.first_name} {emp.last_name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{emp.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{emp.role}</TableCell>
                          <TableCell className="hidden lg:table-cell">{emp.department}</TableCell>
                          <TableCell className="hidden lg:table-cell"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-medium">{emp.contract_type || "-"}</span></TableCell>
                          <TableCell className="hidden xl:table-cell"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${emp.status === "active" ? "bg-green-100 text-green-800" : emp.status === "on_leave" ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-800"}`}>{emp.status === "active" ? "Actif" : emp.status === "on_leave" ? "Congé" : "Inactif"}</span></TableCell>
                          <TableCell className="text-right p-2"><DropdownMenu><DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditEmployee(emp); }} className="text-xs"><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem><DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(emp.id); }} className="text-destructive text-xs"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* FICHE DÉTAILLÉE - Responsive */}
          {selectedEmployee && (
            <div className="col-span-full border-t pt-6">
              <div className="bg-white border rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex gap-3 items-start">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                      <AvatarImage src={selectedEmployee.photo} />
                      <AvatarFallback className="text-sm">{selectedEmployee.first_name.charAt(0)}{selectedEmployee.last_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                      <p className="text-muted-foreground text-xs sm:text-sm">{selectedEmployee.role}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${selectedEmployee.status === "active" ? "bg-green-100 text-green-800" : selectedEmployee.status === "on_leave" ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-800"}`}>
                        {selectedEmployee.status === "active" ? "Actif" : selectedEmployee.status === "on_leave" ? "Congé" : "Inactif"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleEditEmployee(selectedEmployee)} className="gap-1 text-xs"><Pencil className="w-4 h-4" /> Modifier</Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedEmployee(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                  </div>
                </div>

                <Tabs defaultValue="info">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-6 gap-1 sm:gap-0 mb-4 text-xs sm:text-sm flex-wrap">
                    <TabsTrigger value="info" className="text-[11px] sm:text-sm">Infos</TabsTrigger>
                    <TabsTrigger value="fiche" className="text-[11px] sm:text-sm">Fiche</TabsTrigger>
                    <TabsTrigger value="documents" className="text-[11px] sm:text-sm">Docs ({selectedEmployee.documents?.length || 0})</TabsTrigger>
                    <TabsTrigger value="salary" className="text-[11px] sm:text-sm">Fiches ({selectedEmployee.salary_slips?.length || 0})</TabsTrigger>
                    <TabsTrigger value="contract" className="text-[11px] sm:text-sm">Contrat</TabsTrigger>
                    <TabsTrigger value="cv" className="text-[11px] sm:text-sm">CV</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-3 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Email</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.email}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Téléphone</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.phone || "-"}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Poste</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.role || "-"}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Département</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.department}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Pays</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.country}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Contrat</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.contract_type || "-"}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Embauche</p><p className="mt-1 text-xs sm:text-sm">{formatDate(selectedEmployee.hire_date)}</p></div>
                      <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Salaire</p><p className="mt-1 text-xs sm:text-sm font-semibold">{selectedEmployee.salary?.toLocaleString("fr-FR") || "-"} CFA</p></div>
                      {selectedEmployee.address && <div className="border p-3 rounded col-span-full"><p className="text-xs font-semibold text-muted-foreground uppercase">Adresse</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.address}</p></div>}
                      {selectedEmployee.emergency_contact && <div className="border p-3 rounded"><p className="text-xs font-semibold text-muted-foreground uppercase">Urgence</p><p className="mt-1 text-xs sm:text-sm">{selectedEmployee.emergency_contact}</p></div>}
                      {selectedEmployee.notes && <div className="border p-3 rounded col-span-full"><p className="text-xs font-semibold text-muted-foreground uppercase">Notes</p><p className="mt-1 text-xs sm:text-sm text-muted-foreground">{selectedEmployee.notes}</p></div>}
                    </div>
                  </TabsContent>

                  <TabsContent value="fiche" className="space-y-3 mt-4">
                    {selectedEmployee.job_description_file ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 flex-col sm:flex-row"><FileText className="w-5 h-5 text-primary shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{parseFileEntry(selectedEmployee.job_description_file).name}</p></div><div className="flex gap-2 shrink-0 w-full sm:w-auto"><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-xs" onClick={() => handleDownloadDocument(selectedEmployee.job_description_file!)}><Download className="w-4 h-4" /> Dl</Button><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-xs relative"><RefreshCw className="w-4 h-4" /> Remplacer<input type="file" accept=".pdf,.doc,.docx,.odt,.txt" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddJobDescription(selectedEmployee.id, f); }} /></Button><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-destructive text-xs" onClick={() => handleDeleteJobDescription(selectedEmployee.id)}><Trash2 className="w-4 h-4" /> Supprimer</Button></div></div>
                    ) : (
                      <Button variant="outline" className="gap-2 relative w-full text-xs sm:text-sm"><FileText className="w-4 h-4" /> Ajouter<input type="file" accept=".pdf,.doc,.docx,.odt,.txt" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddJobDescription(selectedEmployee.id, f); }} /></Button>
                    )}
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-2 mt-4">
                    <Button variant="outline" className="gap-2 relative w-full text-xs sm:text-sm"><FileText className="w-4 h-4" /> Ajouter<input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddDocument(selectedEmployee.id, f); }} /></Button>
                    {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedEmployee.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/30 flex-col sm:flex-row"><FileText className="w-4 h-4 text-primary shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{doc.file_name}</p><p className="text-[10px] text-muted-foreground">{doc.uploaded_date}</p></div><div className="flex gap-1 shrink-0 w-full sm:w-auto"><Button size="sm" variant="outline" className="h-7 w-7 p-0 flex-1 sm:flex-none" onClick={() => handleDownloadDocument(doc.url || doc.file_name)}><Download className="w-3 h-3" /></Button><Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive flex-1 sm:flex-none" onClick={() => handleDeleteDocumentConfirm(selectedEmployee.id, doc.id, doc.file_name)}><Trash2 className="w-3 h-3" /></Button></div></div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">Aucun document</p>
                    )}
                  </TabsContent>

                  <TabsContent value="salary" className="space-y-2 mt-4">
                    <Button variant="outline" className="gap-2 relative w-full text-xs sm:text-sm"><Wallet className="w-4 h-4" /> Ajouter<input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddSalarySlip(selectedEmployee.id, f); }} /></Button>
                    {selectedEmployee.salary_slips && selectedEmployee.salary_slips.length > 0 ? (
                      <div className="space-y-2">
                        {selectedEmployee.salary_slips.map((slip, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/30 flex-col sm:flex-row"><Wallet className="w-4 h-4 text-primary shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{parseFileEntry(slip).name}</p></div><div className="flex gap-1 shrink-0 w-full sm:w-auto"><Button size="sm" variant="outline" className="h-7 w-7 p-0 flex-1 sm:flex-none" onClick={() => handleDownloadDocument(slip)}><Download className="w-3 h-3" /></Button><Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive flex-1 sm:flex-none" onClick={() => handleDeleteSalarySlipConfirm(selectedEmployee.id, idx, parseFileEntry(slip).name)}><Trash2 className="w-3 h-3" /></Button></div></div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">Aucune fiche</p>
                    )}
                  </TabsContent>

                  <TabsContent value="contract" className="space-y-3 mt-4">
                    {selectedEmployee.contract_file ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 flex-col sm:flex-row"><File className="w-5 h-5 text-primary shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{parseFileEntry(selectedEmployee.contract_file).name}</p></div><div className="flex gap-2 shrink-0 w-full sm:w-auto"><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-xs" onClick={() => handleDownloadDocument(selectedEmployee.contract_file!)}><Download className="w-4 h-4" /> Dl</Button><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-xs relative"><RefreshCw className="w-4 h-4" /> Remplacer<input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddContract(selectedEmployee.id, f); }} /></Button><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-destructive text-xs" onClick={() => handleDeleteContract(selectedEmployee.id)}><Trash2 className="w-4 h-4" /> Supprimer</Button></div></div>
                    ) : (
                      <Button variant="outline" className="gap-2 relative w-full text-xs sm:text-sm"><File className="w-4 h-4" /> Ajouter<input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddContract(selectedEmployee.id, f); }} /></Button>
                    )}
                  </TabsContent>

                  <TabsContent value="cv" className="space-y-3 mt-4">
                    {selectedEmployee.cv_file ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 flex-col sm:flex-row"><File className="w-5 h-5 text-primary shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium truncate">{parseFileEntry(selectedEmployee.cv_file).name}</p></div><div className="flex gap-2 shrink-0 w-full sm:w-auto"><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-xs" onClick={() => handleDownloadDocument(selectedEmployee.cv_file!)}><Download className="w-4 h-4" /> Dl</Button><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-xs relative"><RefreshCw className="w-4 h-4" /> Remplacer<input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddCV(selectedEmployee.id, f); }} /></Button><Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none text-destructive text-xs" onClick={() => handleDeleteCV(selectedEmployee.id)}><Trash2 className="w-4 h-4" /> Supprimer</Button></div></div>
                    ) : (
                      <Button variant="outline" className="gap-2 relative w-full text-xs sm:text-sm"><File className="w-4 h-4" /> Ajouter<input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddCV(selectedEmployee.id, f); }} /></Button>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <AlertDialog open={fileConfirm.open} onOpenChange={(open) => setFileConfirm(f => ({ ...f, open }))}>
        <AlertDialogContent className="w-[95vw] sm:w-full"><AlertDialogTitle className="text-base sm:text-lg">{fileConfirm.title}</AlertDialogTitle><AlertDialogDescription className="text-xs sm:text-sm">{fileConfirm.description}</AlertDialogDescription><div className="flex justify-end gap-2 flex-col-reverse sm:flex-row"><AlertDialogCancel className="text-xs sm:text-sm">Annuler</AlertDialogCancel><AlertDialogAction onClick={fileConfirm.onConfirm} className="bg-destructive text-destructive-foreground text-xs sm:text-sm">Confirmer</AlertDialogAction></div></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95vw] sm:w-full"><AlertDialogTitle className="text-base sm:text-lg">Supprimer ce salarié ?</AlertDialogTitle><AlertDialogDescription className="text-xs sm:text-sm">Cette action est irréversible.</AlertDialogDescription><div className="flex justify-end gap-2 flex-col-reverse sm:flex-row"><AlertDialogCancel className="text-xs sm:text-sm">Annuler</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground text-xs sm:text-sm">Supprimer</AlertDialogAction></div></AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Recruitment;
