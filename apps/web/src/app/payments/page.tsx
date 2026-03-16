'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { StatCard } from '@/components/ui/stat-card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, studentsApi } from '@/lib/api';
import { useState } from 'react';
import {
  Plus, CreditCard, CheckCircle, AlertCircle, XCircle, Search, Zap,
} from 'lucide-react';
import { formatCurrency, MONTH_NAMES } from '@/lib/utils';
import { PaymentStatus } from '@marmai/shared';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = { PAID: 'Pagado', PENDING: 'Pendiente', OVERDUE: 'Vencido' };
const STATUS_CLASS: Record<string, string> = { PAID: 'badge-paid', PENDING: 'badge-pending', OVERDUE: 'badge-overdue' };

export default function PaymentsPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [generateModal, setGenerateModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [genAmount, setGenAmount] = useState('');
  const [createForm, setCreateForm] = useState({
    studentId: '', month: now.getMonth() + 1, year: now.getFullYear(), amount: '', notes: '',
  });

  const filters = {
    month,
    year,
    status: statusFilter as PaymentStatus | undefined || undefined,
  };

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentsApi.getAll(filters),
  });

  const { data: summary } = useQuery({
    queryKey: ['payments', 'summary', month, year],
    queryFn: () => paymentsApi.getSummary(month, year),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students', true],
    queryFn: () => studentsApi.getAll(true),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.markAsPaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => paymentsApi.generate(month, year, Number(genAmount)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      setGenerateModal(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => paymentsApi.create({ ...data, studentId: parseInt(data.studentId), amount: Number(data.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      setCreateModal(false);
    },
  });

  const filtered = payments.filter((p: any) =>
    p.student?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Pagos"
          description={`${MONTH_NAMES[month - 1]} ${year}`}
          action={
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => setGenerateModal(true)}>
                <Zap className="w-4 h-4" /> Generar pagos
              </button>
              <button className="btn-primary" onClick={() => setCreateModal(true)}>
                <Plus className="w-4 h-4" /> Registrar pago
              </button>
            </div>
          }
        />

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total cobrado" value={formatCurrency(summary.collectedAmount)} icon={CreditCard} color="green" />
            <StatCard label="Pagos al día" value={summary.paid} icon={CheckCircle} color="green" />
            <StatCard label="Pendientes" value={summary.pending} icon={AlertCircle} color="yellow" />
            <StatCard label="Vencidos" value={summary.overdue} icon={XCircle} color="red" />
          </div>
        )}

        <div className="card overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-9" placeholder="Buscar alumno..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input sm:w-36" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select className="input sm:w-24" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="input sm:w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="PAID">Pagado</option>
              <option value="PENDING">Pendiente</option>
              <option value="OVERDUE">Vencido</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              No hay pagos registrados para los filtros seleccionados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Alumno</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Período</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Monto</th>
                    <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Estado</th>
                    <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/students/${p.studentId}`} className="font-medium text-gray-900 hover:text-primary-600">
                          {p.student?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {MONTH_NAMES[p.month - 1]} {p.year}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(Number(p.amount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={STATUS_CLASS[p.status]}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.status !== 'PAID' && (
                          <button
                            className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => markPaidMutation.mutate(p.id)}
                            disabled={markPaidMutation.isPending}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Marcar pagado
                          </button>
                        )}
                        {p.status === 'PAID' && p.paidAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(p.paidAt).toLocaleDateString('es-AR')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      <Modal isOpen={generateModal} onClose={() => setGenerateModal(false)} title="Generar pagos del mes" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Esto creará pagos pendientes para todos los alumnos activos en{' '}
            <strong>{MONTH_NAMES[month - 1]} {year}</strong> que no tengan pago registrado.
          </p>
          <div>
            <label className="label">Monto por defecto *</label>
            <input
              className="input"
              type="number"
              step="0.01"
              placeholder="5000"
              value={genAmount}
              onChange={(e) => setGenAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1 justify-center" onClick={() => setGenerateModal(false)}>Cancelar</button>
            <button
              className="btn-primary flex-1 justify-center"
              disabled={!genAmount || generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Payment Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Registrar pago" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(createForm); }} className="space-y-4">
          <div>
            <label className="label">Alumno *</label>
            <select className="input" value={createForm.studentId} onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mes</label>
              <select className="input" value={createForm.month} onChange={(e) => setCreateForm({ ...createForm, month: parseInt(e.target.value) })}>
                {MONTH_NAMES.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Año</label>
              <input className="input" type="number" value={createForm.year} onChange={(e) => setCreateForm({ ...createForm, year: parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Monto *</label>
            <input className="input" type="number" step="0.01" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Notas</label>
            <input className="input" value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setCreateModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
