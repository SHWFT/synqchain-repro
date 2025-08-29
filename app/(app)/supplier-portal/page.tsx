"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePOStore } from "@/state/po.store";
import { useSupplierStore } from "@/state/suppliers.store";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  HandHeart,
  Truck,
  MessageSquare,
  Eye,
  Building2,
  Package,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { getStatusDisplay, canAcknowledge, canCreateASN } from "@/lib/po-state-machine";
import type { PurchaseOrder, Supplier } from "@/erps/mapping/common.types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const columnHelper = createColumnHelper<PurchaseOrder>();

const AcknowledgeSchema = z.object({
  note: z.string().optional(),
});

type AcknowledgeData = z.infer<typeof AcknowledgeSchema>;

export default function SupplierPortalPage() {
  const router = useRouter();
  const { getPOsBySupplier, updatePurchaseOrder, addComment } = usePOStore();
  const { suppliers } = useSupplierStore();
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);

  const form = useForm<AcknowledgeData>({
    resolver: zodResolver(AcknowledgeSchema),
    defaultValues: {
      note: "",
    },
  });

  // Get POs for selected supplier
  const supplierPOs = selectedSupplierId ? getPOsBySupplier(selectedSupplierId) : [];
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleAcknowledge = async (data: AcknowledgeData) => {
    if (!selectedPO) return;

    try {
      const now = new Date().toISOString();
      
      // Update PO status to acknowledged
      updatePurchaseOrder(selectedPO.id, {
        status: "supplier_acknowledged",
        updatedAt: now,
      });

      // Add comment if note provided
      if (data.note) {
        addComment({
          id: generateId(),
          poId: selectedPO.id,
          author: `Supplier - ${selectedSupplier?.name}`,
          body: data.note,
          at: now,
          mentions: [selectedPO.buyer.toLowerCase().replace(" ", ".") + "@company.com"],
        });
      }

      toast.success(`Purchase order ${selectedPO.number} acknowledged successfully`);
      
      // Reset form and close dialog
      form.reset();
      setIsAcknowledgeDialogOpen(false);
      setSelectedPO(null);
    } catch (error) {
      console.error("Error acknowledging PO:", error);
      toast.error("Failed to acknowledge purchase order");
    }
  };

  const handleCreateASN = (po: PurchaseOrder) => {
    // TODO: Implement ASN creation dialog
    toast.info("ASN creation feature coming soon!");
  };

  const columns = [
    columnHelper.accessor("number", {
      header: "PO Number",
      cell: (info) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
          onClick={() => router.push(`/po/${info.row.original.id}`)}
        >
          {info.getValue()}
        </Button>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const statusInfo = getStatusDisplay(status);
        return (
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("buyer", {
      header: "Buyer",
      cell: (info) => (
        <div className="font-medium">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("total", {
      header: "Total Amount",
      cell: (info) => (
        <div className="font-medium">
          {formatCurrency(info.getValue(), info.row.original.currency)}
        </div>
      ),
    }),
    columnHelper.accessor("needByDate", {
      header: "Need By",
      cell: (info) => {
        const date = info.getValue();
        const isUrgent = date && new Date(date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        return (
          <div className={`text-sm ${isUrgent ? "text-red-600 font-medium" : "text-gray-600"}`}>
            {date ? formatDate(date) : "—"}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const po = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/po/${po.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            
            {canAcknowledge(po.status) && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setSelectedPO(po);
                  setIsAcknowledgeDialogOpen(true);
                }}
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Acknowledge
              </Button>
            )}
            
            {canCreateASN(po.status) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCreateASN(po)}
              >
                <Truck className="h-4 w-4 mr-2" />
                Create ASN
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: supplierPOs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Stats for selected supplier
  const pendingPOs = supplierPOs.filter(po => 
    ["sent_to_supplier", "approved", "released"].includes(po.status)
  );
  const acknowledgedPOs = supplierPOs.filter(po => po.status === "supplier_acknowledged");
  const totalValue = supplierPOs.reduce((sum, po) => sum + po.total, 0);

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Supplier Portal</h2>
          <p className="text-muted-foreground">
            Manage purchase orders and collaborate with buyers.
          </p>
        </div>
      </div>

      {/* Supplier Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Select Supplier
          </CardTitle>
          <CardDescription>
            Choose a supplier to view their assigned purchase orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a supplier..." />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.category}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSupplierId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{supplierPOs.length}</div>
                  <div className="text-sm text-muted-foreground">Total POs</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{pendingPOs.length}</div>
                  <div className="text-sm text-muted-foreground">Pending Action</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{acknowledgedPOs.length}</div>
                  <div className="text-sm text-muted-foreground">Acknowledged</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">$</span>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalValue, "USD")}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Purchase Orders</CardTitle>
              <CardDescription>
                Purchase orders assigned to {selectedSupplier?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center justify-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No purchase orders
                            </h3>
                            <p className="text-gray-500">
                              No purchase orders have been assigned to this supplier yet.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSupplierId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Select a Supplier
            </h3>
            <p className="text-gray-500 text-center max-w-sm">
              Choose a supplier from the dropdown above to view their assigned purchase orders and available actions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Acknowledge Dialog */}
      <Dialog open={isAcknowledgeDialogOpen} onOpenChange={setIsAcknowledgeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Acknowledge Purchase Order</DialogTitle>
            <DialogDescription>
              {selectedPO && (
                <>
                  Acknowledge receipt of PO{" "}
                  <span className="font-medium">{selectedPO.number}</span> for{" "}
                  <span className="font-medium">
                    {formatCurrency(selectedPO.total, selectedPO.currency)}
                  </span>
                  . This confirms your commitment to fulfill the order.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAcknowledge)} className="space-y-4">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note about delivery timeline, special requirements, etc..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAcknowledgeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <HandHeart className="h-4 w-4 mr-2" />
                  Acknowledge
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}






