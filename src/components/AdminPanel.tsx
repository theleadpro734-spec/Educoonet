import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { EduConnetLogo } from './EduConnetLogo';
import {
  BarChart3,
  Building2,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Search,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Download,
  ToggleLeft,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  AdminAccount,
  AdminActivityLog,
  AdminInstitution,
  AdminStudent,
  AdminApplication,
} from '../types';

interface AdminPanelProps {
  admin: AdminAccount;
  onExit: () => void;
}

type Tab = 'dashboard' | 'institutions' | 'students' | 'applications' | 'reports' | 'activity' | 'settings';

function AppDetailDrawer({ app, onClose }: { app: AdminApplication | null; onClose: () => void }) {
  if (!app) return null;
  const st = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pendiente;
  const StatusIcon = st.icon;
  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative bg-brand-50/40 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        <div className={`relative px-6 pt-5 pb-4 ${st.bg} ${st.color} border-b border-slate-200`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/60 hover:bg-white transition-colors">
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-4 pr-12">
            <div className="w-14 h-14 rounded-2xl bg-white shadow flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-slate-700">{app.name.charAt(0)}{app.last_name?.charAt(0) ?? ''}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">{app.name} {app.last_name ?? ''}</h2>
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/80">
                <StatusIcon className="w-3.5 h-3.5" />
                {st.label}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Datos de Contacto</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">Correo: </span><span className="text-slate-700">{app.email}</span></div>
              <div><span className="text-slate-400">Nivel: </span><span className="text-slate-700">{app.educational_level}</span></div>
              <div><span className="text-slate-400">Institucion: </span><span className="text-slate-700">{app.institutions?.name ?? 'N/A'}</span></div>
              <div><span className="text-slate-400">Fecha: </span><span className="text-slate-700">{new Date(app.created_at).toLocaleDateString('es-EC')}</span></div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-sm text-blue-700">
              La gestion de esta postulacion (aceptar, rechazar, mensaje) la realiza la institucion desde su propio panel.
              Este panel es de supervision y monitoreo del equipo EduConnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  aceptada: { label: 'Aceptada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
};

export function AdminPanel({ admin, onExit }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [activityLog, setActivityLog] = useState<AdminActivityLog[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
  const canManageInstitutions = admin.role === 'super_admin' || admin.role === 'operator';
  const canManageStudents = admin.role === 'super_admin' || admin.role === 'operator';

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [instRes, stuRes, appRes, msgRes, logRes] = await Promise.all([
      supabase
        .from('institutions')
        .select('id, name, email, phone, location, institution_type, is_published, is_suspended, suspended_at, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('student_accounts')
        .select('id, name, last_name, email, cedula, is_suspended, suspended_at, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('id, name, last_name, email, status, educational_level, created_at, institution_id, institutions(name)')
        .order('created_at', { ascending: false }),
      supabase.from('application_messages').select('*', { count: 'exact', head: true }),
      supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (instRes.data) setInstitutions(instRes.data as AdminInstitution[]);
    if (stuRes.data) setStudents(stuRes.data as AdminStudent[]);
    if (appRes.data) setApplications(appRes.data as unknown as AdminApplication[]);
    setTotalMessages(msgRes.count || 0);
    if (logRes.data) setActivityLog(logRes.data as AdminActivityLog[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleInstitutionSuspend = async (id: string, currentSuspended: boolean) => {
    setActionLoading(true);
    const { error } = await supabase.rpc('admin_set_institution_status', {
      p_admin_id: admin.id,
      p_institution_id: id,
      p_suspend: !currentSuspended,
    });
    setActionLoading(false);
    if (error) {
      showToast('error', 'No se pudo actualizar el estado de la institucion.');
      return;
    }
    showToast('success', currentSuspended ? 'Institucion reactivada.' : 'Institucion suspendida.');
    fetchData();
  };

  const toggleStudentSuspend = async (id: string, currentSuspended: boolean) => {
    setActionLoading(true);
    const { error } = await supabase.rpc('admin_set_student_status', {
      p_admin_id: admin.id,
      p_student_id: id,
      p_suspend: !currentSuspended,
    });
    setActionLoading(false);
    if (error) {
      showToast('error', 'No se pudo actualizar el estado del postulante.');
      return;
    }
    showToast('success', currentSuspended ? 'Postulante reactivado.' : 'Postulante suspendido.');
    fetchData();
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'institutions' as Tab, label: 'Instituciones', icon: Building2, badge: institutions.length },
    { id: 'students' as Tab, label: 'Postulantes', icon: Users, badge: students.length },
    { id: 'applications' as Tab, label: 'Monitoreo', icon: FileText, badge: applications.length },
    { id: 'reports' as Tab, label: 'Reportes', icon: TrendingUp },
    { id: 'activity' as Tab, label: 'Actividad', icon: Activity, badge: activityLog.length },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings },
  ];

  const pendingCount = applications.filter((a) => a.status === 'pendiente').length;
  const acceptedCount = applications.filter((a) => a.status === 'aceptada').length;
  const rejectedCount = applications.filter((a) => a.status === 'rechazada').length;
  const acceptanceRate = applications.length > 0 ? Math.round((acceptedCount / applications.length) * 100) : 0;
  const suspendedInstitutions = institutions.filter((i) => i.is_suspended).length;
  const suspendedStudents = students.filter((s) => s.is_suspended).length;

  const filteredInstitutions = institutions.filter(
    (inst) =>
      !searchTerm ||
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(
    (stu) =>
      !searchTerm ||
      `${stu.name} ${stu.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      `${app.name} ${app.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---------- Renderers ----------

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard General</h1>
        <p className="text-sm text-slate-500 mt-1">Vision global de la plataforma EduConnet</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Instituciones', value: institutions.length, icon: Building2, iconBg: 'bg-brand-100', iconColor: 'text-brand-600' },
          { label: 'Postulantes', value: students.length, icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Postulaciones', value: applications.length, icon: FileText, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Tasa Aceptacion', value: `${acceptanceRate}%`, icon: TrendingUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(suspendedInstitutions > 0 || suspendedStudents > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {suspendedInstitutions > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">{suspendedInstitutions} institucion{suspendedInstitutions !== 1 ? 'es' : ''} suspendida{suspendedInstitutions !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500">Revisa el estado en la pestana Instituciones</p>
              </div>
            </div>
          )}
          {suspendedStudents > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700">{suspendedStudents} postulante{suspendedStudents !== 1 ? 's' : ''} suspendido{suspendedStudents !== 1 ? 's' : ''}</p>
                <p className="text-xs text-amber-500">Revisa el estado en la pestana Postulantes</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Postulaciones por Estado</h2>
        <div className="space-y-4">
          {[
            { label: 'Pendientes', count: pendingCount, color: 'bg-amber-500' },
            { label: 'Aceptadas', count: acceptedCount, color: 'bg-emerald-500' },
            { label: 'Rechazadas', count: rejectedCount, color: 'bg-red-500' },
          ].map((stat) => {
            const pct = applications.length > 0 ? (stat.count / applications.length) * 100 : 0;
            return (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                  <span className="text-sm font-bold text-slate-900">{stat.count}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Postulaciones Recientes</h2>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {applications.slice(0, 5).map((app) => {
            const st = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pendiente;
            const StatusIcon = st.icon;
            return (
              <div key={app.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-slate-600">
                    {app.name.charAt(0)}{app.last_name?.charAt(0) ?? ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {app.name} {app.last_name ?? ''}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {app.institutions?.name ?? 'Institucion'} - {new Date(app.created_at).toLocaleDateString('es-EC')}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.color} flex-shrink-0`}>
                  <StatusIcon className="w-3 h-3" />
                  {st.label}
                </span>
              </div>
            );
          })}
          {applications.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No hay postulaciones registradas</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Mensajes Totales</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalMessages}</p>
          <p className="text-sm text-slate-500 mt-1">Mensajes enviados en la plataforma</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-bold text-slate-900">Instituciones Activas</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {institutions.filter((i) => i.is_published !== false && !i.is_suspended).length}
          </p>
          <p className="text-sm text-slate-500 mt-1">Instituciones publicadas y no suspendidas</p>
        </div>
      </div>
    </div>
  );

  const renderInstitutions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instituciones</h1>
          <p className="text-sm text-slate-500 mt-1">{institutions.length} instituciones registradas</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar institucion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-brand-50/40">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Institucion</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Tipo</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Contacto</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">Ubicacion</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitutions.map((inst) => (
                <tr key={inst.id} className="border-b border-slate-50 hover:bg-brand-50/40/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{inst.name}</p>
                        <p className="text-xs text-slate-400 truncate">{inst.email || 'Sin correo'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{inst.institution_type || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600">{inst.phone || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-600">{inst.location || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {inst.is_suspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                        <ShieldAlert className="w-3 h-3" />
                        Suspendida
                      </span>
                    ) : inst.is_published !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="w-3 h-3" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                        <ToggleLeft className="w-3 h-3" />
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {canManageInstitutions ? (
                      <button
                        onClick={() => toggleInstitutionSuspend(inst.id, inst.is_suspended)}
                        disabled={actionLoading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          inst.is_suspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {inst.is_suspended ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Reactivar
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" /> Suspender
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInstitutions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-slate-400">
                    No se encontraron instituciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Postulantes</h1>
          <p className="text-sm text-slate-500 mt-1">{students.length} estudiantes registrados</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar postulante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((stu) => {
          const stuApps = applications.filter((a) => a.email.toLowerCase() === stu.email.toLowerCase());
          return (
            <div key={stu.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {stu.name.charAt(0)}{stu.last_name?.charAt(0) ?? ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {stu.name} {stu.last_name ?? ''}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{stu.email}</p>
                  {stu.is_suspended && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-100 text-red-700">
                      <ShieldAlert className="w-2.5 h-2.5" /> Suspendido
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(stu.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-semibold rounded-lg text-xs">
                  {stuApps.length} postulacion{stuApps.length !== 1 ? 'es' : ''}
                </span>
              </div>
              {canManageStudents ? (
                <button
                  onClick={() => toggleStudentSuspend(stu.id, stu.is_suspended)}
                  disabled={actionLoading}
                  className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                    stu.is_suspended
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {stu.is_suspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
                </button>
              ) : (
                <p className="mt-3 text-center text-xs text-slate-400">Solo lectura</p>
              )}
            </div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-400">
            No se encontraron postulantes
          </div>
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Postulaciones</h1>
          <p className="text-sm text-slate-500 mt-1">{applications.length} postulaciones en monitoreo - solo lectura</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aceptada">Aceptadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-brand-50/40">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estudiante</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Institucion</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Nivel</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Ver</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => {
                const st = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pendiente;
                const StatusIcon = st.icon;
                return (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-brand-50/40/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-600">
                            {app.name.charAt(0)}{app.last_name?.charAt(0) ?? ''}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {app.name} {app.last_name ?? ''}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{app.institutions?.name ?? 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{app.educational_level}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm text-slate-400">
                    No se encontraron postulaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => {
    const instAppCounts = institutions.map((inst) => ({
      name: inst.name,
      count: applications.filter((a) => a.institution_id === inst.id).length,
    })).sort((a, b) => b.count - a.count).slice(0, 8);
    const maxCount = Math.max(...instAppCounts.map((i) => i.count), 1);

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const appsLast30 = applications.filter((a) => new Date(a.created_at) >= last30).length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Metricas y estadisticas de la plataforma</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Ultimos 30 dias', value: appsLast30, icon: Clock, bg: 'bg-blue-100', color: 'text-blue-600' },
            { label: 'Tasa Aceptacion', value: `${acceptanceRate}%`, icon: TrendingUp, bg: 'bg-emerald-100', color: 'text-emerald-600' },
            { label: 'Suspendidas', value: suspendedInstitutions, icon: ShieldAlert, bg: 'bg-red-100', color: 'text-red-600' },
            { label: 'Mensajes', value: totalMessages, icon: MessageSquare, bg: 'bg-amber-100', color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top institutions by applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Top Instituciones por Postulaciones</h2>
          {instAppCounts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Sin datos suficientes</p>
          ) : (
            <div className="space-y-4">
              {instAppCounts.map((inst, idx) => (
                <div key={inst.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      {inst.name}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{inst.count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${(inst.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Distribucion de Estados</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pendientes', count: pendingCount, bg: 'bg-amber-50', color: 'text-amber-700' },
              { label: 'Aceptadas', count: acceptedCount, bg: 'bg-emerald-50', color: 'text-emerald-700' },
              { label: 'Rechazadas', count: rejectedCount, bg: 'bg-red-50', color: 'text-red-700' },
            ].map((s) => (
              <div key={s.label} className={`p-4 rounded-xl ${s.bg}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-slate-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={() => {
            const csv = [
              ['Nombre', 'Apellido', 'Email', 'Estado', 'Nivel', 'Institucion', 'Fecha'],
              ...filteredApplications.map((a) => [
                a.name,
                a.last_name ?? '',
                a.email,
                a.status,
                a.educational_level,
                a.institutions?.name ?? '',
                new Date(a.created_at).toLocaleDateString('es-EC'),
              ]),
            ].map((row) => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-postulaciones-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('success', 'Reporte CSV descargado.');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar postulaciones a CSV
        </button>
      </div>
    );
  };

  const renderActivity = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registro de Actividad</h1>
        <p className="text-sm text-slate-500 mt-1">Auditoria de acciones administrativas</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activityLog.length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activityLog.map((log) => {
              const actionLabel: Record<string, string> = {
                institution_suspend: 'Suspendio institucion',
                institution_activate: 'Reactivo institucion',
                student_suspend: 'Suspendio postulante',
                student_activate: 'Reactivo postulante',
                application_status: 'Actualizo postulacion',
              };
              const actionColor: Record<string, string> = {
                institution_suspend: 'text-red-600',
                institution_activate: 'text-emerald-600',
                student_suspend: 'text-red-600',
                student_activate: 'text-emerald-600',
                application_status: 'text-blue-600',
              };
              return (
                <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-50/40/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Activity className={`w-4 h-4 ${actionColor[log.action] || 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      <span className="font-semibold">{log.admin_name}</span>{' '}
                      <span className={actionColor[log.action] || 'text-slate-600'}>
                        {actionLabel[log.action] || log.action}
                      </span>
                      {log.details && <span className="text-slate-500"> - {log.details}</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString('es-EC', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:block capitalize">
                    {log.target_type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-500 mt-1">Configuracion del panel de administracion</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-400" />
          Cuenta de Administrador
        </h2>
        <div className="p-4 bg-brand-50/40 rounded-xl">
          <p className="font-semibold text-slate-900">{admin.name}</p>
          <p className="text-sm text-slate-500 mt-1">Usuario: @{admin.username}</p>
          <p className="text-xs text-slate-400 mt-1">ID: {admin.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-400" />
          Seguridad
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Verificacion de servidor activa</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Todas las acciones se verifican contra la base de datos. El acceso por URL no concede permisos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brand-50/40 rounded-xl">
            <Activity className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">Registro de auditoria</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Las acciones de suspender, reactivar y cambiar estados quedan registradas en el log de actividad.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Cerrar sesion</h2>
        <p className="text-sm text-slate-500 mb-4">
          Termina tu sesion de administrador y vuelve al inicio publico.
        </p>
        <button
          onClick={onExit}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Salir del panel
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50/40">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando panel de administracion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50/40 flex">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[200] animate-scale-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-40 transition-transform duration-300 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="px-6 py-5 border-b border-slate-100">
          <EduConnetLogo size="md" variant="light" />
        </div>

        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{admin.name}</p>
              <p className="text-xs text-slate-500">Equipo Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearchTerm(''); setStatusFilter('all'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            Salir del Admin
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-sm font-semibold text-slate-700">Panel de Equipo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">Acceso verificado</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'institutions' && renderInstitutions()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'applications' && renderApplications()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>
      <AppDetailDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />
    </div>
  );
}
