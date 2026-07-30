import { cn } from '../../lib/utils';
import { Check, Circle, Upload } from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  description?: string;
  status: 'required' | 'uploaded' | 'complete';
  onUpload?: () => void;
  className?: string;
}

export function ChecklistItem({ label, description, status, onUpload, className }: ChecklistItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-colors',
        status === 'complete' && 'border-sage/30 bg-sage-light/50',
        status === 'uploaded' && 'border-gold/30 bg-gold-light/30',
        status === 'required' && 'border-[var(--color-border-subtle)] bg-white',
        className,
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          status === 'complete' && 'bg-sage text-white',
          status === 'uploaded' && 'bg-gold text-white',
          status === 'required' && 'bg-neutral-light text-neutral-medium',
        )}
      >
        {status === 'complete' ? (
          <Check className="w-4 h-4" />
        ) : status === 'uploaded' ? (
          <Upload className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-dark text-sm">{label}</p>
        {description && <p className="text-xs text-neutral-medium mt-0.5">{description}</p>}
      </div>
      {status === 'required' && onUpload && (
        <button
          type="button"
          onClick={onUpload}
          className="text-xs font-semibold text-primary hover:text-primary-dark shrink-0"
        >
          Upload
        </button>
      )}
    </div>
  );
}
