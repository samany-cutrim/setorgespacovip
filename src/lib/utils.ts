import { clsx, type ClassValue } from "clsx";
import { parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseDateOnly(dateString: string): Date {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}
