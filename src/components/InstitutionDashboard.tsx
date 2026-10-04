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
  onNotifications: () => void;
  onExit: () => void;
  updatingId: string | null;
  unreadMessages?: number;
  unreadNotifications?: number;
}

type Tab = 'dashboard' | 'applications' | 'messages' | 'notifications' | 'profile' | 'settings';

export function InstitutionDashboard({
  applications,
  institutionName,
  onViewAllApplications,
  onUpdateStatus,
  onProfile,
  onMessages,
  onNotifications,
  onSettings,
  onExit,
  updatingId,
  unreadMessages = 0,
  unreadNotifications = 0,
}: InstitutionDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  const total    = applications.length;
  const pending  = applications.filter((a) => a.status === 'pendiente').length;
  const accepted = applications.filter((a) => a.status === 'aceptada').length;
  const rejected = applications.filter((a) => a.status === 'rechazada').length;

  const acceptanceRate = total > 0
    ? Math.round((accepted / (accepted + rejected || 1)) * 100)
    : 0;

  const filteredApplications =
    filterStatus === 'all' ? applications : applications.filter((a) => a.status === filterStatus);

  const recentApplications = filteredApplications.slice(0, 5);

  const pendingToday = applications.filter((a) => {
    return a.status === 'pendiente' && new Date(a.created_at).toDateString() === new Date().toDateString();
  }).length;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setAccountMenuOpen(false);
    if (tab === 'applications')  onViewAllApplications();
    else if (tab === 'profile')  onProfile();
    else if (tab === 'settings') onSettings();
    else if (tab === 'messages') onMessages();
    else if (tab === 'notifications') onNotifications();
  };

  const navItems = [
    { id: 'dashboard'     as Tab, label: 'Dashboard',      icon: BarChart3 },
    { id: 'applications'  as Tab, label: 'Postulaciones',  icon: FileText,      badge: total },
    { id: 'messages'      as Tab, label: 'Mensajes',       icon: MessageSquare, badge: unreadMessages },
    { id: 'notifications' as Tab, label: 'Notificaciones', icon: Bell,          badge: unreadNotifications },
    { id: 'profile'       as Tab, label: 'Perfil',         icon: Building2 },
    { id: 'settings'      as Tab, label: 'Ajustes',        icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <EduConnetLogo size="md" variant="dark" />
      </div>

      {/* Institution chip */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{institutionName || 'Institucion'}</p>
            <p className="text-[#5EEAD4] text-[10px]">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              style={{ animationDelay: `${i * 0.05}s` }}
              className={`animate-slide-in-left w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-spring ${
                active
                  ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                  active ? 'bg-white/25 text-white' : 'bg-[#0D9488]/80 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Acceptance rate widget */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-white/8 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[#5EEAD4] text-xs font-semibold uppercase tracking-wider">Aceptacion</p>
          <span className="text-xs font-bold text-white bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            {acceptanceRate}%
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#14B8A6] to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${acceptanceRate}%` }}
          />
        </div>
        <div className="grid grid-cols-3 text-center gap-1">
          {[
            { v: pending, label: 'Pend', c: 'text-amber-400' },
            { v: accepted, label: 'Acept', c: 'text-emerald-400' },
            { v: rejected, label: 'Rech', c: 'text-red-400' },
          ].map((s) => (
            <div key={s.label}>
              <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="px-3 pb-4 relative">
        <button
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 border border-white/10 hover:bg-white/15 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">Mi Cuenta</p>
            <p className="text-xs text-white/50 truncate">{institutionName || 'Institucion'}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${accountMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {accountMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl py-1 z-10 animate-scale-in">
            <button
              onClick={onExit}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg mx-1"
              style={{ width: 'calc(100% - 8px)' }}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesion
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col z-40">
        <div
          className="flex grow flex-col overflow-hidden"
          style={{ background: 'linear-gradient(165deg, #1E293B 0%, #0F172A 60%, #0F172A 100%)' }}
        >
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors btn-spring"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <EduConnetLogo size="sm" variant="light" />
          <button className="relative p-2 -mr-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-6 h-6 text-slate-700" />
            {pending > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {pending}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(165deg, #1E293B 0%, #0F172A 60%, #0F172A 100%)' }}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Main */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold rounded-lg">Panel Admin</span>
                {pendingToday > 0 && (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg flex items-center gap-1 animate-scale-in">
                    <AlertCircle className="w-3 h-3" />
                    {pendingToday} nuevas hoy
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Panel de Control</h1>
              <p className="text-slate-500 mt-1 text-sm">Gestiona postulaciones y el perfil de tu institucion.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onProfile}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#134E4A] hover:bg-[#0D9488] text-white text-sm font-medium rounded-xl transition-all btn-spring shadow-lg shadow-[#134E4A]/20"
              >
                <Settings className="w-4 h-4" />
                Editar Perfil
              </button>
              <button
                onClick={() => handleTabChange('messages')}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-[#0D9488]/10 hover:bg-[#0D9488]/20 text-[#0D9488] text-sm font-medium rounded-xl transition-all btn-spring"
              >
                <MessageSquare className="w-4 h-4" />
                Mensajes
                {unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {unreadMessages}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { title: 'Total', value: total,    icon: Users,         color: 'blue',   sub: 'Postulaciones' },
              { title: 'Pendientes', value: pending,  icon: Clock,         color: 'amber',  sub: 'Por revisar', onClick: () => setFilterStatus('pendiente') },
              { title: 'Aceptadas', value: accepted, icon: CheckCircle,   color: 'green',  sub: 'Aprobadas',   onClick: () => setFilterStatus('aceptada') },
              { title: 'Rechazadas', value: rejected, icon: XCircle,       color: 'red',    sub: 'Declinadas',  onClick: () => setFilterStatus('rechazada') },
            ].map((s, i) => (
              <div
                key={s.title}
                onClick={s.onClick}
                style={{ animationDelay: `${i * 0.08}s` }}
                className={`animate-slide-up bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm spring-hover ${s.onClick ? 'cursor-pointer' : ''} ${s.color === 'amber' && pending > 0 ? 'ring-2 ring-amber-300/60 ring-offset-1' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    s.color === 'blue' ? 'bg-[#0D9488]/10' :
                    s.color === 'amber' ? 'bg-amber-100' :
                    s.color === 'green' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <s.icon className={`w-5 h-5 ${
                      s.color === 'blue' ? 'text-[#0D9488]' :
                      s.color === 'amber' ? 'text-amber-600' :
                      s.color === 'green' ? 'text-emerald-600' : 'text-red-500'
                    }`} />
                  </div>
                  {s.color === 'blue' && total > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />Activo
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{s.title}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: UserCheck, iconBg: 'bg-[#0D9488]',
                cardBg: 'from-[#F0FDFA] to-white border-[#99F6E4]/40',
                title: 'Proceso de Revision',
                sub: 'Tiempo de respuesta',
                text: 'Responde las postulaciones en menos de 5 dias habiles para mejorar la experiencia del postulante.',
              },
              {
                icon: TrendingUp, iconBg: 'bg-emerald-600',
                cardBg: 'from-emerald-50 to-white border-emerald-100',
                title: 'Tasa de Aceptacion',
                sub: 'Metrica de eficiencia',
                text: `${acceptanceRate}% de postulaciones han sido aceptadas`,
              },
              {
                icon: AlertCircle, iconBg: 'bg-amber-500',
                cardBg: 'from-amber-50 to-white border-amber-100',
                title: 'Pendientes Hoy',
                sub: 'Nuevas postulaciones',
                text: `${pendingToday} postulacion${pendingToday !== 1 ? 'es' : ''} nueva${pendingToday !== 1 ? 's' : ''} hoy`,
              },
            ].map((c, i) => (
              <div
                key={c.title}
                style={{ animationDelay: `${0.2 + i * 0.07}s` }}
                className={`animate-slide-up bg-gradient-to-br ${c.cardBg} rounded-2xl p-5 border spring-hover`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.sub}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Applications Table */}
          <div className="animate-slide-up bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Postulaciones Recientes</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Revisa y gestiona las postulaciones recibidas</p>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-[#F0FDFA] border border-[#99F6E4]/50 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] appearance-none cursor-pointer transition-all"
                  >
                    <option value="all">Todas ({total})</option>
                    <option value="pendiente">Pendientes ({pending})</option>
                    <option value="aceptada">Aceptadas ({accepted})</option>
                    <option value="rechazada">Rechazadas ({rejected})</option>
                  </select>
                </div>
              </div>
            </div>

            {recentApplications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app, i) => (
                  <div
                    key={app.id}
                    style={{ animationDelay: `${0.35 + i * 0.06}s` }}
                    className="animate-fade-in"
                  >
                    <ApplicationRow
                      application={app}
                      onUpdateStatus={onUpdateStatus}
                      updatingId={updatingId}
                      onSendMessage={(id) => onMessages(id)}
                      onViewDetail={() => setDetailApp(app)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-[#F0FDFA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#0D9488]/40" />
                </div>
                <p className="text-slate-500 font-medium">No hay postulaciones</p>
                <p className="text-sm text-slate-400 mt-1">Las nuevas postulaciones apareceran aqui automaticamente.</p>
              </div>
            )}

            {applications.length > 5 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={onViewAllApplications}
                  className="w-full py-2.5 text-sm font-semibold text-[#0D9488] hover:text-[#0F766E] bg-white hover:bg-[#F0FDFA] rounded-xl border border-[#99F6E4]/50 flex items-center justify-center gap-1 transition-all btn-spring"
                >
                  Ver todas las postulaciones ({applications.length})
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/50 z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all btn-spring ${
                  active ? 'text-[#0D9488]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-[#0D9488]/10' : ''}`}>
                  <item.icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-semibold leading-tight ${active ? 'text-[#0D9488]' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {detailApp && (
        <ApplicationDetailModal
          application={detailApp}
          onClose={() => setDetailApp(null)}
          onUpdateStatus={onUpdateStatus}
          onMessage={(id) => onMessages(id)}
          updating={updatingId === detailApp.id}
        />
      )}
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
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
    aceptada:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aceptada' },
    rechazada: { bg: 'bg-red-100', text: 'text-red-600', label: 'Rechazada' },
  };
  const style = statusStyles[application.status];
  const isUpdating = updatingId === application.id;

  return (
    <div className="p-5 hover:bg-[#F0FDFA]/30 transition-colors duration-200 group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#134E4A] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200">
          <span className="text-white font-bold text-sm">
            {application.name.charAt(0)}{application.last_name?.charAt(0) || ''}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base">
                {application.name} {application.last_name || ''}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${application.email}`} className="hover:text-[#0D9488] transition-colors">{application.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${application.phone}`} className="hover:text-[#0D9488] transition-colors">{application.phone}</a>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0FDFA] rounded-lg text-xs font-medium text-[#0D9488]">
                  <GraduationCap className="w-3 h-3" />
                  {application.educational_level}
                </span>
                {application.identity_document && (
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    Doc: {application.identity_document}
                  </span>
                )}
                {application.address && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    <MapPin className="w-3 h-3" />{application.address}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button onClick={onViewDetail} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-all btn-spring">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver Detalle</span>
                </button>
                <button onClick={() => onSendMessage(application.id)} className="flex items-center gap-1.5 px-3 py-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] text-xs font-medium rounded-lg transition-all btn-spring">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mensaje</span>
                </button>
                {isUpdating && <div className="w-4 h-4 border-2 border-[#0D9488]/30 border-t-[#0D9488] rounded-full animate-spin ml-1" />}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs text-slate-400">
              {new Date(application.created_at).toLocaleString('es-EC', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
