import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isComplete = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                    isComplete && 'bg-sage border-sage text-white',
                    isCurrent && 'bg-primary border-primary text-white',
                    !isComplete && !isCurrent && 'bg-white border-[var(--color-border-subtle)] text-neutral-medium',
                  )}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs text-center hidden sm:block max-w-[80px]',
                    isCurrent ? 'text-primary font-semibold' : 'text-neutral-medium',
                  )}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1',
                    stepNum < currentStep ? 'bg-sage' : 'bg-[var(--color-border-subtle)]',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
