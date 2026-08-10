import { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';

import { formDocumentsApi } from '../../api';

import { Button } from '../../components/ui/Button';

import { Input, Select, Textarea } from '../../components/ui/Input';

import { Modal } from '../../components/ui/DataTable';

import { AdminDataTable } from '../../components/admin/AdminDataTable';

import { PageHeader, StatusBadge } from '../../components/ui/Badge';

import { AdminPageGuide } from '../../components/admin/AdminPageGuide';

import { useAppLanguage } from '../../i18n';



const emptyForm = {

  category: 'STUDENT',

  subCategory: 'GENERAL',

  titleAr: '',

  titleEn: '',

  descAr: '',

  descEn: '',

  requiredStatus: 'REQUIRED',

  downloadUrl: '',

  downloadName: '',

  iconType: 'file',

  sortOrder: 0,

};



type FormDocumentRow = {

  id: string;

  category: string;

  subCategory?: string;

  titleAr: string;

  titleEn: string;

  descAr?: string;

  descEn?: string;

  requiredStatus?: string;

  downloadUrl?: string;

  downloadName?: string;

  iconType?: string;

  sortOrder?: number;

  status: string;

};



export function AdminFormDocumentsPage() {

  const { t } = useTranslation();

  const lang = useAppLanguage();

  const qc = useQueryClient();

  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  const [editForm, setEditForm] = useState(emptyForm);

  const [saveError, setSaveError] = useState<string | null>(null);



  const { data: items = [], isLoading } = useQuery({

    queryKey: ['form-documents-admin'],

    queryFn: () => formDocumentsApi.admin().then((r) => r.data),

  });



  const invalidate = () => {

    qc.invalidateQueries({ queryKey: ['form-documents-admin'] });

    qc.invalidateQueries({ queryKey: ['form-documents'] });

  };



  const startEdit = (row: FormDocumentRow) => {

    setEditId(row.id);

    setEditForm({

      category: row.category,

      subCategory: row.subCategory || 'GENERAL',

      titleAr: row.titleAr,

      titleEn: row.titleEn,

      descAr: row.descAr || '',

      descEn: row.descEn || '',

      requiredStatus: row.requiredStatus || 'REQUIRED',

      downloadUrl: row.downloadUrl || '',

      downloadName: row.downloadName || '',

      iconType: row.iconType || 'file',

      sortOrder: row.sortOrder ?? 0,

    });

    setSaveError(null);

    setEditOpen(true);

  };



  return (

    <div className="space-y-6">

      <PageHeader

        title={t('admin.formDocumentsTitle', 'Forms & documents')}

        subtitle={t(

          'admin.formDocumentsSubtitle',

          'Manage forms and documents shown to parents and staff.',

        )}

      />



      <AdminPageGuide guideKey="formDocuments" />



      <form

        className="grid md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800"

        onSubmit={(e) => {

          e.preventDefault();

          formDocumentsApi.create(form).then(() => {

            setForm(emptyForm);

            invalidate();

          });

        }}

      >

        <Select

          label={t('admin.category', 'Category')}

          value={form.category}

          onChange={(e) => setForm({ ...form, category: e.target.value })}

        >

          <option value="STUDENT">STUDENT</option>

          <option value="STAFF">STAFF</option>

        </Select>

        <Input

          label={t('admin.subCategory', 'Sub-category')}

          value={form.subCategory}

          onChange={(e) => setForm({ ...form, subCategory: e.target.value })}

        />

        <Input

          label={t('admin.titleAr', 'Title (Arabic)')}

          value={form.titleAr}

          onChange={(e) => setForm({ ...form, titleAr: e.target.value })}

          required

        />

        <Input

          label={t('admin.titleEn', 'Title (English)')}

          value={form.titleEn}

          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}

          required

        />

        <Textarea

          label={t('admin.descAr', 'Description (Arabic)')}

          value={form.descAr}

          onChange={(e) => setForm({ ...form, descAr: e.target.value })}

          rows={2}

          required

        />

        <Textarea

          label={t('admin.descEn', 'Description (English)')}

          value={form.descEn}

          onChange={(e) => setForm({ ...form, descEn: e.target.value })}

          rows={2}

          required

        />

        <Select

          label={t('admin.requiredStatus', 'Required status')}

          value={form.requiredStatus}

          onChange={(e) => setForm({ ...form, requiredStatus: e.target.value })}

        >

          <option value="REQUIRED">REQUIRED</option>

          <option value="TRANSFER">TRANSFER</option>

          <option value="OPTIONAL">OPTIONAL</option>

        </Select>

        <Input

          label={t('admin.downloadUrl', 'Download URL')}

          value={form.downloadUrl}

          onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}

        />

        <Input

          label={t('admin.downloadName', 'File name')}

          value={form.downloadName}

          onChange={(e) => setForm({ ...form, downloadName: e.target.value })}

        />

        <Input

          label={t('admin.sortOrder', 'Sort order')}

          type="number"

          value={form.sortOrder}

          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}

        />

        <div className="md:col-span-2">

          <Button type="submit">{t('admin.addDocument', 'Add document')}</Button>

        </div>

      </form>



      <AdminDataTable

        isLoading={isLoading}

        data={items}

        emptyTitle={t('admin.formDocumentsEmpty', 'No form documents')}

        columns={[

          {

            key: 'title',

            header: t('admin.title', 'Title'),

            render: (r: FormDocumentRow) => (lang === 'ar' ? r.titleAr : r.titleEn),

          },

          {

            key: 'category',

            header: t('admin.category', 'Category'),

            render: (r: FormDocumentRow) => r.category,

          },

          {

            key: 'status',

            header: t('common.status', 'Status'),

            render: (r: FormDocumentRow) => <StatusBadge status={r.status} />,

          },

          {

            key: 'actions',

            header: t('common.actions', 'Actions'),

            render: (r: FormDocumentRow) => (

              <div className="flex gap-2">

                <Button variant="outline" className="py-1 px-2.5 text-xs" onClick={() => startEdit(r)}>

                  {t('common.edit', 'Edit')}

                </Button>

                <Button

                  variant="secondary"

                  className="py-1 px-2.5 text-xs"

                  onClick={() =>

                    formDocumentsApi

                      .updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')

                      .then(invalidate)

                  }

                >

                  {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}

                </Button>

                <Button

                  variant="danger"

                  className="py-1 px-2.5 text-xs"

                  onClick={() => formDocumentsApi.remove(r.id).then(invalidate)}

                >

                  {t('admin.delete', 'Delete')}

                </Button>

              </div>

            ),

          },

        ]}

      />



      <Modal

        open={editOpen}

        onClose={() => setEditOpen(false)}

        title={t('admin.editDocument', 'Edit document')}

        wide

      >

        <form

          className="grid md:grid-cols-2 gap-4"

          onSubmit={(e) => {

            e.preventDefault();

            if (!editId) return;

            setSaveError(null);

            formDocumentsApi

              .update(editId, editForm)

              .then(() => {

                setEditOpen(false);

                setEditId(null);

                invalidate();

              })

              .catch(() => setSaveError(t('common.errorSave', 'Failed to save')));

          }}

        >

          <Select

            label={t('admin.category', 'Category')}

            value={editForm.category}

            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}

          >

            <option value="STUDENT">STUDENT</option>

            <option value="STAFF">STAFF</option>

          </Select>

          <Input

            label={t('admin.subCategory', 'Sub-category')}

            value={editForm.subCategory}

            onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}

          />

          <Input

            label={t('admin.titleAr', 'Title (Arabic)')}

            value={editForm.titleAr}

            onChange={(e) => setEditForm({ ...editForm, titleAr: e.target.value })}

            required

          />

          <Input

            label={t('admin.titleEn', 'Title (English)')}

            value={editForm.titleEn}

            onChange={(e) => setEditForm({ ...editForm, titleEn: e.target.value })}

            required

          />

          <Textarea

            label={t('admin.descAr', 'Description (Arabic)')}

            value={editForm.descAr}

            onChange={(e) => setEditForm({ ...editForm, descAr: e.target.value })}

            rows={2}

            required

          />

          <Textarea

            label={t('admin.descEn', 'Description (English)')}

            value={editForm.descEn}

            onChange={(e) => setEditForm({ ...editForm, descEn: e.target.value })}

            rows={2}

            required

          />

          <Select

            label={t('admin.requiredStatus', 'Required status')}

            value={editForm.requiredStatus}

            onChange={(e) => setEditForm({ ...editForm, requiredStatus: e.target.value })}

          >

            <option value="REQUIRED">REQUIRED</option>

            <option value="TRANSFER">TRANSFER</option>

            <option value="OPTIONAL">OPTIONAL</option>

          </Select>

          <Input

            label={t('admin.downloadUrl', 'Download URL')}

            value={editForm.downloadUrl}

            onChange={(e) => setEditForm({ ...editForm, downloadUrl: e.target.value })}

          />

          <Input

            label={t('admin.downloadName', 'File name')}

            value={editForm.downloadName}

            onChange={(e) => setEditForm({ ...editForm, downloadName: e.target.value })}

          />

          <Input

            label={t('admin.sortOrder', 'Sort order')}

            type="number"

            value={editForm.sortOrder}

            onChange={(e) => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })}

          />

          {saveError && <p className="md:col-span-2 text-sm text-red-600">{saveError}</p>}

          <div className="md:col-span-2 flex gap-2">

            <Button type="submit">{t('admin.saveChanges', 'Save changes')}</Button>

            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>

              {t('common.cancel', 'Cancel')}

            </Button>

          </div>

        </form>

      </Modal>

    </div>

  );

}

