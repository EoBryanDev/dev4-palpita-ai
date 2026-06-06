import { cn } from '@/lib/utils';
import * as React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
