'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePOStore } from '@/state/po.store';
import { useAuthStore } from '@/state/auth.store';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';

import type { PurchaseOrder } from '@/erps/mapping/common.types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const columnHelper = createColumnHelper<PurchaseOrder>();

const ApprovalActionSchema = z.object({
  comment: z.string().optional(),
});

type ApprovalActionData = z.infer<typeof ApprovalActionSchema>;

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getMyApprovals, updatePurchaseOrder } = usePOStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ApprovalActionData>({
    resolver: zodResolver(ApprovalActionSchema),
    defaultValues: {
      comment: '',
    },
  });

  // Get pending approvals for current user
  const pendingApprovals = getMyApprovals(
    user?.name || user?.email || 'Demo User'
  );

  const handleApprovalAction = async (data: ApprovalActionData) => {
    if (!selectedPO || !actionType || !user) {
      return;
    }

    try {
      const now = new Date().toISOString();
      const approver = user.name || user.email;

      // Update PO status and add approval record
      const updatedPO = {
        ...selectedPO,
        status:
          actionType === 'approve'
            ? ('approved' as const)
            : ('cancelled' as const),
        approvedAt: actionType === 'approve' ? now : undefined,
        updatedAt: now,
        approvals: [
          ...selectedPO.approvals,
          {
            id: generateId(),
            approver,
            action:
              actionType === 'approve'
                ? ('approved' as const)
                : ('rejected' as const),
            comment: data.comment,
            at: now,
          },
        ],
      };

      updatePurchaseOrder(selectedPO.id, updatedPO);

      toast.success(
        `Purchase order ${selectedPO.number} ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`
      );

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      setSelectedPO(null);
      setActionType(null);
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    }
  };

  const openApprovalDialog = (
    po: PurchaseOrder,
    action: 'approve' | 'reject'
  ) => {
    setSelectedPO(po);
    setActionType(action);
    setIsDialogOpen(true);
    form.reset();
  };

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
    columnHelper.accessor('requester', {
      header: 'Requester',
      cell: (info) => (
        <div className="text-sm text-gray-600">{info.getValue() || '—'}</div>
      ),
    }),
    columnHelper.accessor('total', {
      header: 'Total Amount',
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
        const isUrgent =
          date &&
          new Date(date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return (
          <div
            className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-600'}`}
          >
            {date ? formatDate(date) : '—'}
            {isUrgent && (
              <div className="flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span className="text-xs">Urgent</span>
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('submittedAt', {
      header: 'Submitted',
      cell: (info) => (
        <div className="text-sm text-gray-600">
          {info.getValue() ? formatDate(info.getValue()!) : '—'}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/po/${info.row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => openApprovalDialog(info.row.original, 'approve')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openApprovalDialog(info.row.original, 'reject')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: pendingApprovals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const totalPendingValue = pendingApprovals.reduce(
    (sum, po) => sum + po.total,
    0
  );

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve pending purchase orders.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold">
                {pendingApprovals.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Pending Approvals
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <div className="text-2xl font-bold">
                {
                  pendingApprovals.filter(
                    (po) =>
                      po.needByDate &&
                      new Date(po.needByDate) <=
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Urgent (&lt; 7 days)
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">$</span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold">
                {formatCurrency(totalPendingValue, 'USD')}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
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
                    <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No pending approvals
                    </h3>
                    <p className="text-gray-500">
                      All purchase orders have been reviewed.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approval Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Purchase Order
            </DialogTitle>
            <DialogDescription>
              {selectedPO && (
                <>
                  {actionType === 'approve' ? 'Approve' : 'Reject'} PO{' '}
                  <span className="font-medium">{selectedPO.number}</span> for{' '}
                  <span className="font-medium">
                    {formatCurrency(selectedPO.total, selectedPO.currency)}
                  </span>
                  ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleApprovalAction)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Comment{' '}
                      {actionType === 'reject' ? '(required)' : '(optional)'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          actionType === 'approve'
                            ? 'Add an optional comment...'
                            : 'Please provide a reason for rejection...'
                        }
                        {...field}
                        required={actionType === 'reject'}
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
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                >
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
