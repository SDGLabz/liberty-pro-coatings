import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class lists, with tailwind-merge resolving conflicting
// utilities (e.g. `bg-surface` vs `bg-brand`) so the last one wins.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
