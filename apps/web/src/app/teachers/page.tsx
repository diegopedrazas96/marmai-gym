'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersApi } from '@/lib/api';
import { useState } from 'react';
import { Plus, UserCheck, Phone, Mail, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

function TeacherForm({ defaultValues, onSubmit, onCancel, loading, isEdit }: any) {
  const [form, setForm] = useState({
    name: defaultValues?.name ?? '',
    email: defaultValues?.user?.email ?? '',
    password: '',
    phone: defaultValues?.phone ?? '',
    specialties: defaultValues?.specialties ?? '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Nombre *</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      {!isEdit && (
        <>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
        </>
      )}
      <div>
        <label className="label">Teléfono</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="label">Especialidades</label>
        <input className="input" placeholder="Yoga, Pilates..." value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function TeachersPage() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: teachersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: teachersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setModal(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => teachersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: teachersApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Profesores"
          description={`${teachers.length} profesores registrados`}
          action={
            isAdmin ? (
              <button className="btn-primary" onClick={() => setModal('create')}>
                <Plus className="w-4 h-4" /> Nuevo profesor
              </button>
            ) : undefined
          }
        />

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : teachers.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No hay profesores"
              description="Agregá el primer profesor para comenzar"
              action={
                isAdmin ? (
                  <button className="btn-primary" onClick={() => setModal('create')}>
                    <Plus className="w-4 h-4" /> Nuevo profesor
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {teachers.map((teacher: any) => (
                <div key={teacher.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-700">{teacher.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {teacher.user?.email}
                      </span>
                      {teacher.phone && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {teacher.phone}
                        </span>
                      )}
                    </div>
                    {teacher.specialties && (
                      <p className="text-xs text-gray-400 mt-0.5">{teacher.specialties}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        onClick={() => { setSelected(teacher); setModal('edit'); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => deleteMutation.mutate(teacher.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Nuevo profesor">
        <TeacherForm
          onSubmit={(data: any) => createMutation.mutate(data)}
          onCancel={() => setModal(null)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Editar profesor">
        <TeacherForm
          defaultValues={selected}
          isEdit
          onSubmit={(data: any) => updateMutation.mutate({ id: selected.id, data })}
          onCancel={() => setModal(null)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </AppLayout>
  );
}
