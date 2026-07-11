import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { EduConnetLogo } from './EduConnetLogo';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Bell,
  Search,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface AdminPanelProps {
  onExit: () => void;
}

type Tab = 'dashboard' | 'institutions' | 'students' | 'applications' | 'messages';

interface AdminInstitution {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  institution_type: string;
  created_at: string;
  is_published?: boolean;
}

interface AdminStudent {
  id: string;
  name: string;
  last_name: string;
  email: string;
  cedula: string;
  created_at: string;
}

interface AdminApplication {
  id: string;
  name: string;
  last_name: string;
  email: string;
  status: string;
  educational_level: string;
  created_at: string;
  institution_id: string;
  institutions?: { name: string };
}

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  aceptada:  { label: 'Aceptada',  color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: 'text-red-700',     bg: 'bg-red-100',     icon: XCircle },
};

export function AdminPanel({ onExit }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [instRes, stuRes, appRes, msgRes] = await Promise.all([
      supabase.from('institutions').select('*').order('created_at', { ascending: false }),
      supabase.from('student_accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('*, institutions(name)').order('created_at', { ascending: false }),
      supabase.from('application_messages').select('*', { count: 'exact', head: true }),
    ]);

    if (instRes.data) setInstitutions(instRes.data as AdminInstitution[]);
    if (stuRes.data) setStudents(stuRes.data as AdminStudent[]);
    if (appRes.data) setApplications(appRes.data as AdminApplication[]);
    setTotalMessages(msgRes.count || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const adminInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('edu_admin') || '{}');
    } catch {
      return {};
    }
  })();

  const navItems = [
    { id: 'dashboard'    as Tab, label: 'Dashboard',      icon: BarChart3 },
    { id: 'institutions' as Tab, label: 'Instituciones',  icon: Building2, badge: institutions.length },
    { id: 'students'     as Tab, label: 'Postulantes',    icon: Users,     badge: students.length },
    { id: 'applications' as Tab, label: 'Postulaciones',  icon: FileText,  badge: applications.length },
    { id: 'messages'     as Tab, label: 'Mensajes',       icon: MessageSquare, badge: totalMessages },
  ];

  const pendingCount = applications.filter((a) => a.status === 'pendiente').length;
  const acceptedCount = applications.filter((a) => a.status === 'aceptada').length;
  const rejectedCount = applications.filter((a) => a.status === 'rechazada').length;
  const acceptanceRate = applications.length > 0 ? Math.round((acceptedCount / applications.length) * 100) : 0;

  const toggleInstitutionPublish = async (id: string, current: boolean) => {
    await supabase.from('institutions').update({ is_published: !current }).eq('id', id);
    fetchData();
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    await supabase.rpc('notify_status_change', { p_application_id: id, p_new_status: status });
    fetchData();
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      `${app.name} ${app.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard General</h1>
        <p className="text-sm text-slate-500 mt-1">Vision global de la plataforma EduConnet</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Instituciones', value: institutions.length, icon: Building2, bg: 'from-brand-500 to-brand-700', iconBg: 'bg-brand-100', iconColor: 'text-brand-600' },
          { label: 'Postulantes', value: students.length, icon: Users, bg: 'from-blue-500 to-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Postulaciones', value: applications.length, icon: FileText, bg: 'from-amber-500 to-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Tasa Aceptacion', value: `${acceptanceRate}%`, icon: TrendingUp, bg: 'from-emerald-500 to-emerald-700', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
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

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Postulaciones por Estado</h2>
        <div className="space-y-4">
          {[
            { label: 'Pendientes', count: pendingCount, total: applications.length, color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-100' },
            { label: 'Aceptadas', count: acceptedCount, total: applications.length, color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-100' },
            { label: 'Rechazadas', count: rejectedCount, total: applications.length, color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-100' },
          ].map((stat) => {
            const pct = applications.length > 0 ? (stat.count / applications.length) * 100 : 0;
            return (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                  <span className="text-sm font-bold text-slate-900">{stat.count}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
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

      {/* Quick stats */}
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
            {institutions.filter((i) => i.is_published !== false).length}
          </p>
          <p className="text-sm text-slate-500 mt-1">Instituciones publicadas en la plataforma</p>
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
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Institucion</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Tipo</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Contacto</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">Ubicacion</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitutions.map((inst) => (
                <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
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
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleInstitutionPublish(inst.id, inst.is_published !== false)}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                    >
                      {inst.is_published !== false ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <ToggleRight className="w-6 h-6" />
                          Activa
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <ToggleLeft className="w-6 h-6" />
                          Inactiva
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInstitutions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm text-slate-400">
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
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((stu) => {
          const stuApps = applications.filter((a) => a.email.toLowerCase() === stu.email.toLowerCase());
          return (
            <div key={stu.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {stu.name.charAt(0)}{stu.last_name?.charAt(0) ?? ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {stu.name} {stu.last_name ?? ''}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{stu.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {new Date(stu.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-semibold rounded-lg">
                  {stuApps.length} postulacion{stuApps.length !== 1 ? 'es' : ''}
                </span>
              </div>
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
          <p className="text-sm text-slate-500 mt-1">{applications.length} postulaciones totales</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estudiante</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Institucion</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Nivel</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => {
                const st = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pendiente;
                const StatusIcon = st.icon;
                return (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {app.status !== 'aceptada' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'aceptada')}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Aceptar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {app.status !== 'rechazada' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'rechazada')}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {app.status === 'aceptada' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'pendiente')}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                            title="Marcar pendiente"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

  const renderMessages = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mensajes</h1>
        <p className="text-sm text-slate-500 mt-1">Estadisticas de mensajeria en la plataforma</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalMessages}</p>
          <p className="text-sm text-slate-500 mt-0.5">Mensajes Totales</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{students.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Postulantes Activos</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-11 h-11 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{institutions.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Instituciones</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Resumen de Actividad</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <span className="text-sm text-slate-600">Postulaciones con mensajes</span>
            <span className="text-sm font-bold text-slate-900">
              {new Set(applications.map((a) => a.id)).size} conversaciones
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <span className="text-sm text-slate-600">Promedio de mensajes por postulacion</span>
            <span className="text-sm font-bold text-slate-900">
              {applications.length > 0 ? (totalMessages / applications.length).toFixed(1) : '0'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-600">Postulaciones pendientes</span>
            <span className="text-sm font-bold text-amber-700">{pendingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando panel de administracion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{adminInfo.name || 'Administrador'}</p>
              <p className="text-xs text-slate-500">Admin General</p>
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
                  active
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
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
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Panel de Administracion
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">Sistema activo</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {adminInfo.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'institutions' && renderInstitutions()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'applications' && renderApplications()}
            {activeTab === 'messages' && renderMessages()}
          </div>
        </main>
      </div>
    </div>
  );
}
