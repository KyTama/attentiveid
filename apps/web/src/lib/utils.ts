import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 * 
 * @example
 * cn("px-4 py-2", "px-6") // -> "py-2 px-6"
 * cn("text-red-500", isActive && "text-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
