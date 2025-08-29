// Utility to combine class names, fallback if clsx or tailwind-merge are unavailable

type ClassValue = string | number | null | undefined | ClassValue[] | { [key: string]: boolean };

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const process = (input: ClassValue) => {
    if (!input) return;
    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      input.forEach(process);
    } else if (typeof input === "object") {
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key) && input[key]) {
          classes.push(key);
        }
      }
    }
  };

  inputs.forEach(process);
  return classes.join(" ");
}

// Simple tailwind-merge fallback: just returns the input, no merging
function twMerge(className: string): string {
  return className;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}



