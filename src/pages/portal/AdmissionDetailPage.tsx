import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge, LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';

export function AdmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState('BIRTH_CERTIFICATE');
  const [file, setFile] = useState<File | null>(null);

  const { data: admission, isLoading } = useQuery({
    queryKey: ['admission', id],
    queryFn: () => admissionsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('documentType', docType);
      if (file) fd.append('file', file);
      return admissionsApi.uploadDocument(id!, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission', id] });
      setFile(null);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => admissionsApi.submit(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admission', id] }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!admission) return <p className="p-12 text-center text-neutral-medium">Application not found</p>;

  const canEdit = admission.status === 'DRAFT' || admission.status === 'SUBMITTED';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title={`${admission.studentFirstName} ${admission.studentLastName}`}
          subtitle={`${admission.gradeLevel} · ${admission.parentEmail}`}
        />
        <StatusBadge status={admission.status} />
      </div>

      <section className="mb-8">
        <h3 className="font-semibold mb-3">Uploaded Documents</h3>
        <ul className="space-y-2 mb-4">
          {(admission.documents || []).map((doc: { id: string; fileName: string; fileUrl: string; documentType: string }) => (
            <li key={doc.id} className="flex justify-between text-sm border rounded p-3 bg-white shadow-sm">
              <span>{doc.documentType.replace(/_/g, ' ')} — {doc.fileName}</span>
              <a href={mediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">View</a>
            </li>
          ))}
          {!admission.documents?.length && <p className="text-sm text-neutral-medium">No documents uploaded yet.</p>}
        </ul>

        {canEdit && (
          <div className="bg-neutral-light rounded p-4 space-y-3">
            <Select label="Document Type" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="PREVIOUS_REPORT">Previous Report</option>
              <option value="HEALTH_RECORD">Health Record</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={() => uploadMutation.mutate()} disabled={!file || uploadMutation.isPending}>
              Upload Document
            </Button>
          </div>
        )}
      </section>

      {admission.status === 'DRAFT' && (
        <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
          Submit Application
        </Button>
      )}
    </div>
  );
}
