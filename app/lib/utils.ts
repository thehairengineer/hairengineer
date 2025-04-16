import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility functions for formatting and other common operations
 */

/**
 * Format a number to a fixed decimal string with proper handling for undefined/null values
 */
export const formatAmount = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '-';
  return amount.toFixed(2);
};

/**
 * Format currency amount with GHS symbol
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '-';
  return `GHS ${amount.toFixed(2)}`;
};

/**
 * Format a date string into a readable format
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const weekDay = date.toLocaleString('en-US', { weekday: 'short' });
    return `${weekDay}, ${day}, ${month}, ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Generate a unique reference ID
 */
export const generateReferenceId = (prefix: string = 'HAIRSLOT'): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}; 