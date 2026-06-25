import { useState } from 'react';
import { Application } from '../types';
import { EduConnetLogo } from './EduConnetLogo';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Building2,
  Settings,
  BarChart3,
  Menu,
  X,
  Bell,
  ChevronRight,
  Filter,
  LogOut,
  UserCheck,
  UserX,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  Eye,
} from 'lucide-react';

interface InstitutionDashboardProps {
  applications: Application[];
  institutionName: string;
  onViewAllApplications: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onProfile: () => void;
  onSettings: () => void;
  onMessages: (applicationId?: string) => void;
  onExit: () => void;
  updatingId: string | null;
  unreadMessages?: number;
}

type Tab = 'dashboard' | 'applications' | 'messages' | 'profile' | 'settings';

export function InstitutionDashboard({
  applications,
  institutionName,
  onViewAllApplications,
  onUpdateStatus,
  onProfile,
  onMessages,
  onExit,
  updatingId,
  unreadMessages = 0,
}: InstitutionDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'pendiente').length;
  const accepted = applications.filter((a) => a.status === 'aceptada').length;
  const rejected = applications.filter((a) => a.status === 'rechazada').length;

  const acceptanceRate =
    total > 0 ? Math.round((accepted / (accepted + rejected || 1)) * 100) : 0;

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const recentApplications = filteredApplications.slice(0, 5);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setAccountMenuOpen(false);

    if (tab === 'applications') {
      onViewAllApplications();
    } else if (tab === 'profile') {
      onProfile();
    } else if (tab === 'settings') {
      onSettings();
    } else if (tab === 'messages') {
      onMessages();
    }
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'applications' as Tab, label: 'Postulaciones', icon: FileText, badge: total },
    { id: 'messages' as Tab, label: 'Mensajes', icon: MessageSquare, badge: unreadMessages },
    { id: 'profile' as Tab, label: 'Perfil', icon: Building2 },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings },
  ];

  const pendingToday = applications.filter((a) => {
    const appDate = new Date(a.created_at).toDateString();
    const today = new Date().toDateString();
    return a.status === 'pendiente' && appDate === today;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white border-r border-slate-200 px-5 pb-6">
          {/* Logo */}
          <div className="flex items-center gap-3 py-5 border-b border-slate-100">
            <EduConnetLogo size="md" variant="light" />
          </div>
          {/* Institution name */}
          <div className="flex items-center gap-2 py-3 px-1">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-slate-900 block truncate">
                {institutionName || 'Institucion'}
              </span>
              <span className="text-xs text-slate-500">Panel Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-5">
            <ul className="flex flex-1 flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Quick Stats */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Tasa de Aceptacion
                </p>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  {acceptanceRate}%
                </span>
              </div>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${acceptanceRate}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-amber-400">{pending}</p>
                  <p className="text-[10px] text-slate-400">Pend</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-400">{accepted}</p>
                  <p className="text-[10px] text-slate-400">Acept</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-400">{rejected}</p>
                  <p className="text-[10px] text-slate-400">Rech</p>
                </div>
              </div>
            </div>

            {/* Mi Cuenta */}
            <div className="mt-6 relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-900 truncate">Mi Cuenta</p>
                  <p className="text-xs text-slate-500 truncate">{institutionName || 'Institucion'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-10">
                  <button
                    onClick={onExit}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesion
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <EduConnetLogo size="sm" variant="light" />
          <button className="relative p-2 -mr-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-6 h-6 text-slate-700" />
            {pending > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pending}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <EduConnetLogo size="sm" variant="light" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 -mr-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeTab === item.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Mi Cuenta</p>
                <p className="text-xs text-slate-500 truncate">{institutionName}</p>
              </div>
            </div>
            <button
              onClick={() => { setSidebarOpen(false); onExit(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                  Panel Admin
                </span>
                {pendingToday > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {pendingToday} nuevas hoy
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                Panel de Control
              </h1>
              <p className="text-slate-500 mt-1">
                Gestiona las postulaciones y el perfil de tu institucion.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onProfile}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-lg"
              >
                <Settings className="w-4 h-4" />
                Editar Perfil
              </button>
              <button
                onClick={() => handleTabChange('messages')}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Mensajes
                {unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Postulaciones"
              value={total}
              icon={Users}
              color="slate"
              trend={total > 0}
              subtitle="Recibidas"
            />
            <StatCard
              title="Pendientes"
              value={pending}
              icon={Clock}
              color="yellow"
              highlight={pending > 0}
              onClick={() => setFilterStatus('pendiente')}
              subtitle="Por revisar"
            />
            <StatCard
              title="Aceptadas"
              value={accepted}
              icon={CheckCircle}
              color="green"
              onClick={() => setFilterStatus('aceptada')}
              subtitle="Aprobadas"
            />
            <StatCard
              title="Rechazadas"
              value={rejected}
              icon={XCircle}
              color="red"
              onClick={() => setFilterStatus('rechazada')}
              subtitle="Declinadas"
            />
          </div>

          {/* Quick Info Cards */}
          <div className="grid lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Proceso de Revision</p>
                  <p className="text-xs text-slate-500">Tiempo de respuesta</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Responde las postulaciones en menos de 5 dias habiles para mejorar la experiencia del postulante.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Tasa de Aceptacion</p>
                  <p className="text-xs text-slate-500">Metrica de eficiencia</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{acceptanceRate}%</span>
                <span className="text-xs text-slate-500">de postulaciones aceptadas</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Pendientes Hoy</p>
                  <p className="text-xs text-slate-500">Nuevas postulaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{pendingToday}</span>
                <span className="text-xs text-slate-500">postulaciones nuevas</span>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Postulaciones Recientes
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Revisa y gestiona las postulaciones recibidas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/20 appearance-none cursor-pointer"
                    >
                      <option value="all">Todas ({total})</option>
                      <option value="pendiente">Pendientes ({pending})</option>
                      <option value="aceptada">Aceptadas ({accepted})</option>
                      <option value="rechazada">Rechazadas ({rejected})</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {recentApplications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    application={app}
                    onUpdateStatus={onUpdateStatus}
                    updatingId={updatingId}
                    onSendMessage={(id) => onMessages(id)}
                    onViewDetail={() => setDetailApp(app)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No hay postulaciones</p>
                <p className="text-sm text-slate-400 mt-1">
                  {filterStatus === 'all'
                    ? 'Las nuevas postulaciones apareceran aqui'
                    : `No hay postulaciones ${filterStatus}s`}
                </p>
              </div>
            )}

            {applications.length > 5 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={onViewAllApplications}
                  className="w-full py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors hover:bg-slate-50"
                >
                  Ver todas las postulaciones ({applications.length})
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/50 z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-colors ${
                activeTab === item.id ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {detailApp && (
        <ApplicationDetailModal
          application={detailApp}
          onClose={() => setDetailApp(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  highlight,
  trend,
  onClick,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'slate' | 'yellow' | 'green' | 'red';
  highlight?: boolean;
  trend?: boolean;
  onClick?: () => void;
  subtitle: string;
}) {
  const colorClasses = {
    slate: { bg: 'bg-slate-100', icon: 'text-slate-700', badge: 'bg-slate-500' },
    yellow: { bg: 'bg-amber-100', icon: 'text-amber-700', badge: 'bg-amber-500' },
    green: { bg: 'bg-emerald-100', icon: 'text-emerald-700', badge: 'bg-emerald-500' },
    red: { bg: 'bg-red-100', icon: 'text-red-700', badge: 'bg-red-500' },
  };

  const style = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all ${
        highlight ? 'ring-2 ring-offset-2 ring-amber-300' : ''
      } ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.bg}`}>
          <Icon className={`w-6 h-6 ${style.icon}`} />
        </div>
        <div className="flex items-center gap-2">
          {trend && value > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Activo
            </span>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500 mt-0.5">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function ApplicationRow({
  application,
  onUpdateStatus,
  updatingId,
  onSendMessage,
  onViewDetail,
}: {
  application: Application;
  onUpdateStatus: (id: string, status: string) => void;
  updatingId: string | null;
  onSendMessage: (applicationId: string) => void;
  onViewDetail: () => void;
}) {
  const statusStyles = {
    pendiente: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: 'Pendiente',
    },
    aceptada: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      label: 'Aceptada',
    },
    rechazada: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Rechazada',
    },
  };

  const style = statusStyles[application.status];
  const isUpdating = updatingId === application.id;

  return (
    <div className="p-5 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-semibold text-sm">
            {application.name.charAt(0)}
            {application.last_name?.charAt(0) || ''}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-lg">
                {application.name} {application.last_name || ''}
              </h3>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${application.email}`} className="hover:text-slate-900 transition-colors">
                    {application.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${application.phone}`} className="hover:text-slate-900 transition-colors">
                    {application.phone}
                  </a>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg text-xs font-medium text-blue-700">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {application.educational_level}
                </span>
                {application.identity_document && (
                  <span className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    Doc: {application.identity_document}
                  </span>
                )}
                {application.address && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    <MapPin className="w-3.5 h-3.5" />
                    {application.address}
                  </span>
                )}
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col sm:items-end gap-3">
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${style.bg} ${style.text}`}
              >
                {style.label}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onViewDetail}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  title="Ver formulario completo"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver Formulario</span>
                </button>
                <button
                  onClick={() => onSendMessage(application.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                  title="Enviar mensaje al postulante"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Mensaje</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(application.id, 'aceptada')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  title="Aceptar postulacion"
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Aceptar</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(application.id, 'rechazada')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  title="Rechazar postulacion"
                >
                  <UserX className="w-4 h-4" />
                  <span className="hidden sm:inline">Rechazar</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(application.id, 'pendiente')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  title="Marcar como pendiente"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Enviada: {new Date(application.created_at).toLocaleString('es-EC', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
