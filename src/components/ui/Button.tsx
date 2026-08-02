import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'gold' | 'sage' | 'white' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  to?: string;
  showArrow?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white',
  secondary: 'bg-sage hover:bg-sage/90 text-white shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
  outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary-light/50 dark:border-amber-400/80 dark:text-amber-300 dark:hover:bg-slate-800',
  gold: 'bg-gold hover:bg-gold/90 text-white shadow-sm dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 dark:font-bold',
  sage: 'border-2 border-sage text-sage bg-white hover:bg-sage-light dark:bg-slate-900 dark:text-emerald-400 dark:border-emerald-500/50 dark:hover:bg-slate-800',
  white: 'bg-white hover:bg-slate-100 text-slate-900 font-bold shadow-md border border-slate-200/80 hover:text-primary-dark dark:!bg-white dark:!text-slate-950 dark:!border-white dark:hover:!bg-slate-100 keep-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs dark:bg-red-600 dark:hover:bg-red-700 dark:text-white',
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
