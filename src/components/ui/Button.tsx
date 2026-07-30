import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'gold' | 'sage' | 'white';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  to?: string;
  showArrow?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm',
  secondary: 'bg-sage hover:bg-sage/90 text-white shadow-sm',
  outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary-light/50 dark:border-primary-light dark:text-slate-100 dark:hover:bg-slate-800',
  gold: 'bg-gold hover:bg-gold/90 text-white shadow-sm',
  sage: 'border-2 border-sage text-sage bg-white hover:bg-sage-light',
  white: 'bg-white hover:bg-slate-100 text-slate-900 font-bold shadow-md border border-slate-200/80 hover:text-primary-dark',
};

export function Button({
  variant = 'primary',
  className,
  children,
  to,
  showArrow,
  ...props
}: ButtonProps) {
  const cls = cn(
    'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50',
    styles[variant],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
        {showArrow && <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
      {showArrow && <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
    </button>
  );
}
