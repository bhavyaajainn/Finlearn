import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const normalizeToken = (token: string): string => {
  return token
    .replace(/^[\p{P}\s]+|[\p{P}\s]+$/gu, '') // remove surrounding punctuation
    .toLowerCase()
    .replace(/(ing|ed|s)$/, ''); // crude stemming
};
