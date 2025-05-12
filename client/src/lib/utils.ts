import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate age based on birth month and year
 * @param birthMonth Month of birth (1-12)
 * @param birthYear Year of birth
 * @returns Age in years
 */
export function calculateAge(birthMonth: number, birthYear: number): number {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = today.getFullYear();
  
  let age = currentYear - birthYear;
  
  // If this year's birthday hasn't occurred yet, subtract one year
  if (currentMonth < birthMonth) {
    age--;
  }
  
  return Math.max(0, age); // Ensure age is never negative
}
