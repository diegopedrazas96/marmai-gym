'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Modal } from '@/components/ui/modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, enrollmentsApi, disciplinesApi, paymentsApi } from '@/lib/api';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CreditCard, Dumbbell, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, MONTH_NAMES } from '@/lib/utils';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const studentId = parseInt(id);
  const qc = useQueryClient();
  const [enrollModal, setEnrollModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [payForm, setPayForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
    notes: '',
  });

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentsApi.getOne(studentId),
  });

  const { data: disciplines = [] } = useQuery({
    queryKey: ['disciplines'],
    queryFn: disciplinesApi.getAll,
  });

  const enrollMutation = useMutation({
    mutationFn: (disciplineId: number) => enrollmentsApi.create({ studentId, disciplineId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', studentId] }); setEnrollModal(false); },
  });

  const unenrollMutation = useMutation({
    mutationFn: (disciplineId: number) => enrollmentsApi.unenroll(studentId, disciplineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', studentId] }),
  });

  const payMutation = useMutation({
    mutationFn: (data: any) => paymentsApi.create({ ...data, studentId, amount: Number(data.amount), status: 'PAID' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', studentId] }); setPayModal(false); },
  });

  const markPaidMutation = useMutation({
    mutationFn: (paymentId: number) => paymentsApi.markAsPaid(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', studentId] }),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!student) return null;

  const enrolledIds = student.enrollments?.map((e: any) => e.disciplineId) ?? [];
  const availableDisciplines = disciplines.filter((d: any) => !enrolledIds.includes(d.id));

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a alumnos
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-700">{student.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
            <div className="flex flex-wrap gap-4 mt-1">
              {student.email && <span className="text-sm text-gray-500">{student.email}</span>}
              {student.phone && <span className="text-sm text-gray-500">{student.phone}</span>}
            </div>
            <span className={`mt-2 inline-block ${student.active ? 'badge-paid' : 'badge-overdue'}`}>
              {student.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollments */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary-500" /> Disciplinas
              </h2>
              {availableDisciplines.length > 0 && (
                <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setEnrollModal(true)}>
                  <Plus className="w-3.5 h-3.5" /> Inscribir
                </button>
              )}
            </div>
            {student.enrollments?.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Sin disciplinas activas</p>
            ) : (
              <div className="space-y-2">
                {student.enrollments?.map((enr: any) => (
                  <div key={enr.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: enr.discipline.color || '#6366f1' }} />
                    <span className="flex-1 text-sm font-medium text-gray-800">{enr.discipline.name}</span>
                    <button
                      className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors"
                      onClick={() => unenrollMutation.mutate(enr.disciplineId)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary-500" /> Pagos
              </h2>
              <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setPayModal(true)}>
                <Plus className="w-3.5 h-3.5" /> Registrar pago
              </button>
            </div>
            {student.payments?.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Sin pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {student.payments?.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {MONTH_NAMES[p.month - 1]} {p.year}
                      </p>
                      <p className="text-xs text-gray-500">{formatCurrency(Number(p.amount))}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={p.status === 'PAID' ? 'badge-paid' : p.status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending'}>
                        {p.status === 'PAID' ? 'Pagado' : p.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'}
                      </span>
                      {p.status !== 'PAID' && (
                        <button
                          className="p-1 rounded text-gray-300 hover:text-green-600 transition-colors"
                          onClick={() => markPaidMutation.mutate(p.id)}
                          title="Marcar como pagado"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll modal */}
      <Modal isOpen={enrollModal} onClose={() => setEnrollModal(false)} title="Inscribir en disciplina" size="sm">
        <div className="space-y-4">
          <select
            className="input"
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
          >
            <option value="">Seleccionar disciplina...</option>
            {availableDisciplines.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1 justify-center" onClick={() => setEnrollModal(false)}>Cancelar</button>
            <button
              className="btn-primary flex-1 justify-center"
              disabled={!selectedDiscipline || enrollMutation.isPending}
              onClick={() => enrollMutation.mutate(parseInt(selectedDiscipline))}
            >
              Inscribir
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment modal */}
      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Registrar pago" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); payMutation.mutate(payForm); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mes</label>
              <select className="input" value={payForm.month} onChange={(e) => setPayForm({ ...payForm, month: parseInt(e.target.value) })}>
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Año</label>
              <input className="input" type="number" value={payForm.year} onChange={(e) => setPayForm({ ...payForm, year: parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Monto *</label>
            <input className="input" type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Notas</label>
            <input className="input" value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setPayModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={payMutation.isPending}>
              {payMutation.isPending ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
