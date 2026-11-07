import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Application, Quota, Assignment, Grade, AcademicPeriod } from '../types';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Users,
  Calendar,
  GraduationCap,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  UserMinus,
  AlertCircle,
  Layers,
  X,
  Search,
  Filter,
  Archive,
  ArchiveRestore,
} from 'lucide-react';

interface QuotasViewProps {
  institutionId: string;
  applications: Application[];
  onBack: () => void;
}

type Section = 'quotas' | 'grades' | 'periods';

type ModalMode =
  | { type: 'quota-create' }
  | { type: 'quota-edit'; quota: Quota }
  | { type: 'assignment-create'; quota: Quota }
  | { type: 'assignment-list'; quota: Quota }
  | { type: 'grade-create' }
  | { type: 'grade-edit'; grade: Grade }
  | { type: 'period-create' }
  | { type: 'period-edit'; period: AcademicPeriod }
  | null;

export function QuotasView({ institutionId, applications, onBack }: QuotasViewProps) {
  const [section, setSection] = useState<Section>('quotas');
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [search, setSearch] = useState('');
  const [filterGradeId, setFilterGradeId] = useState('all');
  const [filterPeriodId, setFilterPeriodId] = useState('all');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [quotaRes, gradeRes, periodRes] = await Promise.all([
      supabase
        .from('quotas_with_available')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false }),
      supabase
        .from('grades')
        .select('*')
        .eq('institution_id', institutionId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('academic_periods')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false }),
    ]);
    if (quotaRes.data) setQuotas(quotaRes.data as Quota[]);
    else showToast('error', 'No se pudieron cargar los cupos.');
    if (gradeRes.data) setGrades(gradeRes.data as Grade[]);
    if (periodRes.data) setPeriods(periodRes.data as AcademicPeriod[]);
    setLoading(false);
  }, [institutionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Quota handlers ----------

  const handleCreateQuota = async (values: {
    grade_id: string;
    period_id: string;
    total: number;
    notes?: string;
  }) => {
    const grade = grades.find((g) => g.id === values.grade_id);
    const period = periods.find((p) => p.id === values.period_id);
    if (!grade || !period) {
      showToast('error', 'Selecciona un grado y un periodo.');
      return;
    }
    setActionLoading(true);
    const { error } = await supabase.from('quotas').insert({
      institution_id: institutionId,
      grade_id: values.grade_id,
      period_id: values.period_id,
      grade_or_group: grade.name,
      academic_period: period.name,
      total: values.total,
      notes: values.notes || null,
    });
    setActionLoading(false);
    if (error) {
      if (error.code === '23505') {
        showToast('error', 'Ya existe un cupo para ese grado y periodo.');
      } else {
        showToast('error', 'No se pudo crear el cupo.');
      }
      return;
    }
    showToast('success', 'Cupo creado correctamente.');
    setModal(null);
    fetchData();
  };

  const handleEditQuota = async (quota: Quota, values: { total: number; notes?: string }) => {
    setActionLoading(true);
    if (values.total !== quota.total) {
      const { error: totalErr } = await supabase.rpc('set_quota_total', {
        p_quota_id: quota.id,
        p_total: values.total,
      });
      if (totalErr) {
        setActionLoading(false);
        showToast('error', totalErr.message || 'No se pudo actualizar el total.');
        return;
      }
    }
    const { error: notesErr } = await supabase
      .from('quotas')
      .update({ notes: values.notes || null })
      .eq('id', quota.id);
    setActionLoading(false);
    if (notesErr) {
      showToast('error', 'No se pudieron guardar las notas.');
      return;
    }
    showToast('success', 'Cupo actualizado.');
    setModal(null);
    fetchData();
  };

  const handleDeleteQuota = async (quota: Quota) => {
    if (quota.assigned > 0) {
      showToast('error', `No se puede eliminar: tiene ${quota.assigned} asignacion(es) activa(s).`);
      return;
    }
    setActionLoading(true);
    const { error } = await supabase.from('quotas').delete().eq('id', quota.id);
    setActionLoading(false);
    if (error) {
      showToast('error', 'No se pudo eliminar el cupo.');
      return;
    }
    showToast('success', 'Cupo eliminado.');
    setModal(null);
    fetchData();
  };

  const handleCreateAssignment = async (
    quota: Quota,
    values: { application_id: string | null; student_name: string; student_email?: string }
  ) => {
    setActionLoading(true);
    const { error } = await supabase.rpc('create_assignment', {
      p_quota_id: quota.id,
      p_application_id: values.application_id,
      p_student_name: values.student_name,
      p_student_email: values.student_email || null,
    });
    setActionLoading(false);
    if (error) {
      const msg = error.message || '';
      if (msg.includes('cupos disponibles')) {
        showToast('error', 'No hay cupos disponibles para asignar.');
      } else if (msg.includes('asignacion activa')) {
        showToast('error', 'Ese postulante ya tiene una asignacion activa en este cupo.');
      } else {
        showToast('error', 'No se pudo crear la asignacion.');
      }
      return;
    }
    showToast('success', 'Asignacion creada. Cupo descontado automaticamente.');
    setModal(null);
    fetchData();
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    setActionLoading(true);
    const { error } = await supabase.rpc('cancel_assignment', { p_assignment_id: assignmentId });
    setActionLoading(false);
    if (error) {
      showToast('error', 'No se pudo cancelar la asignacion.');
      return;
    }
    showToast('success', 'Asignacion cancelada. Cupo liberado.');
    fetchData();
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setActionLoading(true);
    const { error } = await supabase.rpc('delete_assignment', { p_assignment_id: assignmentId });
    setActionLoading(false);
    if (error) {
      showToast('error', 'No se pudo eliminar la asignacion.');
      return;
    }
    showToast('success', 'Asignacion eliminada. Cupo liberado.');
    fetchData();
  };

  // ---------- Grade handlers ----------

  const handleSaveGrade = async (values: { name: string; level?: string; sort_order?: number }) => {
    setActionLoading(true);
    const { error } = await supabase.from('grades').insert({
      institution_id: institutionId,
      name: values.name.trim(),
      level: values.level?.trim() || null,
      sort_order: values.sort_order ?? 0,
    });
    setActionLoading(false);
    if (error) {
      showToast('error', error.code === '23505' ? 'Ya existe un grado con ese nombre.' : 'No se pudo crear el grado.');
      return;
    }
    showToast('success', 'Grado creado.');
    setModal(null);
    fetchData();
  };

  const handleUpdateGrade = async (
    grade: Grade,
    values: { name: string; level?: string; sort_order?: number; is_active?: boolean }
  ) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('grades')
      .update({
        name: values.name.trim(),
        level: values.level?.trim() || null,
        sort_order: values.sort_order ?? 0,
        is_active: values.is_active ?? grade.is_active,
      })
      .eq('id', grade.id);
    setActionLoading(false);
    if (error) {
      showToast('error', error.code === '23505' ? 'Ya existe un grado con ese nombre.' : 'No se pudo actualizar.');
      return;
    }
    showToast('success', 'Grado actualizado.');
    setModal(null);
    fetchData();
  };

  // ---------- Period handlers ----------

  const handleSavePeriod = async (values: { name: string; start_date?: string; end_date?: string }) => {
    setActionLoading(true);
    const { error } = await supabase.from('academic_periods').insert({
      institution_id: institutionId,
      name: values.name.trim(),
      start_date: values.start_date || null,
      end_date: values.end_date || null,
    });
    setActionLoading(false);
    if (error) {
      showToast('error', error.code === '23505' ? 'Ya existe un periodo con ese nombre.' : 'No se pudo crear el periodo.');
      return;
    }
    showToast('success', 'Periodo creado.');
    setModal(null);
    fetchData();
  };

  const handleUpdatePeriod = async (
    period: AcademicPeriod,
    values: { name: string; start_date?: string; end_date?: string; is_active?: boolean }
  ) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('academic_periods')
      .update({
        name: values.name.trim(),
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        is_active: values.is_active ?? period.is_active,
      })
      .eq('id', period.id);
    setActionLoading(false);
    if (error) {
      showToast('error', error.code === '23505' ? 'Ya existe un periodo con ese nombre.' : 'No se pudo actualizar.');
      return;
    }
    showToast('success', 'Periodo actualizado.');
    setModal(null);
    fetchData();
  };

  // ---------- Filtering ----------

  const filteredQuotas = quotas.filter((q) => {
    if (filterGradeId !== 'all' && q.grade_id !== filterGradeId) return false;
    if (filterPeriodId !== 'all' && q.period_id !== filterPeriodId) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (q.grade_name || q.grade_or_group || '').toLowerCase().includes(s) ||
      (q.period_name || q.academic_period || '').toLowerCase().includes(s)
    );
  });

  const totals = filteredQuotas.reduce(
    (acc, q) => ({
      total: acc.total + q.total,
      assigned: acc.assigned + q.assigned,
      available: acc.available + q.available,
    }),
    { total: 0, assigned: 0, available: 0 }
  );

  const activeGrades = grades.filter((g) => g.is_active);
  const activePeriods = periods.filter((p) => p.is_active);

  // ---------- Render ----------

  return (
    <div className="min-h-screen bg-brand-50/40">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <span className="font-semibold text-slate-900">Cupos y Asignaciones</span>
          <button
            onClick={fetchData}
            className="text-slate-500 hover:text-slate-900 transition-colors p-2 -mr-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'quotas' as Section, label: 'Cupos', icon: Layers },
            { id: 'grades' as Section, label: 'Grados', icon: GraduationCap, badge: grades.length },
            { id: 'periods' as Section, label: 'Periodos', icon: Calendar, badge: periods.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                section === tab.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    section === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {section === 'quotas' && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard icon={Layers} value={totals.total} label="Cupos Totales" color="blue" />
              <StatCard icon={UserMinus} value={totals.assigned} label="Asignados" color="amber" />
              <StatCard icon={CheckCircle} value={totals.available} label="Disponibles" color="green" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por grado o periodo..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => setModal({ type: 'quota-create' })}
                  disabled={activeGrades.length === 0 || activePeriods.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Cupo
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <FilterSelect
                  icon={GraduationCap}
                  label="Grado"
                  value={filterGradeId}
                  onChange={setFilterGradeId}
                  options={[
                    { value: 'all', label: 'Todos los grados' },
                    ...grades.map((g) => ({ value: g.id, label: g.name })),
                  ]}
                />
                <FilterSelect
                  icon={Calendar}
                  label="Periodo"
                  value={filterPeriodId}
                  onChange={setFilterPeriodId}
                  options={[
                    { value: 'all', label: 'Todos los periodos' },
                    ...periods.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
                {(filterGradeId !== 'all' || filterPeriodId !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterGradeId('all');
                      setFilterPeriodId('all');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {activeGrades.length === 0 || activePeriods.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {activeGrades.length === 0 && activePeriods.length === 0
                        ? 'Crea grados y periodos primero'
                        : activeGrades.length === 0
                          ? 'Crea al menos un grado primero'
                          : 'Crea al menos un periodo primero'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Ve a las pestanas Grados y Periodos para registrarlos, luego podras crear cupos.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Quotas list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              </div>
            ) : filteredQuotas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Layers className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium text-lg">
                  {search || filterGradeId !== 'all' || filterPeriodId !== 'all'
                    ? 'No se encontraron cupos'
                    : 'No hay cupos creados'}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {search || filterGradeId !== 'all' || filterPeriodId !== 'all'
                    ? 'Prueba con otros filtros o terminos de busqueda.'
                    : 'Crea tu primer cupo seleccionando un grado y un periodo.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuotas.map((quota) => {
                  const pct = quota.total > 0 ? (quota.assigned / quota.total) * 100 : 0;
                  const isFull = quota.available <= 0;
                  return (
                    <div
                      key={quota.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {quota.grade_name || quota.grade_or_group}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 rounded-lg text-xs font-medium text-brand-700">
                              <Calendar className="w-3 h-3" />
                              {quota.period_name || quota.academic_period}
                            </span>
                            {quota.grade_level && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                <GraduationCap className="w-3 h-3" />
                                {quota.grade_level}
                              </span>
                            )}
                            {isFull && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-lg text-xs font-medium text-red-700">
                                <AlertCircle className="w-3 h-3" />
                                Sin disponibilidad
                              </span>
                            )}
                          </div>
                          {quota.notes && (
                            <p className="text-sm text-slate-500 mt-1.5">{quota.notes}</p>
                          )}

                          {/* Availability bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium text-slate-500">
                                {quota.assigned} asignados de {quota.total}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isFull ? 'text-red-600' : 'text-emerald-600'
                                }`}
                              >
                                {quota.available} disponibles
                              </span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isFull ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setModal({ type: 'assignment-list', quota })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            Ver ({quota.assigned})
                          </button>
                          <button
                            onClick={() => setModal({ type: 'assignment-create', quota })}
                            disabled={isFull}
                            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            Asignar
                          </button>
                          <button
                            onClick={() => setModal({ type: 'quota-edit', quota })}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Editar cupo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuota(quota)}
                            disabled={quota.assigned > 0}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Eliminar cupo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {section === 'grades' && (
          <GradesSection
            grades={grades}
            loading={loading}
            onCreate={() => setModal({ type: 'grade-create' })}
            onEdit={(g) => setModal({ type: 'grade-edit', grade: g })}
          />
        )}

        {section === 'periods' && (
          <PeriodsSection
            periods={periods}
            loading={loading}
            onCreate={() => setModal({ type: 'period-create' })}
            onEdit={(p) => setModal({ type: 'period-edit', period: p })}
          />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Loading overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-[70] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
            <div className="w-5 h-5 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-700">Procesando...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'quota-create' && (
        <QuotaFormModal
          grades={activeGrades}
          periods={activePeriods}
          onClose={() => setModal(null)}
          onSubmit={handleCreateQuota}
        />
      )}
      {modal?.type === 'quota-edit' && (
        <QuotaFormModal
          quota={modal.quota}
          grades={activeGrades}
          periods={activePeriods}
          onClose={() => setModal(null)}
          onSubmit={(v) => handleEditQuota(modal.quota, v)}
        />
      )}
      {modal?.type === 'assignment-create' && (
        <AssignmentFormModal
          quota={modal.quota}
          applications={applications}
          onClose={() => setModal(null)}
          onSubmit={(v) => handleCreateAssignment(modal.quota, v)}
        />
      )}
      {modal?.type === 'assignment-list' && (
        <AssignmentListModal
          quota={modal.quota}
          onClose={() => setModal(null)}
          onCancelAssignment={handleCancelAssignment}
          onDeleteAssignment={handleDeleteAssignment}
        />
      )}
      {modal?.type === 'grade-create' && (
        <GradeFormModal onClose={() => setModal(null)} onSubmit={handleSaveGrade} />
      )}
      {modal?.type === 'grade-edit' && (
        <GradeFormModal
          grade={modal.grade}
          onClose={() => setModal(null)}
          onSubmit={(v) => handleUpdateGrade(modal.grade, v)}
        />
      )}
      {modal?.type === 'period-create' && (
        <PeriodFormModal onClose={() => setModal(null)} onSubmit={handleSavePeriod} />
      )}
      {modal?.type === 'period-edit' && (
        <PeriodFormModal
          period={modal.period}
          onClose={() => setModal(null)}
          onSubmit={(v) => handleUpdatePeriod(modal.period, v)}
        />
      )}
    </div>
  );
}

// =========================================================
// Grades section
// =========================================================

function GradesSection({
  grades,
  loading,
  onCreate,
  onEdit,
}: {
  grades: Grade[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (g: Grade) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Grados y Niveles</h2>
          <p className="text-sm text-slate-500 mt-0.5">Registra los grados, grupos o niveles academicos</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Grado
        </button>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium text-lg">No hay grados registrados</p>
          <p className="text-sm text-slate-400 mt-2">Crea grados para asociarlos a los cupos.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => onEdit(g)}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{g.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {g.level || 'Sin nivel'} - Orden #{g.sort_order}
                </p>
              </div>
              {!g.is_active && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                  <Archive className="w-3 h-3" /> Archivado
                </span>
              )}
              <Pencil className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================
// Periods section
// =========================================================

function PeriodsSection({
  periods,
  loading,
  onCreate,
  onEdit,
}: {
  periods: AcademicPeriod[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (p: AcademicPeriod) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Periodos Academicos</h2>
          <p className="text-sm text-slate-500 mt-0.5">Registra los anos o periodos academicos</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Periodo
        </button>
      </div>

      {periods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium text-lg">No hay periodos registrados</p>
          <p className="text-sm text-slate-400 mt-2">Crea periodos para asociarlos a los cupos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => onEdit(p)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {p.start_date && p.end_date
                    ? `${formatDate(p.start_date)} - ${formatDate(p.end_date)}`
                    : p.start_date
                      ? `Inicio: ${formatDate(p.start_date)}`
                      : p.end_date
                        ? `Fin: ${formatDate(p.end_date)}`
                        : 'Sin fechas definidas'}
                </p>
              </div>
              {!p.is_active && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                  <Archive className="w-3 h-3" /> Archivado
                </span>
              )}
              <Pencil className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
}

// =========================================================
// Stat card
// =========================================================

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Users;
  value: number;
  label: string;
  color: 'blue' | 'amber' | 'green';
}) {
  const colors = {
    blue: 'bg-brand-100 text-brand-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-emerald-100 text-emerald-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

// =========================================================
// Filter select
// =========================================================

function FilterSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof Filter;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative flex-1 min-w-[160px]">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 appearance-none cursor-pointer transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// =========================================================
// Quota create/edit modal
// =========================================================

function QuotaFormModal({
  quota,
  grades,
  periods,
  onClose,
  onSubmit,
}: {
  quota?: Quota;
  grades: Grade[];
  periods: AcademicPeriod[];
  onClose: () => void;
  onSubmit: (v: { grade_id: string; period_id: string; total: number; notes?: string }) => void;
}) {
  const [gradeId, setGradeId] = useState(quota?.grade_id || '');
  const [periodId, setPeriodId] = useState(quota?.period_id || '');
  const [total, setTotal] = useState(quota?.total?.toString() || '0');
  const [notes, setNotes] = useState(quota?.notes || '');
  const isEdit = !!quota;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseInt(total, 10);
    if (!gradeId || !periodId || isNaN(totalNum) || totalNum < 0) return;
    onSubmit({ grade_id: gradeId, period_id: periodId, total: totalNum, notes: notes.trim() || undefined });
  };

  return (
    <ModalShell onClose={onClose} title={isEdit ? 'Editar Cupo' : 'Nuevo Cupo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Grado o Grupo">
          <select
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            disabled={isEdit}
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <option value="">-- Seleccionar --</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}{g.level ? ` (${g.level})` : ''}
              </option>
            ))}
          </select>
          {isEdit && <p className="text-xs text-slate-400 mt-1">El grado no se puede cambiar.</p>}
        </Field>
        <Field label="Periodo Academico">
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            disabled={isEdit}
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <option value="">-- Seleccionar --</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {isEdit && <p className="text-xs text-slate-400 mt-1">El periodo no se puede cambiar.</p>}
        </Field>
        <Field label={`Total de Cupos${isEdit && quota ? ` (min. ${quota.assigned})` : ''}`}>
          <input
            type="number"
            min={isEdit ? quota?.assigned ?? 0 : 0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
          />
        </Field>
        <Field label="Notas (opcional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Informacion adicional sobre este cupo..."
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all resize-none"
          />
        </Field>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {isEdit ? 'Guardar' : 'Crear Cupo'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// =========================================================
// Grade form modal
// =========================================================

function GradeFormModal({
  grade,
  onClose,
  onSubmit,
}: {
  grade?: Grade;
  onClose: () => void;
  onSubmit: (v: { name: string; level?: string; sort_order?: number; is_active?: boolean }) => void;
}) {
  const [name, setName] = useState(grade?.name || '');
  const [level, setLevel] = useState(grade?.level || '');
  const [sortOrder, setSortOrder] = useState(grade?.sort_order?.toString() || '0');
  const [isActive, setIsActive] = useState(grade?.is_active ?? true);
  const isEdit = !!grade;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      level: level.trim() || undefined,
      sort_order: parseInt(sortOrder, 10) || 0,
      ...(isEdit ? { is_active: isActive } : {}),
    });
  };

  return (
    <ModalShell onClose={onClose} title={isEdit ? 'Editar Grado' : 'Nuevo Grado'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre del grado o grupo">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. 1ro Bachillerato, Grupo A"
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
          />
        </Field>
        <Field label="Nivel (opcional)">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
          >
            <option value="">-- Sin nivel --</option>
            <option value="Inicial">Inicial</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Universitario">Universitario</option>
            <option value="Tecnico">Tecnico</option>
          </select>
        </Field>
        <Field label="Orden de visualizacion">
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
          />
        </Field>
        {isEdit && (
          <label className="flex items-center gap-3 p-3 bg-brand-50/40 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              {isActive ? <Archive className="w-4 h-4 text-amber-500" /> : <ArchiveRestore className="w-4 h-4 text-emerald-500" />}
              {isActive ? 'Archivar grado' : 'Reactivar grado'}
            </span>
          </label>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// =========================================================
// Period form modal
// =========================================================

function PeriodFormModal({
  period,
  onClose,
  onSubmit,
}: {
  period?: AcademicPeriod;
  onClose: () => void;
  onSubmit: (v: { name: string; start_date?: string; end_date?: string; is_active?: boolean }) => void;
}) {
  const [name, setName] = useState(period?.name || '');
  const [startDate, setStartDate] = useState(period?.start_date || '');
  const [endDate, setEndDate] = useState(period?.end_date || '');
  const [isActive, setIsActive] = useState(period?.is_active ?? true);
  const isEdit = !!period;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      ...(isEdit ? { is_active: isActive } : {}),
    });
  };

  return (
    <ModalShell onClose={onClose} title={isEdit ? 'Editar Periodo' : 'Nuevo Periodo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre del periodo">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. 2026-2027, Semestre 1 2026"
            className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de inicio (opcional)">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
            />
          </Field>
          <Field label="Fecha de fin (opcional)">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
            />
          </Field>
        </div>
        {isEdit && (
          <label className="flex items-center gap-3 p-3 bg-brand-50/40 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              {isActive ? <Archive className="w-4 h-4 text-amber-500" /> : <ArchiveRestore className="w-4 h-4 text-emerald-500" />}
              {isActive ? 'Archivar periodo' : 'Reactivar periodo'}
            </span>
          </label>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// =========================================================
// Assignment create modal
// =========================================================

function AssignmentFormModal({
  quota,
  applications,
  onClose,
  onSubmit,
}: {
  quota: Quota;
  applications: Application[];
  onClose: () => void;
  onSubmit: (v: { application_id: string | null; student_name: string; student_email?: string }) => void;
}) {
  const [linkApp, setLinkApp] = useState(false);
  const [appId, setAppId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const selectedApp = applications.find((a) => a.id === appId);
  const gradeLabel = quota.grade_name || quota.grade_or_group;
  const periodLabel = quota.period_name || quota.academic_period;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkApp) {
      if (!appId || !selectedApp) return;
      onSubmit({
        application_id: selectedApp.id,
        student_name: `${selectedApp.name} ${selectedApp.last_name || ''}`.trim(),
        student_email: selectedApp.email,
      });
    } else {
      if (!name.trim()) return;
      onSubmit({ application_id: null, student_name: name.trim(), student_email: email.trim() || undefined });
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Asignar a ${gradeLabel}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl">
          <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <p className="text-sm text-brand-700">
            {periodLabel} - {quota.available} de {quota.total} disponibles
          </p>
        </div>

        <label className="flex items-center gap-3 p-3 bg-brand-50/40 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={linkApp}
            onChange={(e) => setLinkApp(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">Vincular a una postulacion existente</span>
        </label>

        {linkApp ? (
          <Field label="Selecciona postulacion">
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
            >
              <option value="">-- Elegir --</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.last_name || ''} - {a.email}
                </option>
              ))}
            </select>
            {selectedApp && (
              <div className="mt-2 p-2.5 bg-brand-50/40 rounded-lg text-xs text-slate-600">
                <p><span className="text-slate-400">Nombre: </span>{selectedApp.name} {selectedApp.last_name || ''}</p>
                <p><span className="text-slate-400">Email: </span>{selectedApp.email}</p>
              </div>
            )}
          </Field>
        ) : (
          <>
            <Field label="Nombre del estudiante">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
              />
            </Field>
            <Field label="Email (opcional)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
              />
            </Field>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Asignar
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// =========================================================
// Assignment list modal
// =========================================================

function AssignmentListModal({
  quota,
  onClose,
  onCancelAssignment,
  onDeleteAssignment,
}: {
  quota: Quota;
  onClose: () => void;
  onCancelAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*, applications(name, last_name, email)')
        .eq('quota_id', quota.id)
        .order('created_at', { ascending: false });
      if (!error && data) setAssignments(data as Assignment[]);
      setLoading(false);
    };
    load();
  }, [quota.id]);

  const gradeLabel = quota.grade_name || quota.grade_or_group;
  const periodLabel = quota.period_name || quota.academic_period;

  return (
    <ModalShell onClose={onClose} title={`Asignaciones - ${gradeLabel}`} wide>
      <div className="flex items-center gap-2 mb-4 p-3 bg-brand-50/40 rounded-xl">
        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-sm text-slate-600">
          {periodLabel} - {quota.assigned} asignados / {quota.total} total
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-10">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay asignaciones en este cupo.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto -mx-1 px-1">
          {assignments.map((a) => {
            const isActive = a.status === 'activa';
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isActive ? 'bg-white border-slate-200' : 'bg-brand-50/40 border-slate-100 opacity-70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{a.student_name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {a.student_email || a.applications?.email || 'Sin correo'}
                  </p>
                  {a.applications && <p className="text-[10px] text-brand-600 mt-0.5">Postulacion vinculada</p>}
                </div>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-500 flex-shrink-0">
                    <XCircle className="w-3 h-3" /> Cancelada
                  </span>
                )}
                {isActive && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onCancelAssignment(a.id)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors"
                      title="Cancelar asignacion (libera el cupo)"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAssignment(a.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                      title="Eliminar asignacion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}

// =========================================================
// Shared UI helpers
// =========================================================

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ModalShell({
  children,
  onClose,
  title,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${
          wide ? 'max-w-lg' : 'max-w-md'
        } max-h-[90vh] overflow-hidden flex flex-col animate-scale-in`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
