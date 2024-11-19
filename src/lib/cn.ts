import { extendTailwindMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

const twMergeCustom = extendTailwindMerge({
  prefix: 'fd-',
});

export function cn(...inputs: ClassValue[]) {
  return twMergeCustom(clsx(inputs));
}
