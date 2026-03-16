'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { useQuery } from '@tanstack/react-query';
import { schedulesApi } from '@/lib/api';
import { Calendar } from 'lucide-react';
import { DAY_NAMES, DAY_ORDER } from '@/lib/utils';

export default function SchedulesPage() {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesApi.getAll(),
  });

  const byDay = DAY_ORDER.reduce<Record<string, any[]>>((acc, day) => {
    acc[day] = schedules.filter((s: any) => s.dayOfWeek === day).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const activeDays = DAY_ORDER.filter((day) => byDay[day].length > 0);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <PageHeader
          title="Horarios"
          description="Vista general de todos los horarios configurados"
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeDays.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Sin horarios configurados</h3>
            <p className="text-sm text-gray-500 mt-1">Configurá horarios desde la sección de Disciplinas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeDays.map((day) => (
              <div key={day} className="card p-5">
                <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  {DAY_NAMES[day]}
                  <span className="ml-auto text-xs text-gray-400 font-normal">{byDay[day].length} clases</span>
                </h2>
                <div className="space-y-2">
                  {byDay[day].map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.discipline.color || '#6366f1' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{s.discipline.name}</p>
                        <p className="text-xs text-gray-400">{s.teacher.name}</p>
                      </div>
                      <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 flex-shrink-0">
                        {s.startTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
