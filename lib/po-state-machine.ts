import type { POStatus } from "@/erps/mapping/common.types";

// PO State Machine - Defines allowed transitions
export const PO_STATE_TRANSITIONS: Record<POStatus, POStatus[]> = {
  draft: ["pending_approval", "cancelled"],
  pending_approval: ["approved", "cancelled"],
  approved: ["released", "change_requested", "cancelled"],
  released: ["sent_to_supplier", "change_requested", "cancelled"],
  sent_to_supplier: ["supplier_acknowledged", "change_requested", "cancelled"],
  supplier_acknowledged: ["partially_shipped", "in_transit", "change_requested", "cancelled"],
  change_requested: ["amended", "cancelled"],
  amended: ["pending_approval", "cancelled"], // Rev + 1, re-approval needed
  partially_shipped: ["in_transit", "partially_received", "cancelled"],
  in_transit: ["partially_received", "cancelled"],
  partially_received: ["received_closed", "cancelled"],
  received_closed: [], // Terminal state
  cancelled: [], // Terminal state
};

// Check if a state transition is valid
export function isValidTransition(from: POStatus, to: POStatus): boolean {
  return PO_STATE_TRANSITIONS[from].includes(to);
}

// Get allowed next states
export function getAllowedTransitions(status: POStatus): POStatus[] {
  return PO_STATE_TRANSITIONS[status];
}

// Check if status is terminal (no more transitions allowed)
export function isTerminalStatus(status: POStatus): boolean {
  return PO_STATE_TRANSITIONS[status].length === 0;
}

// Get status display info
export function getStatusDisplay(status: POStatus): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} {
  const statusInfo = {
    draft: { label: "Draft", variant: "outline" as const, color: "gray" },
    pending_approval: { label: "Pending Approval", variant: "secondary" as const, color: "yellow" },
    approved: { label: "Approved", variant: "default" as const, color: "green" },
    released: { label: "Released", variant: "default" as const, color: "blue" },
    sent_to_supplier: { label: "Sent to Supplier", variant: "default" as const, color: "purple" },
    supplier_acknowledged: { label: "Acknowledged", variant: "default" as const, color: "indigo" },
    change_requested: { label: "Change Requested", variant: "secondary" as const, color: "orange" },
    amended: { label: "Amended", variant: "secondary" as const, color: "cyan" },
    partially_shipped: { label: "Partially Shipped", variant: "default" as const, color: "teal" },
    in_transit: { label: "In Transit", variant: "default" as const, color: "blue" },
    partially_received: { label: "Partially Received", variant: "default" as const, color: "emerald" },
    received_closed: { label: "Received & Closed", variant: "default" as const, color: "green" },
    cancelled: { label: "Cancelled", variant: "destructive" as const, color: "red" },
  };

  return statusInfo[status];
}

// Business rule helpers
export function canEditLines(status: POStatus): boolean {
  return status === "draft" || status === "amended";
}

export function canSubmitForApproval(status: POStatus): boolean {
  return status === "draft" || status === "amended";
}

export function canApprove(status: POStatus): boolean {
  return status === "pending_approval";
}

export function canAcknowledge(status: POStatus): boolean {
  return status === "sent_to_supplier" || status === "approved" || status === "released";
}

export function canRequestChange(status: POStatus): boolean {
  return ["approved", "released", "sent_to_supplier", "supplier_acknowledged"].includes(status);
}

export function canCreateASN(status: POStatus): boolean {
  return ["supplier_acknowledged", "approved", "released"].includes(status);
}

export function canReceive(status: POStatus): boolean {
  return ["partially_shipped", "in_transit", "supplier_acknowledged"].includes(status);
}

export function canCreateInvoice(status: POStatus): boolean {
  return ["partially_received", "received_closed", "supplier_acknowledged"].includes(status);
}

export function canCancel(status: POStatus): boolean {
  return !isTerminalStatus(status);
}

// Validation helpers
export function validateTransition(
  from: POStatus, 
  to: POStatus, 
  context?: { hasLineItems?: boolean; allQuantitiesReceived?: boolean }
): { valid: boolean; reason?: string } {
  if (!isValidTransition(from, to)) {
    return { 
      valid: false, 
      reason: `Cannot transition from ${from} to ${to}. Allowed transitions: ${getAllowedTransitions(from).join(", ")}` 
    };
  }

  // Business rule validations
  if (to === "pending_approval" && context?.hasLineItems === false) {
    return { valid: false, reason: "Cannot submit for approval without line items" };
  }

  if (to === "received_closed" && context?.allQuantitiesReceived === false) {
    return { valid: false, reason: "Cannot close PO until all quantities are received" };
  }

  return { valid: true };
}

// Get next recommended action based on current status
export function getRecommendedActions(status: POStatus): Array<{
  action: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon?: string;
}> {
  const actions = [];

  switch (status) {
    case "draft":
      actions.push(
        { action: "submit", label: "Submit for Approval", variant: "default" as const, icon: "CheckCircle" },
        { action: "edit", label: "Edit", variant: "outline" as const, icon: "Edit" },
        { action: "cancel", label: "Cancel", variant: "destructive" as const, icon: "X" }
      );
      break;

    case "pending_approval":
      actions.push(
        { action: "approve", label: "Approve", variant: "default" as const, icon: "Check" },
        { action: "reject", label: "Reject", variant: "destructive" as const, icon: "X" }
      );
      break;

    case "approved":
    case "released":
    case "sent_to_supplier":
      actions.push(
        { action: "acknowledge", label: "Acknowledge", variant: "default" as const, icon: "HandHeart" },
        { action: "requestChange", label: "Request Change", variant: "outline" as const, icon: "Edit" },
        { action: "createASN", label: "Create ASN", variant: "secondary" as const, icon: "Truck" }
      );
      break;

    case "supplier_acknowledged":
      actions.push(
        { action: "createASN", label: "Create ASN", variant: "default" as const, icon: "Truck" },
        { action: "receive", label: "Receive", variant: "secondary" as const, icon: "Package" },
        { action: "requestChange", label: "Request Change", variant: "outline" as const, icon: "Edit" }
      );
      break;

    case "partially_shipped":
    case "in_transit":
      actions.push(
        { action: "receive", label: "Receive", variant: "default" as const, icon: "Package" }
      );
      break;

    case "partially_received":
      actions.push(
        { action: "receive", label: "Receive More", variant: "default" as const, icon: "Package" },
        { action: "createInvoice", label: "Create Invoice", variant: "secondary" as const, icon: "FileText" }
      );
      break;

    case "received_closed":
      actions.push(
        { action: "createInvoice", label: "Create Invoice", variant: "default" as const, icon: "FileText" },
        { action: "downloadCSV", label: "Download CSV", variant: "outline" as const, icon: "Download" }
      );
      break;

    case "change_requested":
      actions.push(
        { action: "approveChange", label: "Approve Change", variant: "default" as const, icon: "Check" },
        { action: "rejectChange", label: "Reject Change", variant: "destructive" as const, icon: "X" }
      );
      break;
  }

  return actions;
}






