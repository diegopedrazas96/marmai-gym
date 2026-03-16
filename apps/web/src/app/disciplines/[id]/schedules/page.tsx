'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disciplinesApi, schedulesApi, teachersApi } from '@/lib/api';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { DAY_NAMES, DAY_ORDER } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

function ScheduleForm({ disciplineId, onSubmit, onCancel, loading, teachers }: any) {
  const [form, setForm] = useState({
    disciplineId,
    teacherId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, teacherId: parseInt(form.teacherId) }); }} className="space-y-4">
      <div>
        <label className="label">Profesor *</label>
        <select className="input" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} required>
          <option value="">Seleccionar...</option>
          {teachers.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Día *</label>
        <select className="input" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
          {DAY_ORDER.map((day) => (
            <option key={day} value={day}>{DAY_NAMES[day]}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Inicio *</label>
          <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
        </div>
        <div>
          <label className="label">Fin *</label>
          <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading || !form.teacherId}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function DisciplineSchedulesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const disciplineId = parseInt(id);
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [modal, setModal] = useState(false);

  const { data: discipline, isLoading } = useQuery({
    queryKey: ['discipline', disciplineId],
    queryFn: () => disciplinesApi.getOne(disciplineId),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: teachersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: schedulesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discipline', disciplineId] }); setModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discipline', disciplineId] }),
  });

  const schedulesByDay = DAY_ORDER.reduce<Record<string, any[]>>((acc, day) => {
    acc[day] = discipline?.schedules?.filter((s: any) => s.dayOfWeek === day) ?? [];
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <Link href="/disciplines" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a disciplinas
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: `${discipline?.color}30` }}>
                  <div className="w-full h-full rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: discipline?.color }} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{discipline?.name}</h1>
                  <p className="text-sm text-gray-500">{discipline?.schedules?.length ?? 0} horarios configurados</p>
                </div>
              </div>
              {isAdmin && (
                <button className="btn-primary" onClick={() => setModal(true)}>
                  <Plus className="w-4 h-4" /> Agregar horario
                </button>
              )}
            </div>

            {discipline?.schedules?.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={Calendar}
                  title="Sin horarios configurados"
                  description="Agregá el primer horario para esta disciplina"
                  action={
                    isAdmin ? (
                      <button className="btn-primary" onClick={() => setModal(true)}>
                        <Plus className="w-4 h-4" /> Agregar horario
                      </button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                {DAY_ORDER.filter((day) => schedulesByDay[day].length > 0).map((day) => (
                  <div key={day} className="card p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">{DAY_NAMES[day]}</h2>
                    <div className="space-y-2">
                      {schedulesByDay[day]
                        .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
                        .map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200 font-mono">
                                {s.startTime} – {s.endTime}
                              </span>
                              <span className="text-sm text-gray-700">{s.teacher.name}</span>
                            </div>
                            {isAdmin && (
                              <button
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-600 transition-colors"
                                onClick={() => deleteMutation.mutate(s.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Agregar horario">
        <ScheduleForm
          disciplineId={disciplineId}
          teachers={teachers}
          onSubmit={(data: any) => createMutation.mutate(data)}
          onCancel={() => setModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>
    </AppLayout>
  );
}
