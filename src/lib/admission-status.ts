export type AdmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

export const ADMISSION_STATUS_TRANSITIONS: Record<AdmissionStatus, AdmissionStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
};

export function getAllowedAdmissionStatuses(current: AdmissionStatus): AdmissionStatus[] {
  const allowed = ADMISSION_STATUS_TRANSITIONS[current] ?? [];
  return [current, ...allowed];
}
