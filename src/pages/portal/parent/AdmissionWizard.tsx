import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StepIndicator } from '../../../components/ui/StepIndicator';
import { useAuth } from '../../../lib/auth';

const GRADE_OPTIONS = ['Kindergarten', 'Grade 1', 'Grade 2-5', 'Grade 6-12'];

export function AdmissionWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    studentFirstName: '',
    studentLastName: '',
    dateOfBirth: '',
    gradeLevel: 'Kindergarten',
    nationality: '',
    gender: '',
    parentName: user?.fullName || '',
    parentEmail: user?.email || '',
    parentPhone: '',
    parentRelationship: 'father',
    parentNationality: '',
    parentEmployer: '',
    previousSchool: '',
    languagesSpoken: '',
    specialNeeds: false,
    specialNeedsDetails: '',
    academicYear: '2026-2027',
    siblingEnrolled: false,
    termsAccepted: false,
  });

  const steps = [
    t('admission.steps.student'),
    t('admission.steps.family'),
    t('admission.steps.school'),
    t('admission.steps.review'),
  ];

  const mutation = useMutation({
    mutationFn: () =>
      admissionsApi.create({
        ...form,
        currentStep: step,
      }),
    onSuccess: ({ data }) => navigate(`/portal/parent/admissions/${data.id}`),
  });

  function next() {
    if (step < 4) setStep(step + 1);
    else mutation.mutate();
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark">{t('portal.parent.newApplication')}</h2>
        <p className="text-neutral-medium text-sm mt-1">{t('admission.wizardSubtitle')}</p>
      </div>

      <StepIndicator steps={steps} currentStep={step} />

      <div className="glass-card rounded-2xl p-6 space-y-4">
        {step === 1 && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('admission.studentFirstName')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.studentFirstName} onChange={(e) => setForm({ ...form, studentFirstName: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('admission.studentLastName')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.studentLastName} onChange={(e) => setForm({ ...form, studentLastName: e.target.value })} required />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.dateOfBirth')}</span>
              <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.gradeLevel')}</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}>
                {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('admission.nationality')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('admission.gender')}</span>
                <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">—</option>
                  <option value="male">{t('admission.male')}</option>
                  <option value="female">{t('admission.female')}</option>
                </select>
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.parentName')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} required />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium">{t('admission.parentEmail')}</span>
                <input type="email" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t('admission.parentPhone')}</span>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.parentRelationship')}</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.parentRelationship} onChange={(e) => setForm({ ...form, parentRelationship: e.target.value })}>
                <option value="father">{t('admission.father')}</option>
                <option value="mother">{t('admission.mother')}</option>
                <option value="guardian">{t('admission.guardian')}</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.parentEmployer')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.parentEmployer} onChange={(e) => setForm({ ...form, parentEmployer: e.target.value })} />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.previousSchool')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.previousSchool} onChange={(e) => setForm({ ...form, previousSchool: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t('admission.languagesSpoken')}</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.languagesSpoken} onChange={(e) => setForm({ ...form, languagesSpoken: e.target.value })} placeholder="Arabic, English" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.specialNeeds} onChange={(e) => setForm({ ...form, specialNeeds: e.target.checked })} />
              {t('admission.specialNeeds')}
            </label>
            {form.specialNeeds && (
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.specialNeedsDetails} onChange={(e) => setForm({ ...form, specialNeedsDetails: e.target.value })} placeholder={t('admission.specialNeedsDetails')} />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.siblingEnrolled} onChange={(e) => setForm({ ...form, siblingEnrolled: e.target.checked })} />
              {t('admission.siblingEnrolled')}
            </label>
          </>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <p><strong>{t('admission.studentFirstName')}:</strong> {form.studentFirstName} {form.studentLastName}</p>
            <p><strong>{t('admission.gradeLevel')}:</strong> {form.gradeLevel}</p>
            <p><strong>{t('admission.parentName')}:</strong> {form.parentName}</p>
            <p><strong>{t('admission.parentEmail')}:</strong> {form.parentEmail}</p>
            <label className="flex items-start gap-2 mt-4">
              <input type="checkbox" checked={form.termsAccepted} onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })} required />
              <span>{t('admission.termsAccepted')}</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1}>{t('common.back')}</Button>
        <Button
          variant="gold"
          onClick={next}
          disabled={mutation.isPending || (step === 4 && !form.termsAccepted)}
        >
          {step === 4 ? t('admission.createAndContinue') : t('common.next')}
        </Button>
      </div>
    </div>
  );
}
