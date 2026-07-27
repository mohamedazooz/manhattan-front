import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { careersApi } from '../../api';
import { Card } from '../../components/ui/Card';
import { StatusBadge, LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';

export function CareersPage() {
  const lang = useAppLanguage();
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', lang],
    queryFn: () => careersApi.list(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <PageHeader title="Careers" subtitle="Join our team of dedicated educators" />
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link key={job.id} to={`/careers/${job.id}`}>
            <Card className="hover:shadow-lg transition-shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-neutral-medium">{job.location} · {job.employmentType.replace('_', ' ')}</p>
              </div>
              <StatusBadge status={job.status} />
            </Card>
          </Link>
        ))}
      </div>
      {!jobs.length && <p className="text-neutral-medium">No open positions at this time.</p>}
    </div>
  );
}
