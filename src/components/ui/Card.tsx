import { cn } from '../../lib/utils';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 shadow-md dark:shadow-slate-950/50 transition-colors',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  link,
  linkLabel,
  accent = 'primary',
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkLabel: string;
  accent?: 'primary' | 'accent' | 'gold';
}) {
  const iconBg = {
    primary: 'bg-primary-light dark:bg-blue-950 text-primary dark:text-blue-400',
    accent: 'bg-accent-soft dark:bg-red-950 text-accent dark:text-red-400',
    gold: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  }[accent];

  return (
    <Card className="text-center flex flex-col items-center gap-4">
      <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', iconBg)}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] text-neutral-dark dark:text-slate-100">{title}</h3>
      <p className="text-neutral-medium dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      <a href={link} className="text-accent dark:text-red-400 font-semibold text-sm hover:underline">
        {linkLabel} →
      </a>
    </Card>
  );
}
