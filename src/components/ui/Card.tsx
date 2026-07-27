import { cn } from '../../lib/utils';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg bg-white p-6 shadow-md', className)}>{children}</div>
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
    primary: 'bg-primary-light text-primary',
    accent: 'bg-accent-soft text-accent',
    gold: 'bg-yellow-50 text-gold',
  }[accent];

  return (
    <Card className="text-center flex flex-col items-center gap-4">
      <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', iconBg)}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)]">{title}</h3>
      <p className="text-neutral-medium text-sm leading-relaxed">{description}</p>
      <a href={link} className="text-accent font-semibold text-sm hover:underline">
        {linkLabel} →
      </a>
    </Card>
  );
}
