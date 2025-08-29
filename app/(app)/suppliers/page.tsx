"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSuppliersStore } from "@/state/suppliers.store";
import { useActivityStore } from "@/state/activity.store";
import { Supplier } from "@/erps/mapping/common.types";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/toast";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  category: z.string().optional(),
  region: z.string().optional(),
  currency: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type SupplierForm = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { suppliers, loadSuppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliersStore();
  const { addActivity } = useActivityStore();

  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      category: "",
      region: "",
      currency: "USD",
      status: "active",
    },
  });

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const onSubmit = (data: SupplierForm) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, data);
      addActivity({
        type: "supplier_added",
        title: "Supplier updated",
        description: `${data.name} was updated in the system`,
        userId: "demo-user-1",
      });
      toast.success("Supplier updated successfully");
    } else {
      addSupplier(data);
      addActivity({
        type: "supplier_added",
        title: "Supplier added",
        description: `${data.name} was added to the system`,
        userId: "demo-user-1",
      });
      toast.success("Supplier created successfully");
    }
    
    setDialogOpen(false);
    setEditingSupplier(null);
    form.reset();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      name: supplier.name,
      category: supplier.category || "",
      region: supplier.region || "",
      currency: supplier.currency || "USD",
      status: supplier.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    if (confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
      deleteSupplier(supplier.id);
      toast.success("Supplier deleted successfully");
    }
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    form.reset();
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier network and relationships
          </p>
        </div>
        <Button onClick={handleNewSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.category || "—"}</TableCell>
                <TableCell>{supplier.region || "—"}</TableCell>
                <TableCell>{supplier.currency || "—"}</TableCell>
                <TableCell>
                  <Badge variant={supplier.status === "active" ? "success" : "secondary"}>
                    {supplier.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(supplier.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(supplier)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Supplier Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier 
                ? "Update the supplier details below."
                : "Add a new supplier to your network."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input
                {...form.register("name")}
                placeholder="Enter supplier name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select {...form.register("category")}>
                  <option value="">Select category</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Technology">Technology</option>
                  <option value="Services">Services</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Industrial">Industrial</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select {...form.register("region")}>
                  <option value="">Select region</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Middle East & Africa">Middle East & Africa</option>
                  <option value="Global">Global</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select {...form.register("currency")}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select {...form.register("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSupplier ? "Update Supplier" : "Add Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}






