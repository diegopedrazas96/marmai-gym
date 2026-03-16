'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/lib/api';
import { useState } from 'react';
import { Plus, Search, Users, Phone, Mail, UserX, Pencil } from 'lucide-react';
import Link from 'next/link';

function StudentForm({ defaultValues, onSubmit, onCancel, loading }: any) {
  const [form, setForm] = useState({
    name: defaultValues?.name ?? '',
    email: defaultValues?.email ?? '',
    phone: defaultValues?.phone ?? '',
    birthDate: defaultValues?.birthDate ? defaultValues.birthDate.split('T')[0] : '',
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Nombre *</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className="label">Teléfono</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="label">Fecha de nacimiento</label>
        <input className="input" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
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

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', showInactive ? undefined : true],
    queryFn: () => studentsApi.getAll(showInactive ? undefined : true),
  });

  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => studentsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); },
  });

  const deactivateMutation = useMutation({
    mutationFn: studentsApi.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });

  const filtered = students.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Alumnos"
          description={`${students.length} alumnos ${showInactive ? 'en total' : 'activos'}`}
          action={
            <button className="btn-primary" onClick={() => setModal('create')}>
              <Plus className="w-4 h-4" /> Nuevo alumno
            </button>
          }
        />

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-primary-600"
              />
              Mostrar inactivos
            </label>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No hay alumnos"
              description="Agregá el primer alumno para comenzar"
              action={
                <button className="btn-primary" onClick={() => setModal('create')}>
                  <Plus className="w-4 h-4" /> Nuevo alumno
                </button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((student: any) => (
                <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/students/${student.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                      {student.name}
                    </Link>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {student.email && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {student.email}
                        </span>
                      )}
                      {student.phone && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {student.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={student.active ? 'badge-paid' : 'badge-overdue'}>
                      {student.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      onClick={() => { setSelected(student); setModal('edit'); }}
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {student.active && (
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => deactivateMutation.mutate(student.id)}
                        title="Desactivar"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Nuevo alumno">
        <StudentForm
          onSubmit={(data: any) => createMutation.mutate(data)}
          onCancel={() => setModal(null)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Editar alumno">
        <StudentForm
          defaultValues={selected}
          onSubmit={(data: any) => updateMutation.mutate({ id: selected.id, data })}
          onCancel={() => setModal(null)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </AppLayout>
  );
}
