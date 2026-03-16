'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { StatCard } from '@/components/ui/stat-card';
import { useQuery } from '@tanstack/react-query';
import { studentsApi, schedulesApi, paymentsApi } from '@/lib/api';
import { Users, Calendar, CreditCard, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency, DAY_NAMES, MONTH_NAMES } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: students = [] } = useQuery({
    queryKey: ['students', 'active'],
    queryFn: () => studentsApi.getAll(true),
  });

  const { data: todaySchedules = [] } = useQuery({
    queryKey: ['schedules', 'today'],
    queryFn: () => schedulesApi.getToday(),
  });

  const { data: summary } = useQuery({
    queryKey: ['payments', 'summary', month, year],
    queryFn: () => paymentsApi.getSummary(month, year),
  });

  const { data: pendingPayments = [] } = useQuery({
    queryKey: ['payments', 'pending', month, year],
    queryFn: () => paymentsApi.getAll({ month, year, status: 'PENDING' }),
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            Bienvenido, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-gray-500">
            {MONTH_NAMES[month - 1]} {year} · Resumen del gym
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Alumnos activos"
            value={students.length}
            icon={Users}
            color="indigo"
          />
          <StatCard
            label="Clases hoy"
            value={todaySchedules.length}
            icon={Calendar}
            color="green"
          />
          <StatCard
            label="Pagos cobrados"
            value={formatCurrency(summary?.collectedAmount ?? 0)}
            icon={CreditCard}
            color="green"
            trend={`${summary?.paid ?? 0} de ${summary?.total ?? 0} pagos`}
          />
          <StatCard
            label="Pagos pendientes"
            value={summary?.pending ?? 0}
            icon={AlertCircle}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's schedule */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              Clases de hoy
            </h2>
            {todaySchedules.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hay clases programadas para hoy</p>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.discipline.color || '#6366f1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{s.discipline.name}</p>
                      <p className="text-xs text-gray-500">{s.teacher.name}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                      {s.startTime} – {s.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending payments */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Pagos pendientes — {MONTH_NAMES[month - 1]}
            </h2>
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">¡Todos los pagos están al día!</p>
            ) : (
              <div className="space-y-2">
                {pendingPayments.slice(0, 8).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{p.student.name}</span>
                    <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
                      {formatCurrency(Number(p.amount))}
                    </span>
                  </div>
                ))}
                {pendingPayments.length > 8 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    +{pendingPayments.length - 8} más
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
