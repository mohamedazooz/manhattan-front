import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  to?: string;
  showArrow?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent/90',
  secondary: 'bg-primary text-white hover:bg-primary-dark',
  outline: 'border-2 border-primary text-primary bg-white hover:bg-primary-light',
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
    'inline-flex items-center gap-2 px-6 py-3 rounded font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50',
    styles[variant],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
        {showArrow && <ArrowRight className="w-4 h-4" />}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
      {showArrow && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
