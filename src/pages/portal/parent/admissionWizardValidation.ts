import type { TFunction } from 'i18next';
import type { AdmissionWizardFormState, RequiredDocumentItem } from './admissionWizardConstants';

/** Minimum documents required to proceed in the wizard; others can be completed after submission. */
const MINIMUM_WIZARD_DOCUMENT_CODES = [
  'BIRTH_CERTIFICATE',
  'STUDENT_PHOTO',
  'PARENT_PASSPORT',
] as const;

export function isStep1Valid(form: AdmissionWizardFormState): boolean {
  return (
    form.studentFirstName.trim().length >= 1 &&
    form.studentLastName.trim().length >= 1 &&
    form.dateOfBirth.trim() !== '' &&
    form.gender.trim() !== '' &&
    form.nationality.trim() !== '' &&
    form.gradeLevel.trim() !== ''
  );
}

export function isStep2Valid(form: AdmissionWizardFormState): boolean {
  return (
    form.parentName.trim().length >= 1 &&
    form.parentEmail.trim().length >= 3 &&
    form.parentPhone.trim().length >= 8 &&
    form.emergencyContactPhone.trim().length >= 8
  );
}

export function isStep3Valid(
  _requiredDocumentsList: RequiredDocumentItem[],
  documentFiles: Record<string, File | null>,
): boolean {
  return MINIMUM_WIZARD_DOCUMENT_CODES.every((code) => !!documentFiles[code]);
}

export function getMissingRequiredDocumentCodes(
  requiredDocumentsList: RequiredDocumentItem[],
  documentFiles: Record<string, File | null>,
): string[] {
  return requiredDocumentsList
    .map((doc) => doc.code)
    .filter((code) => !documentFiles[code]);
}

export function isStep4Valid(form: AdmissionWizardFormState): boolean {
  return (
    (!form.hasAllergy || form.allergyDetails.trim().length >= 1) &&
    (!form.specialNeeds || form.specialNeedsDetails.trim().length >= 1)
  );
}

export function isStep5Valid(form: AdmissionWizardFormState): boolean {
  return form.termsAccepted && form.signedByName.trim().length >= 1;
}

export function isCurrentStepValid(
  step: number,
  form: AdmissionWizardFormState,
  requiredDocumentsList: RequiredDocumentItem[],
  documentFiles: Record<string, File | null>,
): boolean {
  if (step === 1) return isStep1Valid(form);
  if (step === 2) return isStep2Valid(form);
  if (step === 3) return isStep3Valid(requiredDocumentsList, documentFiles);
  if (step === 4) return isStep4Valid(form);
  if (step === 5) return isStep5Valid(form);
  return true;
}

export function getStepValidationHint(
  step: number,
  form: AdmissionWizardFormState,
  requiredDocumentsList: RequiredDocumentItem[],
  documentFiles: Record<string, File | null>,
): string | null {
  if (step === 1 && !isStep1Valid(form)) {
    return 'يرجى استكمال الحقول المطلوبة للطالب: اسم الطالب الأول، اسم العائلة، تاريخ الميلاد، الجنس، والجنسية.';
  }
  if (step === 2 && !isStep2Valid(form)) {
    return 'يرجى استكمال الحقول المطلوبة للوالدين: اسم ولي الأمر، البريد الإلكتروني، هاتف ولي الأمر وهاتف الطوارئ (8 أرقام على الأقل).';
  }
  if (step === 3 && !isStep3Valid(requiredDocumentsList, documentFiles)) {
    return 'يرجى رفع المستندات الأساسية للمتابعة: شهادة الميلاد، صورة الطالب، وبطاقة/جواز ولي الأمر. يمكنك استكمال باقي المستندات بعد الإرسال.';
  }
  if (step === 4 && !isStep4Valid(form)) {
    return 'يرجى كتابة تفاصيل الحساسية أو الرعاية الخاصة المطلوبة للطالب.';
  }
  if (step === 5 && !isStep5Valid(form)) {
    return 'يرجى إدخال اسم ولي الأمر الموقّع بالكامل والموافقة على الشروط واللوائح التنظيمية.';
  }
  return null;
}

export function buildAdmissionSteps(t: TFunction): string[] {
  return [
    t('admission.steps.student', 'بيانات الطالب'),
    t('admission.steps.family', 'بيانات الأسرة والطوارئ'),
    t('admission.steps.documents', 'رفع المستندات'),
    t('admission.steps.health', 'السجل الطبي والصحي'),
    t('admission.steps.policies', 'اللوائح والتوقيع'),
    t('admission.steps.review', 'مراجعة واعتماد الطلب'),
  ];
}
