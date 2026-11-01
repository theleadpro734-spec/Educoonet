import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Application, Quota, Assignment } from '../types';
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
  ChevronRight,
  AlertCircle,
  Layers,
  X,
  Search,
} from 'lucide-react';

interface QuotasViewProps {
  institutionId: string;
  applications: Application[];
  onBack: () => void;
}

type ModalMode =
  | { type: 'quota-create' }
  | { type: 'quota-edit'; quota: Quota }
  | { type: 'assignment-create'; quota: Quota }
  | { type: 'assignment-list'; quota: Quota }
  | null;

export function QuotasView({ institutionId, applications, onBack }: QuotasViewProps) {
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [search, setSearch] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotas_with_available')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });
    if (error) {
      showToast('error', 'No se pudieron cargar los cupos.');
      setQuotas([]);
    } else {
      setQuotas((data as Quota[]) || []);
    }
    setLoading(false);
  }, [institutionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateQuota = async (values: {
    grade_or_group: string;
    academic_period: string;
    total: number;
    notes?: string;
  }) => {
    setActionLoading(true);
    const { error } = await supabase.from('quotas').insert({
      institution_id: institutionId,
      grade_or_group: values.grade_or_group,
      academic_period: values.academic_period,
      total: values.total,
      notes: values.notes || null,
    });
    setActionLoading(false);
    if (error) {
      if (error.code === '23505') {
        showToast('error', 'Ya existe un cupo para ese grado/grupo y periodo.');
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
    // Use the SECURITY DEFINER function for total so server validates >= assigned.
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
    // notes is editable directly (column-restricted UPDATE allows it).
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
    const { data, error } = await supabase.rpc('create_assignment', {
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
    const { error } = await supabase.rpc('cancel_assignment', {
      p_assignment_id: assignmentId,
    });
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
    const { error } = await supabase.rpc('delete_assignment', {
      p_assignment_id: assignmentId,
    });
    setActionLoading(false);
    if (error) {
      showToast('error', 'No se pudo eliminar la asignacion.');
      return;
    }
    showToast('success', 'Asignacion eliminada. Cupo liberado.');
    fetchData();
  };

  const filteredQuotas = quotas.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.grade_or_group.toLowerCase().includes(s) ||
      q.academic_period.toLowerCase().includes(s)
    );
  });

  const totals = quotas.reduce(
    (acc, q) => ({
      total: acc.total + q.total,
      assigned: acc.assigned + q.assigned,
      available: acc.available + q.available,
    }),
    { total: 0, assigned: 0, available: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-50">
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
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={Layers}
            value={totals.total}
            label="Cupos Totales"
            color="blue"
          />
          <StatCard
            icon={UserMinus}
            value={totals.assigned}
            label="Asignados"
            color="amber"
          />
          <StatCard
            icon={CheckCircle}
            value={totals.available}
            label="Disponibles"
            color="green"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por grado, grupo o periodo..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          <button
            onClick={() => setModal({ type: 'quota-create' })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cupo
          </button>
        </div>

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
              {search ? 'No se encontraron cupos' : 'No hay cupos creados'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {search
                ? 'Prueba con otro termino de busqueda.'
                : 'Crea tu primer cupo para empezar a asignar postulantes.'}
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
                          {quota.grade_or_group}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 rounded-lg text-xs font-medium text-brand-700">
                          <Calendar className="w-3 h-3" />
                          {quota.academic_period}
                        </span>
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
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Loading overlay for actions */}
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
          onClose={() => setModal(null)}
          onSubmit={handleCreateQuota}
        />
      )}
      {modal?.type === 'quota-edit' && (
        <QuotaFormModal
          quota={modal.quota}
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
    </div>
  );
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
// Quota create/edit modal
// =========================================================

function QuotaFormModal({
  quota,
  onClose,
  onSubmit,
}: {
  quota?: Quota;
  onClose: () => void;
  onSubmit: (v: {
    grade_or_group: string;
    academic_period: string;
    total: number;
    notes?: string;
  }) => void;
}) {
  const [grade, setGrade] = useState(quota?.grade_or_group || '');
  const [period, setPeriod] = useState(quota?.academic_period || '');
  const [total, setTotal] = useState(quota?.total?.toString() || '0');
  const [notes, setNotes] = useState(quota?.notes || '');
  const isEdit = !!quota;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseInt(total, 10);
    if (!grade.trim() || !period.trim() || isNaN(totalNum) || totalNum < 0) return;
    if (isEdit) {
      onSubmit({ total: totalNum, notes: notes.trim() || undefined });
    } else {
      onSubmit({
        grade_or_group: grade.trim(),
        academic_period: period.trim(),
        total: totalNum,
        notes: notes.trim() || undefined,
      });
    }
  };

  return (
    <ModalShell onClose={onClose} title={isEdit ? 'Editar Cupo' : 'Nuevo Cupo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Grado o Grupo">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={isEdit}
            placeholder="Ej. 1ro Bachillerato, Grupo A"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          />
          {isEdit && (
            <p className="text-xs text-slate-400 mt-1">El grado/grupo no se puede cambiar.</p>
          )}
        </Field>
        <Field label="Periodo Academico">
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={isEdit}
            placeholder="Ej. 2026-2027, Semestre 1"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          />
        </Field>
        <Field label={`Total de Cupos${isEdit && quota ? ` (min. ${quota.assigned})` : ''}`}>
          <input
            type="number"
            min={isEdit ? quota?.assigned ?? 0 : 0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </Field>
        <Field label="Notas (opcional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Informacion adicional sobre este cupo..."
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
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
  onSubmit: (v: {
    application_id: string | null;
    student_name: string;
    student_email?: string;
  }) => void;
}) {
  const [linkApp, setLinkApp] = useState(false);
  const [appId, setAppId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const selectedApp = applications.find((a) => a.id === appId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkApp) {
      if (!appId) return;
      const app = selectedApp;
      if (!app) return;
      onSubmit({
        application_id: app.id,
        student_name: `${app.name} ${app.last_name || ''}`.trim(),
        student_email: app.email,
      });
    } else {
      if (!name.trim()) return;
      onSubmit({
        application_id: null,
        student_name: name.trim(),
        student_email: email.trim() || undefined,
      });
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Asignar a ${quota.grade_or_group}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl">
          <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <p className="text-sm text-brand-700">
            {quota.academic_period} - {quota.available} de {quota.total} disponibles
          </p>
        </div>

        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={linkApp}
            onChange={(e) => setLinkApp(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">
            Vincular a una postulacion existente
          </span>
        </label>

        {linkApp ? (
          <Field label="Selecciona postulacion">
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              <option value="">-- Elegir --</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.last_name || ''} - {a.email}
                </option>
              ))}
            </select>
            {selectedApp && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600">
                <p>
                  <span className="text-slate-400">Nombre: </span>
                  {selectedApp.name} {selectedApp.last_name || ''}
                </p>
                <p>
                  <span className="text-slate-400">Email: </span>
                  {selectedApp.email}
                </p>
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </Field>
            <Field label="Email (opcional)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
      if (!error && data) {
        setAssignments(data as Assignment[]);
      }
      setLoading(false);
    };
    load();
  }, [quota.id]);

  return (
    <ModalShell
      onClose={onClose}
      title={`Asignaciones - ${quota.grade_or_group}`}
      wide
    >
      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl">
        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-sm text-slate-600">
          {quota.academic_period} - {quota.assigned} asignados / {quota.total} total
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
                  isActive
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-100 opacity-70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {a.student_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {a.student_email || a.applications?.email || 'Sin correo'}
                  </p>
                  {a.applications && (
                    <p className="text-[10px] text-brand-600 mt-0.5">Postulacion vinculada</p>
                  )}
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
