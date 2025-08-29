"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePOStore } from "@/state/po.store";
import { useAuthStore } from "@/state/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Edit,
  CheckCircle,
  XCircle,
  HandHeart,
  Truck,
  Package,
  FileText,
  MessageSquare,
  Clock,
  Download,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { 
  getStatusDisplay, 
  getRecommendedActions,
  canEditLines,
  canSubmitForApproval,
  canApprove,
  canAcknowledge,
  canRequestChange,
  canCreateASN,
  canReceive,
  canCreateInvoice,
  canCancel
} from "@/lib/po-state-machine";
import type { PurchaseOrder } from "@/erps/mapping/common.types";
import { toast } from "sonner";

export default function PODetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const { 
    getPOById, 
    getComments, 
    getASNs, 
    getReceipts, 
    getInvoices, 
    getChangeOrders,
    updatePurchaseOrder 
  } = usePOStore();
  
  const [activeTab, setActiveTab] = useState("lines");

  const poId = params?.poId as string;
  const po = getPOById(poId);

  const comments = useMemo(() => getComments(poId), [getComments, poId]);
  const asns = useMemo(() => getASNs(poId), [getASNs, poId]);
  const receipts = useMemo(() => getReceipts(poId), [getReceipts, poId]);
  const invoices = useMemo(() => getInvoices(poId), [getInvoices, poId]);
  const changeOrders = useMemo(() => getChangeOrders(poId), [getChangeOrders, poId]);

  if (!po) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">Purchase Order Not Found</h2>
        <p className="text-muted-foreground">The requested purchase order could not be found.</p>
        <Button onClick={() => router.push("/po")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to PO List
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(po.status);
  const recommendedActions = getRecommendedActions(po.status);

  const handleStatusAction = (action: string) => {
    const now = new Date().toISOString();
    
    switch (action) {
      case "submit":
        updatePurchaseOrder(po.id, {
          status: "pending_approval",
          submittedAt: now,
          updatedAt: now,
        });
        toast.success("Purchase order submitted for approval");
        break;
        
      case "approve":
        updatePurchaseOrder(po.id, {
          status: "approved",
          approvedAt: now,
          updatedAt: now,
        });
        toast.success("Purchase order approved");
        break;
        
      case "acknowledge":
        updatePurchaseOrder(po.id, {
          status: "supplier_acknowledged",
          updatedAt: now,
        });
        toast.success("Purchase order acknowledged");
        break;
        
      case "cancel":
        if (confirm("Are you sure you want to cancel this purchase order?")) {
          updatePurchaseOrder(po.id, {
            status: "cancelled",
            updatedAt: now,
          });
          toast.success("Purchase order cancelled");
        }
        break;
        
      default:
        toast.info(`${action} feature coming soon!`);
    }
  };

  const calculateLineTotal = (line: any) => line.qtyOrdered * line.price;
  const subtotal = po.lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/po")}
          className="px-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Purchase Order {po.number}
            </h2>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
            {po.rev > 0 && (
              <Badge variant="outline">Rev {po.rev}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {po.supplierName} • {formatCurrency(po.total, po.currency)} • 
            Created {formatDate(po.createdAt)}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {recommendedActions.slice(0, 3).map((action) => (
            <Button
              key={action.action}
              variant={action.variant}
              size="sm"
              onClick={() => handleStatusAction(action.action)}
            >
              {action.label}
            </Button>
          ))}
          
          {canEditLines(po.status) && (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* PO Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Supplier</span>
              <div className="font-medium">{po.supplierName}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Currency</span>
              <div className="font-medium">{po.currency}</div>
            </div>
            {po.incoterms && (
              <div>
                <span className="text-sm text-muted-foreground">Incoterms</span>
                <div className="font-medium">{po.incoterms}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Buyer</span>
              <div className="font-medium">{po.buyer}</div>
            </div>
            {po.requester && (
              <div>
                <span className="text-sm text-muted-foreground">Requester</span>
                <div className="font-medium">{po.requester}</div>
              </div>
            )}
            {po.needByDate && (
              <div>
                <span className="text-sm text-muted-foreground">Need By</span>
                <div className="font-medium">{formatDate(po.needByDate)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(po.subtotal, po.currency)}</span>
            </div>
            {po.tax && po.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(po.tax, po.currency)}</span>
              </div>
            )}
            {po.freight && po.freight > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Freight</span>
                <span className="font-medium">{formatCurrency(po.freight, po.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(po.total, po.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="lines">Line Items</TabsTrigger>
          <TabsTrigger value="collaboration">
            Comments
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {comments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="shipments">
            Shipments
            {asns.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {asns.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="receipts">
            Receipts
            {receipts.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {receipts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices
            {invoices.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {invoices.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Line Items Tab */}
        <TabsContent value="lines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Line Items ({po.lines.length})</CardTitle>
              <CardDescription>
                Items and services included in this purchase order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty Ordered</TableHead>
                    <TableHead>Qty Received</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.lineNo}</TableCell>
                      <TableCell className="font-mono text-sm">{line.sku || "—"}</TableCell>
                      <TableCell>
                        <div className="font-medium">{line.description}</div>
                        {line.category && (
                          <div className="text-sm text-muted-foreground">{line.category}</div>
                        )}
                      </TableCell>
                      <TableCell>{line.qtyOrdered} {line.uom}</TableCell>
                      <TableCell>
                        <div className={line.qtyReceived > 0 ? "text-green-600 font-medium" : ""}>
                          {line.qtyReceived} {line.uom}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(line.price, line.currency)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calculateLineTotal(line), line.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Comments and communication thread for this purchase order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{comment.author}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(comment.at)}
                        </div>
                      </div>
                      <div className="text-sm">{comment.body}</div>
                      {comment.mentions && comment.mentions.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Mentions: {comment.mentions.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No comments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advance Shipping Notices (ASN)</CardTitle>
              <CardDescription>
                Shipment notifications and tracking information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asns.length > 0 ? (
                <div className="space-y-4">
                  {asns.map((asn) => (
                    <div key={asn.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">ASN {asn.id}</div>
                        <Badge variant={
                          asn.status === "delivered" ? "default" :
                          asn.status === "in_transit" ? "secondary" : "outline"
                        }>
                          {asn.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Carrier:</span>
                          <div>{asn.carrier || "—"}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tracking:</span>
                          <div className="font-mono">{asn.tracking || "—"}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ship Date:</span>
                          <div>{formatDate(asn.shipDate)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ETA:</span>
                          <div>{asn.eta ? formatDate(asn.eta) : "—"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No shipments yet</p>
                  {canCreateASN(po.status) && (
                    <Button className="mt-4" onClick={() => toast.info("ASN creation coming soon!")}>
                      <Truck className="h-4 w-4 mr-2" />
                      Create ASN
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
              <CardDescription>
                Record of received items and their condition.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length > 0 ? (
                <div className="space-y-4">
                  {receipts.map((receipt) => (
                    <div key={receipt.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Receipt {receipt.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(receipt.date)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {receipt.lines.map((line, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>Qty Received: {line.qtyReceived}</span>
                            {line.condition && (
                              <Badge variant={
                                line.condition === "ok" ? "default" :
                                line.condition === "damaged" ? "destructive" : "secondary"
                              }>
                                {line.condition}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No receipts recorded</p>
                  {canReceive(po.status) && (
                    <Button className="mt-4" onClick={() => toast.info("Receipt creation coming soon!")}>
                      <Package className="h-4 w-4 mr-2" />
                      Create Receipt
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Invoice matching and payment processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Invoice {invoice.invoiceNo}</div>
                        <Badge variant={
                          invoice.status === "matched" ? "default" :
                          invoice.status === "blocked" ? "destructive" : "secondary"
                        }>
                          {invoice.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <div>{formatDate(invoice.date)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <div className="font-medium">
                            {formatCurrency(invoice.total, invoice.currency)}
                          </div>
                        </div>
                      </div>
                      {invoice.match.withinTolerance && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Within tolerance - {invoice.match.type} match
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No invoices submitted</p>
                  {canCreateInvoice(po.status) && (
                    <Button className="mt-4" onClick={() => toast.info("Invoice creation coming soon!")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete history of changes and approvals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* PO Creation */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Purchase order created</div>
                    <div className="text-sm text-muted-foreground">
                      Created by {po.buyer} • {formatDateTime(po.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Approvals */}
                {po.approvals.map((approval) => (
                  <div key={approval.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      approval.action === "approved" ? "bg-green-100" : 
                      approval.action === "rejected" ? "bg-red-100" : "bg-gray-100"
                    }`}>
                      {approval.action === "approved" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : approval.action === "rejected" ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        Purchase order {approval.action}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {approval.action} by {approval.approver} • {formatDateTime(approval.at)}
                      </div>
                      {approval.comment && (
                        <div className="text-sm mt-1 p-2 bg-gray-50 rounded">
                          {approval.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Status changes */}
                {po.submittedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Submitted for approval</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(po.submittedAt)}
                      </div>
                    </div>
                  </div>
                )}

                {po.approvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Purchase order approved</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(po.approvedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}






