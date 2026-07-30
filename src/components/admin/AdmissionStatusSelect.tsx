import { useTranslation } from 'react-i18next';
import { Select } from '../ui/Input';
import {
  getAllowedAdmissionStatuses,
  type AdmissionStatus,
} from '../../lib/admission-status';

export function AdmissionStatusSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (status: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const options = getAllowedAdmissionStatuses(value as AdmissionStatus);

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {options.map((status) => (
        <option key={status} value={status}>
          {t(`status.${status}`, status.replace(/_/g, ' '))}
        </option>
      ))}
    </Select>
  );
}
