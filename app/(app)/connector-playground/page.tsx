"use client";

import { useState, useEffect } from "react";
import { Play, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getERPAdapter, listAvailableAdapters, type ERPAdapterID } from "@/erps/adapters";
import { getItem, setItem } from "@/lib/storage";
import { toast } from "@/lib/toast";

type Resource = "suppliers" | "items" | "purchase-orders";
type Operation = "list" | "get" | "create" | "update";

interface TestResult {
  timestamp: string;
  adapter: string;
  resource: string;
  operation: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

export default function ConnectorPlaygroundPage() {
  const [selectedAdapter, setSelectedAdapter] = useState<ERPAdapterID>("mock");
  const [selectedResource, setSelectedResource] = useState<Resource>("suppliers");
  const [selectedOperation, setSelectedOperation] = useState<Operation>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [rawResponse, setRawResponse] = useState<string>("");
  const [createFormData, setCreateFormData] = useState({
    number: "",
    supplierId: "",
    currency: "USD",
    total: "",
  });

  const availableAdapters = listAvailableAdapters();

  useEffect(() => {
    // Load last used adapter
    const lastAdapter = getItem<ERPAdapterID>("playground_adapter", "mock");
    setSelectedAdapter(lastAdapter);
  }, []);

  useEffect(() => {
    // Save adapter selection
    setItem("playground_adapter", selectedAdapter);
  }, [selectedAdapter]);

  const executeTest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const adapter = getERPAdapter(selectedAdapter);
      let result: any;
      let url = "";
      
      // Build API URL based on resource and operation
      if (selectedOperation === "list") {
        url = `/api/erp/${selectedAdapter}/${selectedResource}?limit=10`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        result = await response.json();
      } else if (selectedOperation === "create" && selectedResource === "purchase-orders") {
        url = `/api/erp/${selectedAdapter}/${selectedResource}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: createFormData.number || `PO-${Date.now()}`,
            supplierId: createFormData.supplierId || "demo-supplier-1",
            currency: createFormData.currency,
            total: parseFloat(createFormData.total) || 1000,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        result = await response.json();
      } else {
        // Direct adapter calls for other operations
        switch (selectedOperation) {
          case "list":
            if (selectedResource === "suppliers") {
              result = await adapter.listSuppliers({ limit: 10 });
            } else if (selectedResource === "items") {
              result = await adapter.listItems({ limit: 10 });
            } else if (selectedResource === "purchase-orders") {
              result = await adapter.listPurchaseOrders({ limit: 10 });
            }
            break;
          case "get":
            if (selectedResource === "purchase-orders") {
              result = await adapter.getPurchaseOrder("demo-po-1");
            }
            break;
          default:
            throw new Error(`Operation ${selectedOperation} not supported for ${selectedResource}`);
        }
      }

      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        timestamp: new Date().toISOString(),
        adapter: selectedAdapter,
        resource: selectedResource,
        operation: selectedOperation,
        success: true,
        data: result,
        duration,
      };

      setResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
      setRawResponse(JSON.stringify(result, null, 2));
      toast.success(`${selectedOperation} ${selectedResource} completed successfully`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      const testResult: TestResult = {
        timestamp: new Date().toISOString(),
        adapter: selectedAdapter,
        resource: selectedResource,
        operation: selectedOperation,
        success: false,
        error: errorMessage,
        duration,
      };

      setResults(prev => [testResult, ...prev.slice(0, 9)]);
      setRawResponse(errorMessage);
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setRawResponse("");
  };

  const getOperationLabel = (operation: Operation) => {
    switch (operation) {
      case "list": return "List";
      case "get": return "Get by ID";
      case "create": return "Create";
      case "update": return "Update";
      default: return operation;
    }
  };

  const availableOperations: Operation[] = 
    selectedResource === "purchase-orders" 
      ? ["list", "get", "create"] 
      : ["list"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connector Playground</h1>
        <p className="text-muted-foreground">
          Test ERP adapter endpoints and explore integration capabilities
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure and execute ERP adapter operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ERP Adapter</Label>
              <Select 
                value={selectedAdapter} 
                onChange={(e) => setSelectedAdapter(e.target.value as ERPAdapterID)}
              >
                {availableAdapters.map((adapter) => (
                  <option key={adapter.id} value={adapter.id}>
                    {adapter.name} {!adapter.configured && "(Not configured)"}
                  </option>
                ))}
              </Select>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  availableAdapters.find(a => a.id === selectedAdapter)?.configured 
                    ? "bg-green-500" 
                    : "bg-yellow-500"
                }`} />
                <span className="text-muted-foreground">
                  {availableAdapters.find(a => a.id === selectedAdapter)?.configured 
                    ? "Adapter is configured" 
                    : "Adapter not configured (will show demo behavior)"
                  }
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resource</Label>
              <Select 
                value={selectedResource} 
                onChange={(e) => setSelectedResource(e.target.value as Resource)}
              >
                <option value="suppliers">Suppliers</option>
                <option value="items">Items</option>
                <option value="purchase-orders">Purchase Orders</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operation</Label>
              <Select 
                value={selectedOperation} 
                onChange={(e) => setSelectedOperation(e.target.value as Operation)}
              >
                {availableOperations.map((op) => (
                  <option key={op} value={op}>
                    {getOperationLabel(op)}
                  </option>
                ))}
              </Select>
            </div>

            {/* Create Form for Purchase Orders */}
            {selectedOperation === "create" && selectedResource === "purchase-orders" && (
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">Create Purchase Order</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">PO Number</Label>
                    <Input
                      placeholder="PO-001"
                      value={createFormData.number}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Supplier ID</Label>
                    <Input
                      placeholder="supplier-1"
                      value={createFormData.supplierId}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Currency</Label>
                    <Select 
                      value={createFormData.currency}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={createFormData.total}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, total: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={executeTest} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Execute Test
              </Button>
              <Button variant="outline" onClick={clearResults}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Raw Response */}
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Raw JSON response from the adapter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 h-96 overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {rawResponse || "Execute a test to see the response..."}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results History */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <CardDescription>
              Recent test executions and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Adapter</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.adapter}</Badge>
                    </TableCell>
                    <TableCell>{result.resource}</TableCell>
                    <TableCell>{result.operation}</TableCell>
                    <TableCell>
                      {result.success ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Failed</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {result.duration}ms
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate">
                      {result.success 
                        ? `${result.data?.data?.length || 0} records returned`
                        : result.error
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}






