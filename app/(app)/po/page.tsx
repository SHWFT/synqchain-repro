'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePOStore } from '@/state/po.store';
import { useSupplierStore } from '@/state/suppliers.store';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getStatusDisplay } from '@/lib/po-state-machine';
import type { PurchaseOrder } from '@/erps/mapping/common.types';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<PurchaseOrder>();

export default function POListPage() {
  const router = useRouter();
  const {
    getFilteredPOs,
    filters,
    setFilters,
    clearFilters,
    deletePurchaseOrder,
    loading,
  } = usePOStore();
  const { suppliers } = useSupplierStore();

  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredPOs = getFilteredPOs();

  const columns = [
    columnHelper.accessor('number', {
      header: 'PO Number',
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
    columnHelper.accessor('supplierName', {
      header: 'Supplier',
      cell: (info) => <div className="font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        const statusInfo = getStatusDisplay(status);
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    }),
    columnHelper.accessor('rev', {
      header: 'Rev',
      cell: (info) => (
        <span className="text-sm text-gray-500">v{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: (info) => (
        <div className="font-medium">
          {formatCurrency(info.getValue(), info.row.original.currency)}
        </div>
      ),
    }),
    columnHelper.accessor('needByDate', {
      header: 'Need By',
      cell: (info) => {
        const date = info.getValue();
        return date ? (
          <span className="text-sm">{formatDate(date)}</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      cell: (info) => (
        <span className="text-sm text-gray-500">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/po/${info.row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {info.row.original.status === 'draft' && (
              <DropdownMenuItem
                onClick={() => router.push(`/po/${info.row.original.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('Are you sure you want to delete this PO?')) {
                  deletePurchaseOrder(info.row.original.id);
                  toast.success('Purchase order deleted successfully');
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredPOs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleExportCSV = () => {
    const csvData = filteredPOs.map((po) => ({
      'PO Number': po.number,
      Supplier: po.supplierName,
      Status: po.status,
      Revision: po.rev,
      Total: po.total,
      Currency: po.currency,
      'Need By Date': po.needByDate || '',
      Buyer: po.buyer,
      Created: po.createdAt,
      Updated: po.updatedAt,
    }));

    // Simple CSV export
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row] || ''}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Purchase orders exported to CSV');
  };

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">PO Management</h2>
          <p className="text-muted-foreground">
            Manage purchase orders and track procurement activities.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => router.push('/po/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New PO
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search POs..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="pl-10 w-80"
          />
        </div>

        <Select
          value={filters.supplierId || 'all'}
          onValueChange={(value) =>
            setFilters({ supplierId: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            // TODO: Implement multi-select status filter
            toast.info('Status filtering coming soon!');
          }}
        >
          <Filter className="mr-2 h-4 w-4" />
          Status
        </Button>

        {(filters.searchQuery ||
          filters.supplierId ||
          filters.status.length > 0) && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
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
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/po/${row.original.id}`)}
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
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading purchase orders...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No purchase orders found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Get started by creating your first purchase order.
                      </p>
                      <Button onClick={() => router.push('/po/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Purchase Order
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredPOs.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredPOs.length} purchase order
            {filteredPOs.length !== 1 ? 's' : ''}
          </div>
          <div>
            Total value:{' '}
            {formatCurrency(
              filteredPOs.reduce((sum, po) => sum + po.total, 0),
              'USD' // TODO: Handle multiple currencies
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Import missing icon
import { ShoppingCart } from 'lucide-react';
