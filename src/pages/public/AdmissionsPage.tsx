import { useQuery } from '@tanstack/react-query';
import { requirementsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth';

export function AdmissionsPage() {
  const { user } = useAuth();
  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements'],
    queryFn: () => requirementsApi.list().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <PageHeader title="Admissions" subtitle="Requirements and enrollment process" />
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {requirements.map((req: { id: string; gradeLevel: string; title: string; description?: string; minAge?: number; maxAge?: number }) => (
          <Card key={req.id}>
            <h3 className="font-semibold text-lg text-primary-dark">{req.title}</h3>
            <p className="text-sm text-neutral-medium mt-1">{req.gradeLevel}</p>
            {req.description && <p className="text-sm mt-3">{req.description}</p>}
            {(req.minAge || req.maxAge) && (
              <p className="text-xs text-neutral-medium mt-2">
                Age: {req.minAge ?? '?'} – {req.maxAge ?? '?'} years
              </p>
            )}
          </Card>
        ))}
      </div>
      <div className="text-center bg-primary-light rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Ready to apply?</h3>
        <Button to={user ? '/portal/admissions/new' : '/register'} showArrow>
          {user ? 'Start Application' : 'Register & Apply'}
        </Button>
      </div>
    </div>
  );
}
