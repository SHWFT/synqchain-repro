"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePOStore } from "@/state/po.store";
import { useSupplierStore } from "@/state/suppliers.store";
import { useAuthStore } from "@/state/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  DollarSign,
  Package,
  FileText,
} from "lucide-react";
import { generateId, formatCurrency } from "@/lib/utils";
import { ZPurchaseOrder, ZPurchaseOrderLine } from "@/erps/mapping/common.types";
import type { PurchaseOrder, PurchaseOrderLine } from "@/erps/mapping/common.types";
import { toast } from "sonner";

// Form schema for PO creation
const POHeaderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  currency: z.string().min(1, "Currency is required"),
  needByDate: z.string().optional(),
  shipTo: z.string().optional(),
  incoterms: z.string().optional(),
  requester: z.string().optional(),
});

const POLineSchema = ZPurchaseOrderLine.omit({ 
  id: true, 
  qtyReceived: true, 
  taxes: true, 
  discounts: true 
});

const POFormSchema = z.object({
  header: POHeaderSchema,
  lines: z.array(POLineSchema).min(1, "At least one line item is required"),
  tax: z.number().min(0).optional(),
  freight: z.number().min(0).optional(),
});

type POFormData = z.infer<typeof POFormSchema>;

const steps = [
  {
    id: "header",
    title: "Header Information",
    description: "Basic purchase order details",
    icon: FileText,
  },
  {
    id: "lines",
    title: "Line Items",
    description: "Add products and services",
    icon: Package,
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Verify and create purchase order",
    icon: Check,
  },
];

export default function CreatePOPage() {
  const router = useRouter();
  const { addPurchaseOrder } = usePOStore();
  const { suppliers } = useSupplierStore();
  const { user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<POFormData>({
    resolver: zodResolver(POFormSchema),
    defaultValues: {
      header: {
        supplierId: "",
        currency: "USD",
        needByDate: "",
        shipTo: "",
        incoterms: "",
        requester: "",
      },
      lines: [
        {
          lineNo: 1,
          description: "",
          uom: "EA",
          qtyOrdered: 1,
          price: 0,
          currency: "USD",
          sku: "",
          needByDate: "",
          shipFrom: "",
          category: "",
        },
      ],
      tax: 0,
      freight: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = form.watch("lines");
  const watchedHeader = form.watch("header");
  const watchedTax = form.watch("tax") || 0;
  const watchedFreight = form.watch("freight") || 0;

  // Calculate totals
  const subtotal = watchedLines.reduce(
    (sum, line) => sum + (line.qtyOrdered * line.price),
    0
  );
  const total = subtotal + watchedTax + watchedFreight;

  const selectedSupplier = suppliers.find(s => s.id === watchedHeader.supplierId);

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = await form.trigger("header");
    } else if (currentStep === 1) {
      isValid = await form.trigger("lines");
    }

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addLineItem = () => {
    const newLineNo = Math.max(...watchedLines.map(l => l.lineNo), 0) + 1;
    append({
      lineNo: newLineNo,
      description: "",
      uom: "EA",
      qtyOrdered: 1,
      price: 0,
      currency: watchedHeader.currency || "USD",
      sku: "",
      needByDate: "",
      shipFrom: "",
      category: "",
    });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one line item is required");
    }
  };

  const handleSubmit = async (data: POFormData) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    if (!selectedSupplier) {
      toast.error("Selected supplier not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const poNumber = `PO-${Date.now().toString().slice(-6)}`;
      const now = new Date().toISOString();

      const newPO: PurchaseOrder = {
        id: generateId(),
        number: poNumber,
        supplierId: data.header.supplierId,
        supplierName: selectedSupplier.name,
        currency: data.header.currency,
        status: "draft",
        rev: 0,
        buyer: user.name || user.email,
        requester: data.header.requester,
        needByDate: data.header.needByDate,
        shipTo: data.header.shipTo,
        incoterms: data.header.incoterms,
        subtotal,
        tax: data.tax,
        freight: data.freight,
        total,
        createdAt: now,
        updatedAt: now,
        lines: data.lines.map((line) => ({
          ...line,
          id: generateId(),
          qtyReceived: 0,
        })),
        approvals: [],
        collaborators: [user.email],
      };

      addPurchaseOrder(newPO);
      toast.success(`Purchase order ${poNumber} created successfully`);
      router.push(`/po/${newPO.id}`);
    } catch (error) {
      console.error("Error creating PO:", error);
      toast.error("Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    form.handleSubmit(handleSubmit)();
  };

  const handleSubmitForApproval = () => {
    form.handleSubmit((data) => {
      // TODO: Update status to pending_approval
      handleSubmit(data);
    })();
  };

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/po")}
          className="px-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Purchase Order</h2>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isCompleted
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div
                  className={`text-sm font-medium ${
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-8 h-px bg-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Step 1: Header Information */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Header Information</CardTitle>
                <CardDescription>
                  Enter the basic purchase order details and shipping information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="header.supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="header.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="header.needByDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Need By Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="header.requester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter requester name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="header.shipTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ship To Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter shipping address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="header.incoterms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incoterms</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select incoterms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                            <SelectItem value="CIF">CIF - Cost, Insurance & Freight</SelectItem>
                            <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                            <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Line Items */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>
                  Add products and services to your purchase order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Items</h4>
                    <Button type="button" variant="outline" onClick={addLineItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Description *</TableHead>
                          <TableHead>Qty *</TableHead>
                          <TableHead>UOM</TableHead>
                          <TableHead>Price *</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.sku`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="SKU" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Item description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.qtyOrdered`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.uom`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="EA">Each</SelectItem>
                                        <SelectItem value="KG">Kilogram</SelectItem>
                                        <SelectItem value="LB">Pound</SelectItem>
                                        <SelectItem value="HR">Hour</SelectItem>
                                        <SelectItem value="MT">Meter</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                watchedLines[index]?.qtyOrdered * watchedLines[index]?.price || 0,
                                watchedHeader.currency || "USD"
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLineItem(index)}
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Additional Charges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <Label>Subtotal</Label>
                      <div className="text-lg font-medium">
                        {formatCurrency(subtotal, watchedHeader.currency || "USD")}
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="freight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Freight</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(total, watchedHeader.currency || "USD")}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Review your purchase order details and submit for approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header Summary */}
                <div>
                  <h4 className="font-medium mb-3">Header Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Supplier:</span>
                      <div className="font-medium">{selectedSupplier?.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Currency:</span>
                      <div className="font-medium">{watchedHeader.currency}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Need By Date:</span>
                      <div className="font-medium">{watchedHeader.needByDate || "—"}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Requester:</span>
                      <div className="font-medium">{watchedHeader.requester || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Lines Summary */}
                <div>
                  <h4 className="font-medium mb-3">Line Items ({fields.length})</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchedLines.map((line, index) => (
                          <TableRow key={index}>
                            <TableCell>{line.description}</TableCell>
                            <TableCell>{line.qtyOrdered} {line.uom}</TableCell>
                            <TableCell>{formatCurrency(line.price, line.currency)}</TableCell>
                            <TableCell>{formatCurrency(line.qtyOrdered * line.price, line.currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal, watchedHeader.currency)}</span>
                      </div>
                      {watchedTax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatCurrency(watchedTax, watchedHeader.currency)}</span>
                        </div>
                      )}
                      {watchedFreight > 0 && (
                        <div className="flex justify-between">
                          <span>Freight:</span>
                          <span>{formatCurrency(watchedFreight, watchedHeader.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(total, watchedHeader.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              {currentStep === steps.length - 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Submit for Approval"}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}






