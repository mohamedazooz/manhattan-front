import { cn } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export function DataTable({
  columns,
  data,
  emptyMessage = 'No data',
}: {
  columns: Array<{
    key: string;
    header: string;
    render: (row: AnyRow) => React.ReactNode;
  }>;
  data: AnyRow[];
  emptyMessage?: string;
}) {
  if (!data.length) {
    return <p className="text-neutral-medium py-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-neutral-light">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-semibold text-neutral-dark whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row: AnyRow) => (
            <tr key={row.id} className="hover:bg-neutral-light/50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={cn(
          'max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl',
          wide ? 'w-full max-w-3xl' : 'w-full max-w-lg',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-neutral-medium hover:text-neutral-dark">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
