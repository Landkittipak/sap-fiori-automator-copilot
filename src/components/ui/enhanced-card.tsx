
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import * as React from 'react';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hover = true, interactive = false, loading = false, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-200',
          hover && 'hover:shadow-lg hover:-translate-y-1',
          interactive && 'cursor-pointer hover:shadow-xl',
          loading && 'animate-pulse opacity-75',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard };
