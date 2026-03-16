'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disciplinesApi } from '@/lib/api';
import { useState } from 'react';
import { Plus, Dumbbell, Users, Calendar, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#64748b',
];

function DisciplineForm({ defaultValues, onSubmit, onCancel, loading }: any) {
  const [form, setForm] = useState({
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    color: defaultValues?.color ?? '#6366f1',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Nombre *</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
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

export default function DisciplinesPage() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const { data: disciplines = [], isLoading } = useQuery({
    queryKey: ['disciplines'],
    queryFn: disciplinesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: disciplinesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['disciplines'] }); setModal(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => disciplinesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['disciplines'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: disciplinesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['disciplines'] }),
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Disciplinas"
          description={`${disciplines.length} disciplinas registradas`}
          action={
            isAdmin ? (
              <button className="btn-primary" onClick={() => setModal('create')}>
                <Plus className="w-4 h-4" /> Nueva disciplina
              </button>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : disciplines.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Dumbbell}
              title="No hay disciplinas"
              description="Creá la primera disciplina para configurar horarios"
              action={
                isAdmin ? (
                  <button className="btn-primary" onClick={() => setModal('create')}>
                    <Plus className="w-4 h-4" /> Nueva disciplina
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {disciplines.map((d: any) => (
              <div key={d.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${d.color}20` }}>
                      <Dumbbell className="w-5 h-5" style={{ color: d.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{d.name}</h3>
                      {d.description && <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={() => { setSelected(d); setModal('edit'); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" onClick={() => deleteMutation.mutate(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    {d._count?.enrollments ?? 0} alumnos
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {d._count?.schedules ?? 0} horarios
                  </div>
                </div>

                <Link
                  href={`/disciplines/${d.id}/schedules`}
                  className="btn-secondary w-full justify-center text-xs py-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Ver horarios
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Nueva disciplina">
        <DisciplineForm
          onSubmit={(data: any) => createMutation.mutate(data)}
          onCancel={() => setModal(null)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Editar disciplina">
        <DisciplineForm
          defaultValues={selected}
          onSubmit={(data: any) => updateMutation.mutate({ id: selected.id, data })}
          onCancel={() => setModal(null)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </AppLayout>
  );
}
